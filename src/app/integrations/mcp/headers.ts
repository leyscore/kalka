import { describeDiagnosticError, recordMCPConnectionFailure } from '@/app/diagnostics'
import { appCredentialServices } from '@/app/settings/credentials/app'

import { isOAuthConnection, oauthAccessToken } from './oauth'
import type { MCPConnection } from './types'

/**
 * The headers an HTTP connection sends: its bearer token from the credential store, or the
 * access token of its OAuth sign-in, refreshed when it expired.
 */
export async function mcpConnectionHeaders(
  connection: MCPConnection
): Promise<Record<string, string>> {
  if (isOAuthConnection(connection)) {
    try {
      return { Authorization: `Bearer ${await oauthAccessToken(connection)}` }
    } catch (error) {
      recordMCPConnectionFailure({ operation: 'connect', ...describeDiagnosticError(error) })
      throw error
    }
  }
  if (connection.authentication.type !== 'bearer') return {}
  try {
    const token = await appCredentialServices.resolver.resolve(
      connection.authentication.credentialRef
    )
    if (!token) throw new Error('MCP connection needs a bearer token')
    return { Authorization: `Bearer ${token}` }
  } catch (error) {
    recordMCPConnectionFailure({ operation: 'connect', ...describeDiagnosticError(error) })
    throw error
  }
}
