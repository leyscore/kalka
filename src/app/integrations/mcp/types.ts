import type { CredentialRef } from '@/app/settings/credentials/types'

export type MCPConnectionID = `mcp-${string}`

export type MCPHTTPTransport = {
  type: 'streamable-http'
  url: string
}

/** A server the desktop app starts on this computer and talks to over stdin and stdout. */
export type MCPStdioTransport = {
  type: 'stdio'
  command: string
  args: string[]
}

export type MCPTransport = MCPHTTPTransport | MCPStdioTransport
export type MCPTransportType = MCPTransport['type']

/**
 * How a connection proves who it is. Secrets live in the credential store: a bearer token, the
 * OAuth client and tokens as one JSON record, or a stdio server's environment as `KEY=value` lines.
 */
export type MCPAuthentication =
  | { type: 'none' }
  | { type: 'bearer'; credentialRef: CredentialRef }
  | { type: 'oauth'; credentialRef: CredentialRef }
  | { type: 'env'; credentialRef: CredentialRef }
export type MCPAuthenticationType = MCPAuthentication['type']

export type MCPConnection = {
  id: MCPConnectionID
  name: string
  enabled: boolean
  transport: MCPTransport
  authentication: MCPAuthentication
}

export type MCPConnectionSettings = {
  version: 1
  connections: MCPConnection[]
}

export type MCPConnectionDraft = {
  id: MCPConnectionID | null
  name: string
  transportType: MCPTransportType
  url: string
  /** A stdio server's command line, as typed: the program and its arguments. */
  command: string
  enabled: boolean
  authenticationType: MCPAuthenticationType
}
