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

export function clientIp(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ??
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ??
    'unknown'
  )
}
