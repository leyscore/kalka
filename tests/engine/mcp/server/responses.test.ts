import { afterEach, describe, expect, test } from 'bun:test'

import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client'
import { fromUint8Array } from 'js-base64'
import * as v from 'valibot'

import { SceneGraph } from '@kalka/scene-graph'

import { startServer, type ServerHandle } from '#mcp/server'
import { DOCUMENT_META_KEY } from '#mcp/tool/response'
import type { MCPToolScope } from '#mcp/tool/scope'

import {
  answerServerRequests,
  clientCapabilities,
  graphWithBoundCollection,
  graphWithDefaultNames,
  unsavedDocumentList,
  type ClientAnswers,
  type ClientRequests
} from '#tests/helpers/mcp/interaction'
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

describe('asking the client during a call', () => {
  const ASKING_TOKEN = 'test-asking-token'

  const AskingResult = v.object({
    content: v.tupleWithRest(
      [v.object({ type: v.literal('text'), text: v.string() })],
      v.unknown()
    ),
    isError: v.optional(v.boolean())
  })

  interface AskingContext {
    handle: ServerHandle
    browser: MockBrowser
    client: Client
    asked: ClientRequests
  }

  let asking: AskingContext | null = null

  afterEach(async () => {
    await asking?.client.close().catch(() => undefined)
    asking?.browser.close()
    await asking?.handle.close()
    asking = null
  })

  async function connectAsking(
    answers: ClientAnswers,
    graph = new SceneGraph(),
    supportedProtocolVersions?: string[]
  ): Promise<AskingContext> {
    const handle = await startServer({
      httpPort: 0,
      withTcp: true,
      socketPath: null,
      authToken: ASKING_TOKEN,
      mcpRoot: null
    })
    const browser = await connectMockBrowser(handle.httpPort, graph, ASKING_TOKEN)
    await waitForBrowserRegistration(handle.httpPort)
    const client = new Client(
      { name: 'interaction-test', version: '0.0.0' },
      { capabilities: clientCapabilities(answers), supportedProtocolVersions }
    )
    const asked = answerServerRequests(client, answers)
    await client.connect(
      new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${handle.httpPort}/mcp`), {
        requestInit: { headers: { Authorization: `Bearer ${ASKING_TOKEN}` } }
      })
    )
    asking = { handle, browser, client, asked }
    return asking
  }

  async function callAsking(client: Client, name: string, args: Record<string, unknown> = {}) {
    const result = v.parse(AskingResult, await client.callTool({ name, arguments: args }))
    return { body: JSON.parse(result.content[0].text) as unknown, isError: result.isError === true }
  }

  function commandArgs(browser: MockBrowser, command: string): unknown[] {
    return browser.requests.filter((request) => request.command === command).map((r) => r.args)
  }

  describe('closing a document with unsaved changes', () => {
    test('asks the user and closes the way they chose', async () => {
      const { client, browser, asked } = await connectAsking({ form: { unsaved: 'discard' } })
      browser.commandResults.set('list_documents', unsavedDocumentList('/designs/mock.fig'))

      const { body } = await callAsking(client, 'close_file')

      expect(body).toMatchObject({ closed: true })
      expect(commandArgs(browser, 'close_file')).toEqual([{ unsaved: 'discard' }])
      expect(asked.forms).toHaveLength(1)
      expect(asked.forms[0]?.message).toContain('“Mock document” has unsaved changes')
      expect(asked.forms[0]?.requestedSchema).toMatchObject({
        required: ['unsaved'],
        properties: {
          unsaved: {
            oneOf: [
              { const: 'save', title: 'Save, then close' },
              { const: 'discard', title: 'Discard the changes and close' },
              { const: 'keep', title: 'Keep the document open' }
            ]
          }
        }
      })
    })

    test('lists the options the way a client on an earlier revision reads them', async () => {
      const { client, browser, asked } = await connectAsking(
        { form: { unsaved: 'discard' } },
        new SceneGraph(),
        ['2025-06-18']
      )
      browser.commandResults.set('list_documents', unsavedDocumentList('/designs/mock.fig'))

      await callAsking(client, 'close_file')

      expect(asked.forms[0]?.requestedSchema).toMatchObject({
        properties: {
          unsaved: {
            enum: ['save', 'discard', 'keep'],
            enumNames: [
              'Save, then close',
              'Discard the changes and close',
              'Keep the document open'
            ]
          }
        }
      })
      expect(commandArgs(browser, 'close_file')).toEqual([{ unsaved: 'discard' }])
    })

    test('offers no save for a document without a file', async () => {
      const { client, browser, asked } = await connectAsking({ form: { unsaved: 'keep' } })
      browser.commandResults.set('list_documents', unsavedDocumentList())

      const { body, isError } = await callAsking(client, 'close_file')

      expect(isError).toBe(false)
      expect(body).toEqual({ closed: false, reason: 'The user kept the document open.' })
      expect(commandArgs(browser, 'close_file')).toEqual([])
      expect(JSON.stringify(asked.forms[0]?.requestedSchema)).not.toContain('"save"')
    })

    test('keeps the document open when the user dismisses the form', async () => {
      const { client, browser } = await connectAsking({ form: 'cancel' })
      browser.commandResults.set('list_documents', unsavedDocumentList('/designs/mock.fig'))

      const { body } = await callAsking(client, 'close_file')

      expect(body).toMatchObject({ closed: false })
      expect(commandArgs(browser, 'close_file')).toEqual([])
    })

    test('does not ask when the call already says what to do', async () => {
      const { client, browser, asked } = await connectAsking({ form: { unsaved: 'keep' } })
      browser.commandResults.set('list_documents', unsavedDocumentList('/designs/mock.fig'))

      await callAsking(client, 'close_file', { unsaved: 'save' })

      expect(asked.forms).toEqual([])
      expect(commandArgs(browser, 'close_file')).toEqual([{ unsaved: 'save' }])
    })

    test('leaves the decision to the app for a client without forms', async () => {
      const { client, browser } = await connectAsking({})
      browser.commandResults.set('list_documents', unsavedDocumentList('/designs/mock.fig'))

      await callAsking(client, 'close_file')

      expect(commandArgs(browser, 'close_file')).toEqual([{}])
      expect(commandArgs(browser, 'list_documents')).toEqual([])
    })
  })

  describe('deleting a collection layers are bound to', () => {
    test('asks first and keeps the collection when the user says so', async () => {
      const { graph, collectionId } = graphWithBoundCollection()
      const { client, asked } = await connectAsking({ form: { confirm: 'keep' } }, graph)

      const { body } = await callAsking(client, 'delete_collection', { id: collectionId })

      expect(body).toEqual({ deleted: false, reason: 'The user kept the collection.' })
      expect(graph.variableCollections.has(collectionId)).toBe(true)
      expect(asked.forms[0]?.message).toContain('“Brand” with 1 variable')
      expect(asked.forms[0]?.message).toContain('1 layer bound to them')
    })

    test('deletes it once the user confirms', async () => {
      const { graph, collectionId } = graphWithBoundCollection()
      const { client } = await connectAsking({ form: { confirm: 'delete' } }, graph)

      await callAsking(client, 'delete_collection', { id: collectionId })

      expect(graph.variableCollections.has(collectionId)).toBe(false)
    })

    test('deletes an unused collection without asking', async () => {
      const graph = new SceneGraph()
      const collection = graph.createCollection('Scratch')
      const { client, asked } = await connectAsking({ form: { confirm: 'keep' } }, graph)

      await callAsking(client, 'delete_collection', { id: collection.id })

      expect(asked.forms).toEqual([])
      expect(graph.variableCollections.has(collection.id)).toBe(false)
    })

    test('deletes as before for a client without forms', async () => {
      const { graph, collectionId } = graphWithBoundCollection()
      const { client } = await connectAsking({}, graph)

      await callAsking(client, 'delete_collection', { id: collectionId })

      expect(graph.variableCollections.has(collectionId)).toBe(false)
    })
  })

  describe('naming layers with the client model', () => {
    test('is listed only to clients that support sampling', async () => {
      const { client } = await connectAsking({})
      const { tools } = await client.listTools()
      expect(tools.map((tool) => tool.name)).not.toContain('name_layers')
    })

    test('renames default-named layers with the names the model suggests', async () => {
      const { graph, buttonId, iconId } = graphWithDefaultNames()
      const { client, asked } = await connectAsking(
        {
          model: () =>
            'Here you go:\n```json\n' +
            JSON.stringify({
              [buttonId]: 'Trial button',
              [iconId]: 'Rectangle 9',
              unknown: 'Ghost'
            }) +
            '\n```'
        },
        graph
      )
      const { tools } = await client.listTools()
      expect(tools.map((tool) => tool.name)).toContain('name_layers')

      const { body } = await callAsking(client, 'name_layers')

      expect(body).toMatchObject({
        renamed: 1,
        names: [{ id: buttonId, from: 'Frame 12', to: 'Trial button' }],
        remaining: 1
      })
      expect(graph.getNode(buttonId)?.name).toBe('Trial button')
      expect(graph.getNode(iconId)?.name).toBe('Rectangle 3')
      expect(asked.prompts).toHaveLength(1)
      const [request] = asked.prompts
      expect(request?.prompt).toContain('Start free trial')
      expect(request?.prompt).not.toContain('Mock document')
      expect(request?.maxTokens).toBeLessThanOrEqual(2000)
    })

    test('only proposes names when asked not to apply them', async () => {
      const { graph, buttonId } = graphWithDefaultNames()
      const { client } = await connectAsking(
        { model: JSON.stringify({ [buttonId]: 'Trial button' }) },
        graph
      )

      const { body } = await callAsking(client, 'name_layers', { apply: false })

      expect(body).toMatchObject({ renamed: 0, proposed: [{ id: buttonId, to: 'Trial button' }] })
      expect(graph.getNode(buttonId)?.name).toBe('Frame 12')
    })

    test('fails cleanly when the model answers without names', async () => {
      const { graph, buttonId } = graphWithDefaultNames()
      const { client } = await connectAsking({ model: 'I cannot help with that.' }, graph)

      const { isError } = await callAsking(client, 'name_layers')

      expect(isError).toBe(true)
      expect(graph.getNode(buttonId)?.name).toBe('Frame 12')
    })
  })
})
