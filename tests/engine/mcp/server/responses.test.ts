import { afterEach, describe, expect, test } from 'bun:test'

import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client'
import { fromUint8Array } from 'js-base64'
import * as v from 'valibot'

import { SceneGraph } from '@kalka/scene-graph'

import { startServer, type ServerHandle } from '#mcp/server'
import { DOCUMENT_META_KEY } from '#mcp/tool/response'
import type { MCPToolScope } from '#mcp/tool/scope'

import {
  MOCK_DOCUMENT,
  connectMockBrowser,
  tcpRequest,
  waitForBrowserRegistration,
  type MockBrowser
} from '#tests/helpers/mcp/server'

const AUTH_TOKEN = 'test-responses-token'
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3])
const ASSET_URL = /^http:\/\/127\.0\.0\.1:\d+\/assets\/[0-9a-f]{32}\.png$/

const Content = v.array(
  v.looseObject({
    type: v.string(),
    text: v.optional(v.string()),
    data: v.optional(v.string()),
    uri: v.optional(v.string()),
    mimeType: v.optional(v.string()),
    resource: v.optional(v.looseObject({ mimeType: v.string(), blob: v.string() }))
  })
)
type Content = v.InferOutput<typeof Content>

const Target = v.object({
  target: v.looseObject({
    documentId: v.string(),
    documentName: v.string(),
    path: v.optional(v.string()),
    pageId: v.string(),
    tokensHash: v.string()
  })
})

interface Context {
  handle: ServerHandle
  graph: SceneGraph
  browser: MockBrowser
  client: Client
}

let context: Context | null = null

afterEach(async () => {
  await context?.client.close().catch(() => undefined)
  context?.browser.close()
  await context?.handle.close()
  context = null
})

async function connect(scope: MCPToolScope = 'document'): Promise<Context> {
  const handle = await startServer({
    httpPort: 0,
    withTcp: true,
    socketPath: null,
    authToken: AUTH_TOKEN,
    scope,
    mcpRoot: null
  })
  const graph = new SceneGraph()
  const browser = await connectMockBrowser(handle.httpPort, graph, AUTH_TOKEN)
  await waitForBrowserRegistration(handle.httpPort)
  const client = new Client({ name: 'responses-test', version: '0.0.0' })
  await client.connect(
    new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${handle.httpPort}/mcp`), {
      requestInit: { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    })
  )
  context = { handle, graph, browser, client }
  return context
}

async function call(
  client: Client,
  name: string,
  args: Record<string, unknown> = {}
): Promise<{ content: Content; meta: unknown; isError: boolean }> {
  const result = await client.callTool({ name, arguments: args })
  return {
    content: v.parse(Content, result.content),
    meta: v.parse(v.optional(v.record(v.string(), v.unknown())), result._meta)?.[DOCUMENT_META_KEY],
    isError: result.isError === true
  }
}

function texts(content: Content): unknown[] {
  return content.flatMap((item) => (item.text ? [JSON.parse(item.text)] : []))
}

function screenshot(bytes: Uint8Array = PNG) {
  return {
    mimeType: 'image/png',
    base64: fromUint8Array(bytes),
    byteLength: bytes.length,
    width: 4
  }
}

describe('document identity in tool responses', () => {
  test('follows the result in its own block and in _meta, leaving the result as it was', async () => {
    const { client, graph } = await connect()
    const { content, meta } = await call(client, 'get_page_tree')

    const [result, identity] = texts(content)
    expect(result).not.toHaveProperty('target')
    const { target } = v.parse(Target, identity)
    expect(target).toMatchObject({
      ...MOCK_DOCUMENT,
      path: '/designs/mock.fig',
      pageId: graph.getPages()[0]?.id
    })
    expect(meta).toEqual(target)
  })

  test('tells an agent that the tokens changed since it last read them', async () => {
    const { client, graph } = await connect()
    const hash = async () =>
      v.parse(Target, texts((await call(client, 'get_page_tree')).content).at(-1)).target.tokensHash

    const before = await hash()
    expect(await hash()).toBe(before)
    graph.createVariable('gap', 'FLOAT', graph.createCollection('Spacing').id, 8)
    expect(await hash()).not.toBe(before)
  })

  test('leaves out the file path while only the selection is shared', async () => {
    const { client, browser } = await connect('selection')
    browser.toolResults.set('get_selection', { selection: [] })
    const { content } = await call(client, 'get_selection')
    const { target } = v.parse(Target, texts(content).at(-1))
    expect(target.documentId).toBe(MOCK_DOCUMENT.documentId)
    expect(target).not.toHaveProperty('path')
  })

  test('is not added to a call that failed', async () => {
    const { client } = await connect('selection')
    const failed = await call(client, 'export_image', { ids: ['x'], path: 'out.png' })
    expect(failed.isError).toBe(true)
    expect(failed.content).toHaveLength(1)
    expect(failed.meta).toBeUndefined()
  })
})

describe('files returned by tools', () => {
  test('stay inline for clients that show images, with a link to the server copy', async () => {
    const { client, browser } = await connect()
    browser.toolResults.set('get_screenshot', screenshot())
    const { content } = await call(client, 'get_screenshot')

    expect(content[0]).toMatchObject({ type: 'image', mimeType: 'image/png' })
    expect(content[0]?.data).toBe(fromUint8Array(PNG))
    expect(content[1]).toMatchObject({ type: 'resource_link', mimeType: 'image/png' })
    expect(content[1]?.uri).toMatch(ASSET_URL)
    expect(texts(content)[0]).toMatchObject({ width: 4, url: content[1]?.uri })
  })

  test('can be fetched from the link without the bearer token, until they expire', async () => {
    const { client, browser } = await connect()
    browser.toolResults.set('get_screenshot', screenshot())
    const { content } = await call(client, 'get_screenshot')
    const url = new URL(content[1]?.uri ?? '')

    const response = await fetch(url)
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('image/png')
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(PNG)

    const missing = await fetch(new URL(`/assets/${'0'.repeat(32)}.png`, url))
    expect(missing.status).toBe(404)
  })

  test('are refused to web pages and rebound hosts, like every other route', async () => {
    const { client, browser, handle } = await connect()
    browser.toolResults.set('get_screenshot', screenshot())
    const { content } = await call(client, 'get_screenshot')
    const path = new URL(content[1]?.uri ?? '').pathname

    const fromPage = await tcpRequest(handle.httpPort, 'GET', path, undefined, {
      Origin: 'https://evil.example'
    })
    expect(fromPage.status).toBe(403)
    const rebound = await tcpRequest(handle.httpPort, 'GET', path, undefined, {
      Host: 'evil.example'
    })
    expect(rebound.status).toBe(403)
  })

  test('come only as a link when the client asks for a URL', async () => {
    const { client, browser } = await connect()
    browser.toolResults.set('export_image', screenshot())
    const { content } = await call(client, 'export_image', { delivery: 'url' })

    expect(content.some((item) => item.type === 'image')).toBe(false)
    expect(content[0]?.uri).toMatch(ASSET_URL)
    const request = browser.requests.find((item) => item.command === 'tool')
    expect(request?.args).toMatchObject({ args: {} })
  })

  test('too large to inline come as a link instead of failing', async () => {
    const { client, browser } = await connect()
    browser.toolResults.set('get_screenshot', screenshot(new Uint8Array(1_000_000)))
    const { content, isError } = await call(client, 'get_screenshot')

    expect(isError).toBe(false)
    expect(content[0]?.type).toBe('resource_link')
    expect(texts(content)[0]).toMatchObject({ note: 'Too large to inline; fetch the URL' })
  })

  test('that are not images are embedded as files rather than as images', async () => {
    const { client, browser } = await connect()
    const pdf = new Uint8Array([0x25, 0x50, 0x44, 0x46])
    browser.toolResults.set('export_pdf', {
      mimeType: 'application/pdf',
      base64: fromUint8Array(pdf),
      byteLength: pdf.length
    })
    const { content } = await call(client, 'export_pdf')

    expect(content[0]).toMatchObject({ type: 'resource' })
    expect(content[0]?.resource).toMatchObject({ mimeType: 'application/pdf' })
    expect(content[1]?.uri).toMatch(/\/assets\/[0-9a-f]{32}\.pdf$/)
  })

  test('offer the delivery choice only on tools that return files', async () => {
    const { client } = await connect()
    const { tools } = await client.listTools()
    const takesDelivery = (name: string) =>
      Object.hasOwn(
        tools.find((tool) => tool.name === name)?.inputSchema.properties ?? {},
        'delivery'
      )
    expect(takesDelivery('get_screenshot')).toBe(true)
    expect(takesDelivery('export_image')).toBe(true)
    expect(takesDelivery('get_page_tree')).toBe(false)
  })
})
