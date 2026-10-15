/** The name agents see Kalka's own MCP server under. */
export const BUILT_IN_MCP_SERVER_NAME = 'kalka'

/** Names a connection cannot take: the built-in server's, and the one it had before the rename. */
export function isReservedMCPConnectionName(name: string): boolean {
  const normalized = name.trim().toLowerCase()
  return normalized === BUILT_IN_MCP_SERVER_NAME || normalized === 'open-pencil'
}
