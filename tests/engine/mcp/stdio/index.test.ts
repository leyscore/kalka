import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { mkdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import type { Client } from '@modelcontextprotocol/client'
import type { StdioClientTransport } from '@modelcontextprotocol/client/stdio'
import { fromUint8Array } from 'js-base64'
import * as v from 'valibot'

import { SceneGraph } from '@kalka/scene-graph'

import { startServer, type ServerHandle } from '#mcp/server'

import { expectDefined, getNodeOrThrow } from '#tests/helpers/assert'
import {
  answerServerRequests,
  clientCapabilities,
  graphWithDefaultNames,
  unsavedDocumentList,
  type ClientAnswers,
  type ClientRequests
} from '#tests/helpers/mcp/interaction'
import {
  connectMockBrowser,
  waitForBrowserRegistration,
  type MockBrowser
} from '#tests/helpers/mcp/server'
import { createStdioClient } from '#tests/helpers/mcp/stdio-client'

const AUTH_TOKEN = 'test-stdio-token'
const NO_DOCUMENT_AUTH_TOKEN = 'test-stdio-no-document-token'
const isUnix = process.platform !== 'win32'
const SOCKET_DIR = join(tmpdir(), `kalka-test-stdio-${process.pid}`)
const SOCKET_PATH = isUnix ? join(SOCKET_DIR, 'mcp.sock') : null

function textContent(content: unknown): string {
  const items = content as { type: string; text: string }[]
  return expectDefined(
    items.find((c) => c.type === 'text'),
    'text content'
  ).text
}

/** The JSON a tool returned as text, checked against the shape the test expects. */
function parseTextContent<T>(content: unknown, schema: v.GenericSchema<unknown, T>): T {
  return v.parse(v.pipe(v.string(), v.parseJson(), schema), textContent(content))
}

describe('MCP stdio transport', () => {
  let handle: ServerHandle | undefined
  let graph: SceneGraph | undefined
  let browser: MockBrowser | undefined
  let client: Client | undefined
  let transport: StdioClientTransport | undefined
  let stderrText: (() => string) | undefined

  beforeEach(async () => {
    // Fail-safe: clean up any leftover state from a failed previous test
    if (client) await client.close().catch(() => undefined)
    if (browser) browser.close()
    if (transport) await transport.close().catch(() => undefined)
    if (handle) await handle.close().catch(() => undefined)

    graph = new SceneGraph()

    if (isUnix) await mkdir(SOCKET_DIR, { recursive: true })

    // Bun does not run afterEach() when beforeEach() throws, so we must clean
    // up any partially-initialized resources ourselves before rethrowing.
    try {
      handle = await startServer({
        httpPort: 0,
        withTcp: true,
        socketPath: SOCKET_PATH,
        authToken: AUTH_TOKEN,
        disabledTools: ['rename_node'],
        enableEval: false,
        mcpRoot: null
      })

      if (!handle.httpPort) {
        throw new Error('TCP listener not started — httpPort is undefined')
      }

      browser = await connectMockBrowser(handle.httpPort, graph, AUTH_TOKEN)
      await waitForBrowserRegistration(handle.httpPort)

      const socketPath = handle.socketPath ?? ''
      if (isUnix && !socketPath) {
        throw new Error('Unix socket listener not started — socketPath is undefined')
      }
      const ctx = await createStdioClient(socketPath, AUTH_TOKEN)
      client = ctx.client
      transport = ctx.transport
      stderrText = ctx.stderrText
    } catch (err) {
      if (client) await client.close().catch(() => undefined)
      if (browser) browser.close()
      if (transport) await transport.close().catch(() => undefined)
      if (handle) await handle.close().catch(() => undefined)
      throw err
    }
  }, 15000)

  afterEach(async () => {
    if (client) await client.close().catch(() => undefined)
    if (browser) browser.close()
    if (transport) await transport.close().catch(() => undefined)
    if (handle) await handle.close().catch(() => undefined)
    if (isUnix) await rm(SOCKET_DIR, { recursive: true, force: true })
    handle = undefined
    browser = undefined
    client = undefined
    transport = undefined
    stderrText = undefined
  })

  function requireClient(): Client {
    if (!client) throw new Error('client not initialized')
    return client
  }
  function requireGraph(): SceneGraph {
    if (!graph) throw new Error('graph not initialized')
    return graph
  }

  test('lists tools over stdio', async () => {
    const { tools } = await requireClient().listTools()
    const names = tools.map((t) => t.name)
    expect(names).toContain('create_shape')
    expect(names).toContain('get_page_tree')
    expect(names).toContain('save_file')
    expect(names).toContain('list_documents')
    expect(names).toContain('get_codegen_prompt')
    expect(names).toEqual(
      expect.arrayContaining(['get_metadata', 'get_variable_defs', 'search_design_system'])
    )
    expect(names).not.toContain('rename_node')
    const createShape = expectDefined(
      tools.find((tool) => tool.name === 'create_shape'),
      'create_shape tool'
    )
    expect(JSON.stringify(createShape.inputSchema)).toContain('document_id')
    expect(JSON.stringify(createShape.inputSchema)).toContain('page_id')
    expect(tools.length).toBeGreaterThan(30)
  }, 10000)

  test('create_shape via stdio creates a node', async () => {
    const result = await requireClient().callTool({
      name: 'create_shape',
      arguments: { type: 'FRAME', x: 10, y: 20, width: 200, height: 100, name: 'StdioFrame' }
    })
    expect(result.isError).not.toBe(true)
    const data = parseTextContent(
      result.content,
      v.object({ id: v.string(), name: v.string(), type: v.string() })
    )
    expect(data.type).toBe('FRAME')
    expect(data.name).toBe('StdioFrame')

    expect(getNodeOrThrow(requireGraph(), data.id).width).toBe(200)
  }, 10000)

  test('tool target fields are sent in the app RPC envelope', async () => {
    const result = await requireClient().callTool({
      name: 'create_shape',
      arguments: {
        document_id: 'doc-1',
        page_id: 'page-1',
        type: 'FRAME',
        x: 10,
        y: 20,
        width: 200,
        height: 100,
        name: 'TargetedFrame'
      }
    })
    expect(result.isError).not.toBe(true)
    const request = expectDefined(
      browser?.requests.find((item) => {
        const args = item.args as { name?: string } | undefined
        return item.command === 'tool' && args?.name === 'create_shape'
      }),
      'tool request'
    )
    const requestArgs = request.args as
      | {
          name?: string
          document_id?: string
          page_id?: string
          args?: Record<string, unknown>
        }
      | undefined
    expect(requestArgs?.document_id).toBe('doc-1')
    expect(requestArgs?.page_id).toBe('page-1')
    expect(requestArgs?.args?.document_id).toBeUndefined()
    expect(requestArgs?.args?.page_id).toBeUndefined()
  })

  test('relays document identity and links to returned files from the app server', async () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1, 2, 3])
    browser?.toolResults.set('get_screenshot', {
      mimeType: 'image/png',
      base64: fromUint8Array(png),
      byteLength: png.length
    })
    const result = await requireClient().callTool({ name: 'get_screenshot', arguments: {} })
    expect(result.isError).not.toBe(true)
    const content = result.content as { type: string; uri?: string; text?: string }[]
    expect(content[0]?.type).toBe('image')
    const link = expectDefined(
      content.find((item) => item.type === 'resource_link'),
      'link to the file'
    )
    const response = await fetch(expectDefined(link.uri, 'link URL'))
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(png)
    const identity = v.parse(
      v.pipe(
        v.string(),
        v.parseJson(),
        v.object({ target: v.looseObject({ documentId: v.string() }) })
      ),
      expectDefined(content.at(-1)?.text, 'identity block')
    )
    expect(identity.target.documentId).toBe('doc-1')
  }, 10000)

  test('list_documents via stdio returns open documents', async () => {
    const result = await requireClient().callTool({ name: 'list_documents', arguments: {} })
    expect(result.isError).not.toBe(true)
    const data = parseTextContent(
      result.content,
      v.object({
        documents: v.array(v.object({ id: v.string(), current_page_id: v.string() }))
      })
    )
    expect(data.documents[0].id).toBe('doc-1')
    expect(data.documents[0].current_page_id).toBe(
      expectDefined(browser, 'mock browser').graph.getPages()[0].id
    )
  })

  test('save_file via stdio succeeds', async () => {
    const result = await requireClient().callTool({ name: 'save_file', arguments: {} })
    expect(result.isError).not.toBe(true)
    const data = parseTextContent(result.content, v.object({ saved: v.boolean() }))
    expect(data.saved).toBe(true)
  }, 10000)

  test('get_codegen_prompt via stdio returns prompt', async () => {
    const result = await requireClient().callTool({ name: 'get_codegen_prompt', arguments: {} })
    expect(result.isError).not.toBe(true)
    const data = parseTextContent(result.content, v.object({ prompt: v.string() }))
    expect(data.prompt.length).toBeGreaterThan(100)
  }, 10000)

  test('sequential tool calls work (create then delete)', async () => {
    const create = await requireClient().callTool({
      name: 'create_shape',
      arguments: { type: 'RECTANGLE', x: 0, y: 0, width: 50, height: 50 }
    })
    expect(create.isError).not.toBe(true)
    const { id } = parseTextContent(create.content, v.object({ id: v.string() }))

    expect(getNodeOrThrow(requireGraph(), id)).toBeDefined()

    await requireClient().callTool({ name: 'delete_node', arguments: { id } })
    expect(requireGraph().getNode(id)).toBeUndefined()
  }, 10000)

  test('stderr does not contain JSON-RPC', async () => {
    await requireClient().callTool({
      name: 'create_shape',
      arguments: { type: 'FRAME', x: 0, y: 0, width: 100, height: 100 }
    })

    const allStderr = stderrText?.() ?? ''
    expect(allStderr).not.toContain('"jsonrpc"')
    expect(allStderr).not.toContain('"method"')
  }, 10000)
})

describe('MCP stdio readiness without an open document', () => {
  test('readiness marker means server reachable, while document tools report no document', async () => {
    if (isUnix) await mkdir(SOCKET_DIR, { recursive: true })
    const handle = await startServer({
      httpPort: 0,
      withTcp: true,
      socketPath: isUnix ? join(SOCKET_DIR, 'mcp-no-document.sock') : null,
      authToken: NO_DOCUMENT_AUTH_TOKEN,
      enableEval: false,
      mcpRoot: null,
      // No app ever registers; the default 10 s wait only slows the assertion.
      appWaitTimeoutMs: 50
    })

    let client: Client | undefined
    let transport: StdioClientTransport | undefined
    try {
      const socketPath = handle.socketPath ?? ''
      const ctx = await createStdioClient(socketPath, NO_DOCUMENT_AUTH_TOKEN)
      client = ctx.client
      transport = ctx.transport

      expect(ctx.stderrText()).toContain('document availability is checked per tool call')

      const result = await client.callTool({ name: 'get_current_page', arguments: {} })
      expect(result.isError).toBe(true)
      const message = textContent(result.content)
      expect(message).toContain('Kalka app is not connected')
      expect(message).toContain('no document is open')
    } finally {
      await client?.close().catch(() => undefined)
      await transport?.close().catch(() => undefined)
      await handle.close().catch(() => undefined)
      if (isUnix) await rm(SOCKET_DIR, { recursive: true, force: true })
    }
  }, 30000)
})

describe('MCP stdio bridge asking its client', () => {
  const ASKING_TOKEN = 'test-stdio-interaction-token'
  const ASKING_SOCKET_DIR = join(tmpdir(), `kalka-test-stdio-interaction-${process.pid}`)
  const ASKING_SOCKET_PATH = isUnix ? join(ASKING_SOCKET_DIR, 'mcp.sock') : null

  const AskingResult = v.object({
    content: v.tupleWithRest([v.object({ type: v.literal('text'), text: v.string() })], v.unknown())
  })

  interface AskingContext {
    handle: ServerHandle
    browser: MockBrowser
    client: Client
    transport: StdioClientTransport
    asked: ClientRequests
  }

  let asking: AskingContext | null = null

  afterEach(async () => {
    await asking?.client.close().catch(() => undefined)
    await asking?.transport.close().catch(() => undefined)
    asking?.browser.close()
    await asking?.handle.close()
    if (isUnix) await rm(ASKING_SOCKET_DIR, { recursive: true, force: true })
    asking = null
  })

  async function connectAsking(
    answers: ClientAnswers,
    graph = new SceneGraph()
  ): Promise<AskingContext> {
    if (isUnix) await mkdir(ASKING_SOCKET_DIR, { recursive: true })
    const handle = await startServer({
      httpPort: 0,
      withTcp: true,
      socketPath: ASKING_SOCKET_PATH,
      authToken: ASKING_TOKEN,
      mcpRoot: null
    })
    const browser = await connectMockBrowser(handle.httpPort, graph, ASKING_TOKEN)
    await waitForBrowserRegistration(handle.httpPort)
    let asked: ClientRequests = { forms: [], prompts: [] }
    const { client, transport } = await createStdioClient(handle.socketPath ?? '', ASKING_TOKEN, {
      capabilities: clientCapabilities(answers),
      prepare: (created) => {
        asked = answerServerRequests(created, answers)
      }
    })
    asking = { handle, browser, client, transport, asked }
    return asking
  }

  async function callAsking(client: Client, name: string, args: Record<string, unknown> = {}) {
    const result = v.parse(AskingResult, await client.callTool({ name, arguments: args }))
    return JSON.parse(result.content[0].text) as unknown
  }

  describe('asking through the stdio bridge', () => {
    test('asks the user before closing a document with unsaved changes', async () => {
      const { client, browser, asked } = await connectAsking({ form: { unsaved: 'save' } })
      browser.commandResults.set('list_documents', unsavedDocumentList('/designs/mock.fig'))

      expect(await callAsking(client, 'close_file')).toMatchObject({ closed: true })

      expect(asked.forms).toHaveLength(1)
      const closes = browser.requests.filter((request) => request.command === 'close_file')
      expect(closes.map((request) => request.args)).toEqual([{ unsaved: 'save' }])
    }, 20_000)

    test('names layers with the model of a client that supports sampling', async () => {
      const { graph, buttonId } = graphWithDefaultNames()
      const { client, asked } = await connectAsking(
        { model: JSON.stringify({ [buttonId]: 'Trial button' }) },
        graph
      )

      expect(await callAsking(client, 'name_layers')).toMatchObject({ renamed: 1 })

      expect(asked.prompts).toHaveLength(1)
      expect(graph.getNode(buttonId)?.name).toBe('Trial button')
    }, 20_000)

    test('lists no naming tool and asks nothing of a client without either capability', async () => {
      const { client, browser } = await connectAsking({})
      browser.commandResults.set('list_documents', unsavedDocumentList('/designs/mock.fig'))

      const { tools } = await client.listTools()
      expect(tools.map((tool) => tool.name)).not.toContain('name_layers')
      await callAsking(client, 'close_file')
      const closes = browser.requests.filter((request) => request.command === 'close_file')
      expect(closes.map((request) => request.args)).toEqual([{}])
    }, 20_000)
  })
})
