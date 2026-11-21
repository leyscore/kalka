import { failed, type Result } from './directory'
import { setting, type Env } from './env'
import { directoryName, roomName } from './names'

/** The largest Kalka file the server accepts, under the 32 MiB a Durable Object call carries. */
export const MAX_FILE_BYTES = 30 * 1024 * 1024

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Max-Age': '86400'
}

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message)
  }
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS }
  })
}

/** The value of a directory call, or the HTTP error it failed with. */
export function unwrap<R>(result: R): Exclude<R, { error: string; status: number }> {
  if (failed(result as Result<unknown>)) {
    const failure = result as { error: string; status: number }
    throw new HttpError(failure.status, failure.error)
  }
  return result as Exclude<R, { error: string; status: number }>
}

export function tenantOf(env: Env): string | undefined {
  return setting(env, 'KALKA_TENANT')
}

export function directoryOf(env: Env) {
  return env.DIRECTORY.get(env.DIRECTORY.idFromName(directoryName(tenantOf(env))))
}

export function roomOf(env: Env, documentId: string) {
  return env.ROOMS.get(env.ROOMS.idFromName(roomName(tenantOf(env), documentId)))
}

export function publicUrl(env: Env, request: Request): string {
  return (setting(env, 'KALKA_PUBLIC_URL') ?? new URL(request.url).origin).replace(/\/+$/, '')
}

/** The connecting address workerd reports, `[::ffff:127.0.0.1]:59442` or `203.0.113.7:4242`. */
function peerAddress(cf: Record<string, unknown>): string | null {
  const raw = typeof cf.clientIp === 'string' ? cf.clientIp.trim() : ''
  const address = /^\[(.+)\](?::\d+)?$/.exec(raw)?.[1] ?? raw.replace(/^([\d.]+):\d+$/, '$1')
  return address ? address.replace(/^::ffff:(?=[\d.]+$)/i, '') : null
}

/** Loopback, private, link-local and shared addresses: where a reverse proxy usually connects from. */
function isPrivateAddress(ip: string): boolean {
  if (/^(10|127)\./.test(ip) || /^192\.168\./.test(ip) || /^169\.254\./.test(ip)) return true
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip) || /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(ip)) return true
  return /^(::1|f[cd][0-9a-f]{2}:|fe[89ab][0-9a-f]:)/i.test(ip)
}

/**
 * The address a request came from, for rate limits and the audit log, or 'unknown'.
 *
 * - On Cloudflare (`request.cf` describes the edge) the edge writes `CF-Connecting-IP` itself.
 * - Elsewhere (Docker, workerd) headers come from the client, so none is trusted until the
 *   operator says how many proxies stand in front: with `KALKA_TRUSTED_PROXIES=1` the client is
 *   the last `X-Forwarded-For` entry, the one the proxy appended; with 2, the one before it.
 * - Without it, the connecting address counts when it is public. A private one is most likely a
 *   proxy every client shares, so the address is unknown and only per-account limits apply.
 */
export function clientIp(request: Request, env: Env): string {
  const cf = (request as Request & { cf?: Record<string, unknown> }).cf
  if (typeof cf?.colo === 'string') return request.headers.get('CF-Connecting-IP')?.trim() || 'unknown'
  const hops = Number(setting(env, 'KALKA_TRUSTED_PROXIES') ?? 0)
  if (Number.isInteger(hops) && hops >= 1) {
    const chain = (request.headers.get('X-Forwarded-For') ?? '')
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry !== '')
    return chain[chain.length - hops] ?? 'unknown'
  }
  const peer = cf ? peerAddress(cf) : null
  return peer && !isPrivateAddress(peer) ? peer : 'unknown'
}
