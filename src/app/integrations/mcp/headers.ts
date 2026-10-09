import { describeDiagnosticError, recordMCPConnectionFailure } from '@/app/diagnostics'
import { appCredentialServices } from '@/app/settings/credentials/app'

import type { MCPConnection } from './types'

/** The headers a connection sends: its bearer token, resolved from the credential store. */
export async function mcpConnectionHeaders(
  connection: MCPConnection
): Promise<Record<string, string>> {
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
