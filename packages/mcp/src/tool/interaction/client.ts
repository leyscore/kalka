import type { McpServer } from '@modelcontextprotocol/server'

/** What a tool can ask the connected client for while a call runs. */
export type ClientRequestKind = 'elicitation' | 'sampling'

/**
 * Whether a tool may ask this session's client for `kind`: the client declared the capability and
 * the transport can carry a request from the server while a call is open. A form elicitation is
 * declared by `elicitation.form`, or by a bare `elicitation: {}` as in protocol revisions before
 * modes existed; a client that declared only URL elicitation cannot answer a form.
 */
export function clientCan(
  server: McpServer,
  kind: ClientRequestKind,
  transportCarriesRequests: boolean
): boolean {
  if (!transportCarriesRequests) return false
  // The SDK backfills this per request for clients that send capabilities with every request.
  const capabilities = server.server.getClientCapabilities()
  if (kind === 'sampling') return capabilities?.sampling !== undefined
  const elicitation = capabilities?.elicitation
  if (elicitation === undefined) return false
  return elicitation.form !== undefined || elicitation.url === undefined
}

/** The protocol revision this session's client negotiated, such as `2025-06-18`. */
export function negotiatedRevision(server: McpServer): string | undefined {
  return server.server.getNegotiatedProtocolVersion()
}
