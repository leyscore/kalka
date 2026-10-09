import { appCredentialServices } from '@/app/settings/credentials/app'

import type { StdioServerSpec } from './stdio'
import type { MCPConnection, MCPStdioTransport } from './types'

const ENV_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/

/**
 * Reads a stdio server's environment as people paste it from a README: one `KEY=value` per line,
 * blank lines and `#` comments ignored, matching quotes around a value removed. Returns null with
 * the first line that is not a variable.
 */
export function parseEnvironment(
  text: string
): { ok: true; env: Record<string, string> } | { ok: false; line: number } {
  const env: Record<string, string> = {}
  const lines = text.split(/\r?\n/)
  for (const [index, raw] of lines.entries()) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const separator = line.indexOf('=')
    const name =
      separator > 0
        ? line
            .slice(0, separator)
            .trim()
            .replace(/^export\s+/, '')
        : ''
    if (!ENV_NAME.test(name)) return { ok: false, line: index + 1 }
    let value = line.slice(separator + 1).trim()
    if (value.length >= 2 && (value[0] === '"' || value[0] === "'") && value.at(-1) === value[0]) {
      value = value.slice(1, -1)
    }
    env[name] = value
  }
  return { ok: true, env }
}

type StdioConnection = MCPConnection & { transport: MCPStdioTransport }

export function isStdioConnection(connection: MCPConnection): connection is StdioConnection {
  return connection.transport.type === 'stdio'
}

/** What starts a stdio connection's server, its secret environment resolved. */
export async function stdioServerSpec(connection: StdioConnection): Promise<StdioServerSpec> {
  const { command, args } = connection.transport
  if (connection.authentication.type !== 'env') return { command, args, env: {} }
  const text = await appCredentialServices.resolver.resolve(connection.authentication.credentialRef)
  const parsed = parseEnvironment(text ?? '')
  return { command, args, env: parsed.ok ? parsed.env : {} }
}
