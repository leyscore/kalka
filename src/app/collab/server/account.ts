import { useLocalStorage } from '@vueuse/core'
import * as v from 'valibot'
import { computed, ref } from 'vue'

import { IS_TAURI } from '@kalka/core/constants'

import { createDeferred } from '@/app/runtime/deferred'
import { createPKCEFlow } from '@/app/runtime/pkce'
import { appCredentialServices } from '@/app/settings/credentials/app'
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
import { SERVER_TOKEN_REF } from './credential'
import { answersFlow, signInStartURL, type SignInFlow } from './sign-in-flow'

/**
 * The Kalka server this app is signed in to: its address and the account in local storage, the
 * session token in the credential store (the system keychain on desktop).
 */

const TOKEN_REF = SERVER_TOKEN_REF
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

// A browser that keeps credentials for the session only has no token after a reload, while the
// account stays: the person must sign in again, and Settings and Home say so from the start.
if (storedAccount.value) {
  serverToken()
    .then((token) => {
      if (!token && storedAccount.value) serverSessionExpired.value = true
      return undefined
    })
    .catch(() => undefined)
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

/** Who is signed in where, as a question about switching accounts names them. */
export interface ServerAccountSummary {
  serverName: string
  email: string
}

/**
 * Whether signing in as `user` on `url` would replace another stored account: another server,
 * or another person on it.
 */
export function replacesAccount(
  current: { url: string; user: { id: string } } | null,
  url: string,
  user: { id: string }
): boolean {
  return current !== null && (current.url !== url || current.user.id !== user.id)
}

/**
 * Signs in with a one-time code the server handed over, as Kalka Cloud's launch links do. A
 * code only proves where the link came from, not whom it was meant for: when it would replace
 * the account already signed in, `confirmSwitch` decides, and a refusal signs the new session
 * out again and resolves to null.
 */
export async function signInWithCode(
  url: string,
  info: ServerInfo,
  code: string,
  confirmSwitch?: (current: ServerAccountSummary, next: ServerAccountSummary) => Promise<boolean>
): Promise<ServerUser | null> {
  const session = await serverAPI.exchange(url, code)
  const current = storedAccount.value
  if (current && confirmSwitch && replacesAccount(current, url, session.user)) {
    const agreed = await confirmSwitch(
      { serverName: current.serverName, email: current.user.email },
      { serverName: info.name, email: session.user.email }
    )
    if (!agreed) {
      await serverAPI.signOut(url, session.token).catch(() => undefined)
      return null
    }
  }
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

/**
 * Any app can open a `kalka://` link: a callback that does not answer this sign-in, such as one
 * a web page opened with a code of its own, is ignored.
 */
async function desktopSSO(startURL: string, flow: SignInFlow): Promise<string> {
  const { listen } = await import('@tauri-apps/api/event')
  const received = createDeferred<string>()
  const callbackSchema = v.object({ provider: v.literal('server'), query: v.string() })
  const unlisten = await listen<unknown>(OAUTH_CALLBACK_EVENT, (event) => {
    const callback = v.safeParse(callbackSchema, event.payload)
    if (callback.success && answersFlow(callback.output.query, flow)) {
      received.resolve(callback.output.query)
    }
  })
  await openExternalLink(signInStartURL(startURL, DESKTOP_RETURN, flow))
  return withTimeout(received.promise, unlisten)
}

/** Must start from the click, before anything is awaited, or the browser blocks the popup. */
function browserSSO(startURL: string, flow: Promise<SignInFlow>): Promise<string> {
  const popup = window.open('', 'kalka-server-sign-in', 'popup,width=520,height=720')
  if (!popup) return Promise.reject(new ServerRequestError(0, 'popup-blocked'))
  const channel = new BroadcastChannel(BROWSER_CALLBACK_CHANNEL)
  const received = createDeferred<string>()
  void flow.then(
    (started) => {
      channel.addEventListener('message', (event: MessageEvent<unknown>) => {
        if (typeof event.data === 'string' && answersFlow(event.data, started)) {
          received.resolve(event.data)
        }
      })
      const back = new URL(BROWSER_CALLBACK_PATH, window.location.origin).href
      popup.location.href = signInStartURL(startURL, back, started)
      return undefined
    },
    (error: unknown) => received.reject(error)
  )
  return withTimeout(received.promise, () => {
    channel.close()
    popup.close()
  })
}

/**
 * Signs in through the server's single sign-on, in the browser, and back to Kalka. The code
 * that comes back is traded with this sign-in's PKCE verifier, so a code caught on its way here
 * is of no use to whoever caught it.
 */
export async function signInWithSSO(url: string, info: ServerInfo): Promise<ServerUser> {
  if (!info.auth.sso) throw new ServerRequestError(404, 'sso-unavailable')
  const startURL = `${url}${info.auth.sso.startPath}`
  const flow = createPKCEFlow()
  const query = await (IS_TAURI ? desktopSSO(startURL, await flow) : browserSSO(startURL, flow))
  const session = await serverAPI.exchange(url, codeFrom(query), (await flow).verifier)
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

/** Takes the account as the server has it now, such as a role an administrator changed. */
export function updateServerUser(user: ServerUser): void {
  const account = storedAccount.value
  if (!account || account.user.id !== user.id) return
  if (account.user.role === user.role && account.user.name === user.name) return
  storedAccount.value = { ...account, user }
}

/** Reads the signed-in account again from the server, so a changed role shows. */
export async function refreshServerAccount(): Promise<void> {
  const user = await withServerSession((url, token) => serverAPI.me(url, token))
  updateServerUser(user)
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
  if (!account || !token) {
    // An account whose token is gone, as a browser keeping credentials for the session only
    // loses it on reload, must sign in again: say so rather than claim it is signed in.
    if (account) serverSessionExpired.value = true
    throw new ServerRequestError(401, 'signed-out')
  }
  try {
    return await run(account.url, token)
  } catch (error) {
    if (error instanceof ServerRequestError && error.status === 401) {
      serverSessionExpired.value = true
    }
    throw error
  }
}
