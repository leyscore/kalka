#!/usr/bin/env node
import { randomUUID } from 'node:crypto'

import { McpServer } from '@modelcontextprotocol/server'
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio'
import { isEqual } from 'es-toolkit'

import { resolveMCPRoot } from '#mcp/root'
import { MCP_VERSION, registerTools, type ToolRegistration } from '#mcp/server'
import { createServerIdentity } from '#mcp/server/identity'
import { createStdioRPCBridge } from '#mcp/stdio/bridge'
import { stdioToolPolicy } from '#mcp/stdio/policy'
import { readDiscoveryFile } from '#mcp/transport/discovery'

if (process.argv.includes('--version')) {
  process.stdout.write(`${MCP_VERSION}\n`)
  process.exit(0)
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  process.stdout.write(
    `kalka-mcp\n\n` +
      `Start the Kalka MCP stdio bridge.\n\n` +
      `Connects to the MCP server via Unix domain socket on macOS/Linux ` +
      `(with TCP fallback) or via TCP on Windows.\n` +
      `The MCP server is started by the Kalka\n` +
      `desktop app; this bridge only forwards stdio JSON-RPC to it. While Kalka is\n` +
      `closed, the bridge still lists its tools and answers each call with a message\n` +
      `asking the user to open Kalka; calls go through as soon as the app is running.\n\n` +
      `Options:\n` +
      `  --help, -h    Show this help message\n` +
      `  --version     Print the version\n\n` +
      `Environment variables:\n` +
      `  KALKA_MCP_SOCKET        Override socket path (auto-discovered from discovery file when unset)\n` +
      `  KALKA_MCP_AUTH_TOKEN    Bearer token for RPC auth\n` +
      `  KALKA_MCP_ROOT          Allowed directory for file-scoped tools\n` +
      `                               (default: home directory on Windows, cwd elsewhere)\n` +
      `  KALKA_MCP_EVAL          Set to 1 to enable eval and use_figma\n` +
      `  KALKA_MCP_DISABLED_TOOLS Comma-separated tool names to omit; defaults to the app setting\n` +
      `  KALKA_MCP_SCOPE         "selection" to read only the selected layers; defaults to the app setting\n`
  )
  process.exit(0)
}

let toolPolicy = stdioToolPolicy(await readDiscoveryFile())
const mcpRoot = resolveMCPRoot(process.env.KALKA_MCP_ROOT)
// Auth token: undefined → auto-discover from discovery file, empty string →
// disable auth, whitespace-only → reject (same fail-fast as index.ts to catch
// misconfiguration), otherwise → use the trimmed value.
const rawAuthToken = process.env.KALKA_MCP_AUTH_TOKEN
if (rawAuthToken !== undefined && rawAuthToken !== '' && rawAuthToken.trim() === '') {
  process.stderr.write(
    'Error: KALKA_MCP_AUTH_TOKEN is whitespace-only. Set a real token, or use an empty string to disable auth.\n'
  )
  process.exit(1)
}
function resolveAuthToken(raw: string | undefined): string | null | undefined {
  if (raw === undefined) return undefined
  if (raw === '') return null
  return raw.trim()
}
const authToken = resolveAuthToken(rawAuthToken)

// KALKA_MCP_SOCKET is intentionally NOT forwarded as an explicit socketPath.
// The bridge reads the socket path from the discovery file (whose `socketPath`
// field records the override) via auto-discovery. Treating the env var as an
// explicit pin would prevent the bridge from following discovery updates after
// a server restart.
let tools: ToolRegistration | null = null
const bridge = createStdioRPCBridge({
  authToken,
  // Started while Kalka was closed, the bridge lists the tools it ships with; when the app comes up,
  // the list follows the app's settings and the client hears that it changed.
  onDiscovery: (info) => {
    const next = stdioToolPolicy(info)
    if (isEqual(next, toolPolicy)) return
    toolPolicy = next
    tools?.applyPolicy(next)
  },
  onReady: () => {
    process.stderr.write(
      'Connected to Kalka MCP server; document availability is checked per tool call\n'
    )
  },
  onReconnect: () => {
    process.stderr.write(
      'Reconnected to Kalka MCP server; document availability is checked per tool call\n'
    )
  }
})

const mcpServer = new McpServer(...createServerIdentity(MCP_VERSION))
// One client per process: its tool calls show as one agent in the app.
tools = registerTools(mcpServer, {
  policy: toolPolicy,
  mcpRoot,
  sendRPC: bridge.sendRPC,
  agentSession: { id: randomUUID(), kind: 'mcp' }
})

const transport = new StdioServerTransport()
mcpServer.connect(transport).catch((err) => {
  process.stderr.write(`Fatal: MCP connect failed — ${err instanceof Error ? err.message : err}\n`)
  process.exit(1)
})

process.on('uncaughtException', (err) => {
  process.stderr.write(`Fatal: ${err instanceof Error ? err.message : err}\n`)
  process.exit(1)
})

process.on('unhandledRejection', (reason: unknown) => {
  const message = reason instanceof Error ? reason.message : String(reason)
  process.stderr.write(`Fatal: unhandled rejection — ${message}\n`)
  process.exit(1)
})
