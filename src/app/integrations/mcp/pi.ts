import { AUTOMATION_HTTP_PORT, MCP_AGENT_HEADER } from '@open-pencil/core/constants'

import { getAutomationAuthToken } from '@/app/automation/mcp/spawn'

import { BUILT_IN_MCP_SERVER_NAME } from './built-in'
import { mcpConnectionHeaders } from './headers'
import { enabledMCPConnections } from './store'
import type { MCPConnection, MCPHTTPTransport } from './types'

function isHTTPConnection(
  connection: MCPConnection
): connection is MCPConnection & { transport: MCPHTTPTransport } {
  return connection.transport.type === 'streamable-http'
}
export type PiMCPServer = {
  url: string
  headers?: Record<string, string>
  auth: false
}

async function externalPiMCPServer(
  connection: MCPConnection & { transport: MCPHTTPTransport }
): Promise<PiMCPServer> {
  const headers = await mcpConnectionHeaders(connection)
  return {
    url: connection.transport.url,
    ...(Object.keys(headers).length ? { headers } : {}),
    auth: false
  }
}

export async function buildPiMCPServers(options?: {
  authorizationToken?: string | null
}): Promise<Record<string, PiMCPServer>> {
  const authorizationToken =
    options && 'authorizationToken' in options
      ? options.authorizationToken
      : await getAutomationAuthToken()
  const entries = await Promise.all(
    // The Pi harness reaches servers by URL; stdio servers stay with Kalka and ACP agents.
    enabledMCPConnections.value
      .filter((connection) => isHTTPConnection(connection))
      .map(async (connection) => [connection.name, await externalPiMCPServer(connection)] as const)
  )
  return {
    ...Object.fromEntries(entries),
    [BUILT_IN_MCP_SERVER_NAME]: {
      url: `http://127.0.0.1:${AUTOMATION_HTTP_PORT}/mcp`,
      // The Pi harness chat's tool calls show as its agent rather than an outside MCP client.
      headers: {
        [MCP_AGENT_HEADER]: 'harness',
        ...(authorizationToken ? { Authorization: `Bearer ${authorizationToken}` } : {})
      },
      auth: false
    }
  }
}
