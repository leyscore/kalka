import type { McpServer } from '@agentclientprotocol/sdk'

import { AUTOMATION_HTTP_PORT, MCP_AGENT_HEADER } from '@open-pencil/core/constants'

import { mcpConnectionHeaders } from './headers'
import { enabledMCPConnections } from './store'
import type { MCPConnection } from './types'
export type BuiltInMCPServerOptions = {
  authorizationToken: string | null
}

export function builtInMCPServer(options: BuiltInMCPServerOptions): McpServer {
  return {
    type: 'http',
    name: 'open-pencil',
    url: `http://127.0.0.1:${AUTOMATION_HTTP_PORT}/mcp`,
    // An ACP chat's tool calls show as an ACP agent rather than an outside MCP client.
    headers: [
      { name: MCP_AGENT_HEADER, value: 'acp' },
      ...(options.authorizationToken
        ? [{ name: 'Authorization', value: `Bearer ${options.authorizationToken}` }]
        : [])
    ]
  }
}

async function externalMCPServer(connection: MCPConnection): Promise<McpServer> {
  const headers = await mcpConnectionHeaders(connection)
  return {
    type: 'http',
    name: connection.name,
    url: connection.transport.url,
    headers: Object.entries(headers).map(([name, value]) => ({ name, value }))
  }
}

export async function buildACPMCPServers(options: BuiltInMCPServerOptions): Promise<McpServer[]> {
  const external = await Promise.all(enabledMCPConnections.value.map(externalMCPServer))
  return [builtInMCPServer(options), ...external]
}
