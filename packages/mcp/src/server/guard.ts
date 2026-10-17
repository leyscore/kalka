import type { IncomingMessage } from 'node:http'

import { localhostAllowedHostnames } from '@modelcontextprotocol/server'
import type { MiddlewareHandler } from 'hono'

/**
 * Host names that only ever reach this machine. A DNS-rebinding page talks to the server under its
 * own domain, so its requests carry that domain as `Host`; `*.localhost` stays loopback in every
 * browser (RFC 6761) and is how Portless routes the development server.
 */
const LOOPBACK_HOSTS: ReadonlySet<string> = new Set(localhostAllowedHostnames())

/** OAuth discovery probes; answered with an empty 404 so clients do not start an OAuth flow. */
const OAUTH_DISCOVERY_PREFIX = '/.well-known/oauth-'

function hostName(host: string): string | null {
  try {
    return new URL(`http://${host}`).hostname.replace(/\.$/, '')
  } catch {
    return null
  }
}

/** Whether `Host` names this machine. Requests without one come from local programs, not pages. */
export function isLoopbackHost(host: string | undefined): boolean {
  if (host === undefined) return true
  const name = hostName(host)
  if (!name) return false
  return LOOPBACK_HOSTS.has(name) || name.endsWith('.localhost')
}

/**
 * Whether a request may come from `origin`. Browsers add `Origin` to cross-origin requests,
 * preflights and WebSocket handshakes, and MCP clients that are programs send none, so only Kalka's
 * own views are let through: a web page cannot drive the server even when authentication is off.
 */
export function isAllowedOrigin(origin: string | undefined, allowed: readonly string[]): boolean {
  return origin === undefined || allowed.includes(origin)
}

export type RequestRefusal = 'host' | 'origin'

/** Why a request is refused before it reaches a route, or null when it may go on. */
export function refuseRequest(
  headers: { host: string | undefined; origin: string | undefined },
  allowedOrigins: readonly string[]
): RequestRefusal | null {
  if (!isLoopbackHost(headers.host)) return 'host'
  if (!isAllowedOrigin(headers.origin, allowedOrigins)) return 'origin'
  return null
}

const REFUSAL_MESSAGES: Record<RequestRefusal, string> = {
  host: 'Host not allowed',
  origin: 'Origin not allowed'
}

/**
 * Runs before CORS and every route: refuses foreign `Host` and `Origin` headers, preflights
 * included, and answers OAuth discovery probes with an empty 404.
 */
export function requestGuard(allowedOrigins: readonly string[]): MiddlewareHandler {
  return async (c, next) => {
    const refusal = refuseRequest(
      { host: c.req.header('host'), origin: c.req.header('origin') },
      allowedOrigins
    )
    if (refusal) return c.json({ error: REFUSAL_MESSAGES[refusal] }, 403)
    if (c.req.path.startsWith(OAUTH_DISCOVERY_PREFIX)) return c.body(null, 404)
    return next()
  }
}

type VerifyClientCallback = (verified: boolean, code?: number, message?: string) => void

/** The same rules for WebSocket handshakes, which browsers send from any page without CORS. */
export function verifyWebSocketClient(allowedOrigins: readonly string[]) {
  return (info: { req: IncomingMessage }, callback: VerifyClientCallback): void => {
    const origin = typeof info.req.headers.origin === 'string' ? info.req.headers.origin : undefined
    const refusal = refuseRequest({ host: info.req.headers.host, origin }, allowedOrigins)
    if (refusal) callback(false, 403, REFUSAL_MESSAGES[refusal])
    else callback(true)
  }
}
