import { Client, StreamableHTTPClientTransport, type FetchLike } from '@modelcontextprotocol/client'
import { dynamicTool, jsonSchema, type JSONSchema7, type Tool } from 'ai'

import { describeDiagnosticError, recordMCPConnectionFailure } from '@/app/diagnostics'
import { APP_VERSION } from '@/app/runtime/version'
import { isTauri } from '@/app/tauri/env'
import { tauriFetch } from '@/app/tauri/http'

import { mcpConnectionHeaders } from './headers'
import { enabledMCPConnections } from './store'
import type { MCPConnection } from './types'

/** Every tool from an outside server is named `mcp__<server>__<tool>`, as MCP clients do. */
export const EXTERNAL_MCP_TOOL_PREFIX = 'mcp__'
/** Providers reject longer tool names. */
const MAX_TOOL_NAME = 64
/** A tool call to an outside server may run a while, such as a search. */
const TOOL_CALL_TIMEOUT_MS = 120_000

interface Session {
  key: string
  client: Client
  tools: Record<string, Tool>
}

/** A name part providers accept; a server's part has no underscore, so the prefix reads back. */
function slug(value: string, separator: '-' | '_'): string {
  const pattern = separator === '-' ? /[^A-Za-z0-9-]+/g : /[^A-Za-z0-9_-]+/g
  const cleaned = value.replaceAll(pattern, separator)
  return cleaned.replaceAll(/^[-_]+|[-_]+$/g, '') || 'server'
}

function toolName(connection: MCPConnection, name: string): string {
  const full = `${EXTERNAL_MCP_TOOL_PREFIX}${slug(connection.name, '-')}__${slug(name, '_')}`
  return full.slice(0, MAX_TOOL_NAME)
}

/**
 * Requests to an outside server. The desktop app sends them from the main process, which no
 * page CORS policy applies to; it answers its own session stream request with 405, so the
 * client keeps to request and response instead of holding a stream open through the proxy.
 */
const proxiedFetch: FetchLike = async (url, init) => {
  if ((init?.method ?? 'GET').toUpperCase() === 'GET')
    return new Response(null, { status: 405, statusText: 'Method Not Allowed' })
  return tauriFetch(url, init, undefined, TOOL_CALL_TIMEOUT_MS)
}

interface ToolOutput {
  text: string
  error?: true
  data?: unknown
}

/** Text a tool result carries, with its structured content when it has some. */
function resultOutput(result: Awaited<ReturnType<Client['callTool']>>): ToolOutput {
  const content = Array.isArray(result.content) ? result.content : []
  const output: ToolOutput = {
    text: content.map((part) => (part.type === 'text' ? part.text : `[${part.type}]`)).join('\n')
  }
  if (result.isError) output.error = true
  if (result.structuredContent) output.data = result.structuredContent
  return output
}

/** Tool arguments are a JSON object by the MCP spec. */
function isToolArguments(value: unknown): value is { [name: string]: unknown } {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

async function connect(connection: MCPConnection): Promise<Client> {
  const client = new Client({ name: 'kalka', version: APP_VERSION })
  const requestInit = { headers: await mcpConnectionHeaders(connection) }
  const url = new URL(connection.transport.url)
  const transport = isTauri()
    ? new StreamableHTTPClientTransport(url, { requestInit, fetch: proxiedFetch })
    : new StreamableHTTPClientTransport(url, { requestInit })
  await client.connect(transport)
  return client
}

async function listTools(connection: MCPConnection, client: Client): Promise<Record<string, Tool>> {
  const tools: Record<string, Tool> = {}
  const { tools: listed } = await client.listTools()
  for (const listedTool of listed) {
    // Outside tools are known only at run time; their input schema is JSON Schema by the spec.
    tools[toolName(connection, listedTool.name)] = dynamicTool({
      description: `[${connection.name}] ${listedTool.description ?? listedTool.name}`,
      inputSchema: jsonSchema(listedTool.inputSchema as JSONSchema7),
      execute: async (args, { abortSignal }) =>
        resultOutput(
          await client.callTool(
            { name: listedTool.name, arguments: isToolArguments(args) ? args : {} },
            { signal: abortSignal, timeout: TOOL_CALL_TIMEOUT_MS }
          )
        )
    })
  }
  return tools
}

/**
 * The tools of the MCP servers connected in Settings › MCP, for the built-in chat. Sessions are
 * opened on first use and kept until a server's address or token changes; a server that cannot
 * be reached is left out of this request and recorded in diagnostics, and the chat goes on.
 */
export function createExternalMCPTools() {
  const sessions = new Map<string, Session>()

  async function sessionFor(connection: MCPConnection): Promise<Session | null> {
    const key = JSON.stringify([connection.transport.url, connection.authentication])
    const known = sessions.get(connection.id)
    if (known?.key === key) return known
    if (known) await known.client.close().catch(() => undefined)
    sessions.delete(connection.id)
    try {
      const client = await connect(connection)
      const session = { key, client, tools: await listTools(connection, client) }
      sessions.set(connection.id, session)
      return session
    } catch (error) {
      recordMCPConnectionFailure({ operation: 'connect', ...describeDiagnosticError(error) })
      return null
    }
  }

  /** Brings `target` in line with the enabled servers' tools, keeping every other entry. */
  async function sync(target: Record<string, Tool>): Promise<void> {
    const enabled = enabledMCPConnections.value
    for (const [id, session] of sessions) {
      if (enabled.some((connection) => connection.id === id)) continue
      await session.client.close().catch(() => undefined)
      sessions.delete(id)
    }
    const connected = await Promise.all(enabled.map(sessionFor))
    for (const name of Object.keys(target)) {
      if (name.startsWith(EXTERNAL_MCP_TOOL_PREFIX)) Reflect.deleteProperty(target, name)
    }
    for (const session of connected) if (session) Object.assign(target, session.tools)
  }

  async function close(): Promise<void> {
    await Promise.all([...sessions.values()].map((session) => session.client.close()))
    sessions.clear()
  }

  return { sync, close }
}

/** The built-in chat's connections to outside servers, shared by its sessions. */
export const externalMCPTools = createExternalMCPTools()
