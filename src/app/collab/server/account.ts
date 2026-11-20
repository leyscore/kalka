import { useLocalStorage } from '@vueuse/core'
import * as v from 'valibot'
import { computed, ref } from 'vue'

import { IS_TAURI } from '@kalka/core/constants'

import { createDeferred } from '@/app/runtime/deferred'
import { appCredentialServices } from '@/app/settings/credentials/app'
import { credentialRef } from '@/app/settings/credentials/reference'
import { openExternalLink } from '@/app/shell/ui'

import {
  normalizeServerURL,
  serverAPI,
  ServerRequestError,
  serverUserSchema,
  type ServerInfo,
  type ServerSession,
  type ServerUser
} from './api'

/**
 * The Kalka server this app is signed in to: its address and the account in local storage, the
 * session token in the credential store (the system keychain on desktop).
 */

const TOKEN_REF = credentialRef('kalka-server', 'token')
const SIGN_IN_TIMEOUT_MS = 10 * 60 * 1000
const BROWSER_CALLBACK_PATH = '/oauth/server.html'
const BROWSER_CALLBACK_CHANNEL = 'kalka:server-oauth'
const DESKTOP_RETURN = 'kalka://oauth/server'
const OAUTH_CALLBACK_EVENT = 'oauth-callback'

const accountSchema = v.object({ url: v.string(), serverName: v.string(), user: serverUserSchema })
type StoredAccount = v.InferOutput<typeof accountSchema>

const storedAccount = useLocalStorage<StoredAccount | null>('kalka:server:account', null, {
  serializer: {
    read: (text) => {
      const parsed = v.safeParse(v.pipe(v.string(), v.parseJson(), accountSchema), text)
      return parsed.success ? parsed.output : null
    },
    write: (value) => JSON.stringify(value)
  }
})

/** The signed-in server and person, or null. */
export const serverAccount = computed(() => storedAccount.value)
/** Whether the session was refused, so the person must sign in again. */
export const serverSessionExpired = ref(false)

let cachedToken: string | null = null

export async function serverToken(): Promise<string | null> {
  cachedToken ??= await appCredentialServices.resolver.resolve(TOKEN_REF)
  return cachedToken
}

async function remember(url: string, info: ServerInfo, session: ServerSession) {
  await appCredentialServices.manager.set(TOKEN_REF, session.token)
  cachedToken = session.token
  storedAccount.value = { url, serverName: info.name, user: session.user }
  serverSessionExpired.value = false
}

/** Reads a server's public description; throws `ServerRequestError` when it is not one. */
export async function describeServer(input: string): Promise<{ url: string; info: ServerInfo }> {
  const url = normalizeServerURL(input)
  if (!url) throw new ServerRequestError(0, 'invalid-url')
  return { url, info: await serverAPI.info(url) }
}

export async function signInWithPassword(
  url: string,
  info: ServerInfo,
  email: string,
  password: string
): Promise<ServerUser> {
  const session = await serverAPI.signIn(url, email, password)
  await remember(url, info, session)
  return session.user
}

/** Signs in with a one-time code the server handed over, as Kalka Cloud's launch links do. */
export async function signInWithCode(
  url: string,
  info: ServerInfo,
  code: string
): Promise<ServerUser> {
  const session = await serverAPI.exchange(url, code)
  await remember(url, info, session)
  return session.user
}

/** Reads `?code=` or `?error=` from where the server sent the browser back. */
function codeFrom(query: string): string {
  const params = new URLSearchParams(query)
  const error = params.get('error')
  if (error) throw new ServerRequestError(403, error)
  const code = params.get('code')
  if (!code) throw new ServerRequestError(400, 'sign-in-failed')
  return code
}

function withTimeout<T>(promise: Promise<T>, cleanup: () => void): Promise<T> {
  const timeout = createDeferred<T>()
  const timer = setTimeout(
    () => timeout.reject(new ServerRequestError(408, 'sign-in-expired')),
    SIGN_IN_TIMEOUT_MS
  )
  return Promise.race([promise, timeout.promise]).finally(() => {
    clearTimeout(timer)
    cleanup()
  })
}

async function desktopSSO(startURL: string): Promise<string> {
  const { listen } = await import('@tauri-apps/api/event')
  const received = createDeferred<string>()
  const callbackSchema = v.object({ provider: v.literal('server'), query: v.string() })
  const unlisten = await listen<unknown>(OAUTH_CALLBACK_EVENT, (event) => {
    const callback = v.safeParse(callbackSchema, event.payload)
    if (callback.success) received.resolve(callback.output.query)
  })
  await openExternalLink(`${startURL}?return=${encodeURIComponent(DESKTOP_RETURN)}`)
  return withTimeout(received.promise, unlisten)
}

/** Must start from the click, before anything is awaited, or the browser blocks the popup. */
function browserSSO(startURL: string): Promise<string> {
  const back = new URL(BROWSER_CALLBACK_PATH, window.location.origin).href
  const popup = window.open(
    `${startURL}?return=${encodeURIComponent(back)}`,
    'kalka-server-sign-in',
    'popup,width=520,height=720'
  )
  if (!popup) return Promise.reject(new ServerRequestError(0, 'popup-blocked'))
  const channel = new BroadcastChannel(BROWSER_CALLBACK_CHANNEL)
  const received = createDeferred<string>()
  channel.addEventListener('message', (event: MessageEvent<unknown>) => {
    if (typeof event.data === 'string') received.resolve(event.data)
  })
  return withTimeout(received.promise, () => {
    channel.close()
    popup.close()
  })
}

/** Signs in through the server's single sign-on, in the browser, and back to Kalka. */
export async function signInWithSSO(url: string, info: ServerInfo): Promise<ServerUser> {
  if (!info.auth.sso) throw new ServerRequestError(404, 'sso-unavailable')
  const startURL = `${url}${info.auth.sso.startPath}`
  const query = await (IS_TAURI ? desktopSSO(startURL) : browserSSO(startURL))
  const session = await serverAPI.exchange(url, codeFrom(query))
  await remember(url, info, session)
  return session.user
}

export async function signOutOfServer(): Promise<void> {
  const account = storedAccount.value
  const token = await serverToken()
  if (account && token) await serverAPI.signOut(account.url, token).catch(() => undefined)
  await appCredentialServices.manager.clear(TOKEN_REF).catch(() => undefined)
  cachedToken = null
  storedAccount.value = null
  serverSessionExpired.value = false
}

/**
 * Runs a request with the session; a refused session marks the account as needing to sign in
 * again rather than signing out, so the address and name stay.
 */
export async function withServerSession<T>(
  run: (url: string, token: string) => Promise<T>
): Promise<T> {
  const account = storedAccount.value
  const token = await serverToken()
  if (!account || !token) throw new ServerRequestError(401, 'signed-out')
  try {
    return await run(account.url, token)
  } catch (error) {
    if (error instanceof ServerRequestError && error.status === 401) {
      serverSessionExpired.value = true
    }
    throw error
  }
}
