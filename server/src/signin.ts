// The browser half of single sign-on, around the enterprise module's start and callback routes:
// a sign-in finishes only in the browser that started it, and a code it hands to Kalka can be
// bound to the app that asked for it (PKCE, RFC 7636).
import { hashToken, sameSecret } from './crypto'
import enterprise from './ee/module'
import type { EnterpriseHost } from './ee/types'
import type { Env } from './env'
import { directoryOf } from './http'

export const SIGN_IN_START = '/auth/oidc/start'
export const SIGN_IN_CALLBACK = '/auth/oidc/callback'
const STATE_COOKIE = 'kalka_sign_in'
/** As long as a sign-in may take at the identity provider. */
const FLOW_MS = 15 * 60 * 1000
const CHALLENGE = /^[A-Za-z0-9_-]{43}$/

function page(status: number, message: string): Response {
  return new Response(
    `<!doctype html><meta charset="utf-8"><title>Sign-in failed</title><body style="font:15px system-ui;max-width:520px;margin:60px auto;padding:0 16px"><h1 style="font-size:18px">Sign-in failed</h1><p>${message}</p></body>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } }
  )
}

function cookieOf(request: Request, name: string): string | null {
  for (const part of (request.headers.get('Cookie') ?? '').split(';')) {
    const [key, ...value] = part.trim().split('=')
    if (key === name) return value.join('=')
  }
  return null
}

/** A copy of `response` whose headers can change. */
function editable(response: Response): Response {
  return new Response(response.body, response)
}

function setCookie(response: Response, request: Request, value: string, maxAgeSeconds: number): Response {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : ''
  const out = editable(response)
  out.headers.append(
    'Set-Cookie',
    `${STATE_COOKIE}=${value}; Path=/auth/; Max-Age=${maxAgeSeconds}; HttpOnly; SameSite=Lax${secure}`
  )
  return out
}

/** A query parameter of the address a redirect sends the browser to. */
function redirectParam(response: Response, name: string): string | null {
  const location = response.headers.get('Location')
  if (!location) return null
  const query = location.includes('?') ? location.slice(location.indexOf('?') + 1).split('#')[0] : ''
  return new URLSearchParams(query).get(name)
}

/**
 * Runs the module's sign-in routes with the checks that bind them to the browser and the app;
 * other enterprise routes go to the module as they are. Null when the module does not answer.
 */
export async function enterpriseRoute(
  env: Env,
  request: Request,
  path: string,
  host: EnterpriseHost
): Promise<Response | null> {
  if (!enterprise) return null
  const directory = directoryOf(env)
  if (path === SIGN_IN_START && request.method === 'GET') {
    const challenge = new URL(request.url).searchParams.get('code_challenge')
    if (challenge !== null && !CHALLENGE.test(challenge)) return page(400, 'This sign-in link is malformed. Start again from Kalka.')
    const response = await enterprise.handle(request, host)
    const state = response ? redirectParam(response, 'state') : null
    if (!response || !state) return response
    if (challenge) await directory.putBound('sign-in', state, challenge, FLOW_MS)
    return setCookie(response, request, await hashToken(state), FLOW_MS / 1000)
  }
  if (path === SIGN_IN_CALLBACK && request.method === 'GET') {
    const state = new URL(request.url).searchParams.get('state') ?? ''
    const cookie = cookieOf(request, STATE_COOKIE)
    // A callback link someone else started would sign this browser in to their account.
    if (!state || !cookie || !(await sameSecret(cookie, await hashToken(state)))) {
      return page(400, 'This sign-in was started in another browser, or has expired. Start again from Kalka.')
    }
    const challenge = await directory.takeBound('sign-in', state)
    const response = await enterprise.handle(request, host)
    if (!response) return null
    const code = redirectParam(response, 'code')
    if (code && challenge) await directory.putBound('sign-in-code', code, challenge, FLOW_MS)
    return setCookie(response, request, '', 0)
  }
  return enterprise.handle(request, host)
}
