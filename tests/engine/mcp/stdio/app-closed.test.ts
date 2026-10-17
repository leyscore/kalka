import { afterEach, describe, expect, test } from 'bun:test'
import { mkdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { Client, InMemoryTransport } from '@modelcontextprotocol/client'
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio'
import { McpServer } from '@modelcontextprotocol/server'
import * as v from 'valibot'

import { SceneGraph } from '@kalka/scene-graph'

import { APP_NOT_RUNNING_MESSAGE } from '#mcp/app-status'
import { registerTools, startServer, type ServerHandle } from '#mcp/server'
import { stdioToolPolicy } from '#mcp/stdio/policy'
import { removeDiscoveryFile } from '#mcp/transport/discovery'

import { expectDefined } from '#tests/helpers/assert'
import {
  connectMockBrowser,
  waitForBrowserRegistration,
  type MockBrowser
} from '#tests/helpers/mcp/server'

const AUTH_TOKEN = 'test-stdio-app-closed-token'
const isUnix = process.platform !== 'win32'
const SOCKET_DIR = join(tmpdir(), `kalka-test-stdio-closed-${process.pid}`)
const SOCKET_PATH = isUnix ? join(SOCKET_DIR, 'mcp.sock') : null

function textContent(content: unknown): string {
  const items = content as { type: string; text: string }[]
  return expectDefined(
    items.find((item) => item.type === 'text'),
    'text content'
  ).text
}

/** A stdio client started while no Kalka server runs: no discovery file, no socket. */
async function startBridgeWithoutApp() {
  const env: Record<string, string> = {}
  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith('KALKA_MCP_') && value !== undefined) env[key] = value
  }
  env.KALKA_MCP_DISCOVERY_PATH = expectDefined(
    process.env.KALKA_MCP_DISCOVERY_PATH,
    'isolated discovery path'
  )
  if (SOCKET_PATH) env.KALKA_MCP_SOCKET = SOCKET_PATH
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ['packages/mcp/src/stdio.ts'],
    env,
    stderr: 'pipe'
  })
  const client = new Client({ name: 'test-stdio-app-closed', version: '0.0.0' })
  await client.connect(transport)
  return { client, transport }
}

describe('MCP stdio bridge while Kalka is closed', () => {
  let client: Client | undefined
  let transport: StdioClientTransport | undefined
  let handle: ServerHandle | undefined
  let browser: MockBrowser | undefined

  afterEach(async () => {
    await client?.close().catch(() => undefined)
    await transport?.close().catch(() => undefined)
    browser?.close()
    await handle?.close().catch(() => undefined)
    if (isUnix) await rm(SOCKET_DIR, { recursive: true, force: true })
    client = undefined
    transport = undefined
    handle = undefined
    browser = undefined
  })

  test('lists its tools, asks to open Kalka, then goes through once the app is up', async () => {
    await removeDiscoveryFile()
    if (isUnix) await mkdir(SOCKET_DIR, { recursive: true })
    ;({ client, transport } = await startBridgeWithoutApp())

    const closedTools = (await client.listTools()).tools.map((tool) => tool.name)
    expect(closedTools).toContain('get_selection')
    expect(closedTools).toContain('rename_node')

    const startedAt = Date.now()
    const closed = await client.callTool({ name: 'get_selection', arguments: {} })
    expect(closed.isError).toBe(true)
    expect(
      v.parse(
        v.pipe(v.string(), v.parseJson(), v.object({ error: v.string() })),
        textContent(closed.content)
      )
    ).toEqual({ error: APP_NOT_RUNNING_MESSAGE })
    expect(APP_NOT_RUNNING_MESSAGE).toContain('Ask the user to open the Kalka desktop app')
    // An answer, not a hang until some transport timeout.
    expect(Date.now() - startedAt).toBeLessThan(5_000)

    handle = await startServer({
      httpPort: 0,
      withTcp: true,
      socketPath: SOCKET_PATH,
      authToken: AUTH_TOKEN,
      disabledTools: ['rename_node'],
      enableEval: false,
      mcpRoot: null
    })
    browser = await connectMockBrowser(handle.httpPort, new SceneGraph(), AUTH_TOKEN)
    await waitForBrowserRegistration(handle.httpPort)

    // The first call after the app comes up goes through, without waiting for a reconnect timer.
    const open = await client.callTool({ name: 'get_selection', arguments: {} })
    expect(open.isError).not.toBe(true)

    // The tool list now follows the app's settings.
    const openTools = (await client.listTools()).tools.map((tool) => tool.name)
    expect(openTools).toContain('get_selection')
    expect(openTools).not.toContain('rename_node')
  }, 30_000)
})

describe('MCP tool registration policy updates', () => {
  test('adds and removes only the tools whose policy changed, and tells the client', async () => {
    const server = new McpServer({ name: 'policy-test', version: '0.0.0' })
    const registration = registerTools(server, {
      policy: stdioToolPolicy(null, {}),
      sendRPC: async () => ({ ok: true, result: {} })
    })
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
    let listChanged = 0
    const client = new Client(
      { name: 'policy-test-client', version: '0.0.0' },
      {
        listChanged: {
          tools: {
            autoRefresh: false,
            debounceMs: 0,
            onChanged: () => {
              listChanged++
            }
          }
        }
      }
    )
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)])
    try {
      const names = async () => (await client.listTools()).tools.map((tool) => tool.name)
      expect(await names()).toContain('rename_node')

      registration.applyPolicy(
        stdioToolPolicy({ disabledTools: ['rename_node'], scope: 'document' }, {})
      )
      expect(await names()).not.toContain('rename_node')

      registration.applyPolicy(stdioToolPolicy({ disabledTools: [], scope: 'selection' }, {}))
      const selection = await names()
      expect(selection).toContain('get_selection')
      expect(selection).toContain('get_node')
      expect(selection).not.toContain('create_shape')
      expect(listChanged).toBeGreaterThan(0)
    } finally {
      await client.close()
      await server.close()
    }
  })

  test('the environment overrides disabled tools and only narrows the scope', () => {
    const app = { disabledTools: ['rename_node'], scope: 'document' as const }
    expect(stdioToolPolicy(app, {}).disabledTools).toEqual(['rename_node'])
    expect(stdioToolPolicy(app, { KALKA_MCP_DISABLED_TOOLS: 'delete_node' }).disabledTools).toEqual(
      ['delete_node']
    )
    expect(stdioToolPolicy(app, { KALKA_MCP_SCOPE: 'selection' }).scope).toBe('selection')
    expect(stdioToolPolicy({ disabledTools: [], scope: 'selection' }, {}).scope).toBe('selection')
    expect(stdioToolPolicy(null, {})).toEqual({
      allowEval: false,
      disabledTools: [],
      scope: 'document'
    })
  })
})
