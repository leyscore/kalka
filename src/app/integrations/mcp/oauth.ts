import {
  auth,
  type FetchLike,
  type OAuthClientMetadata,
  type OAuthClientProvider,
  type OAuthDiscoveryState,
  type StoredOAuthClientInformation,
  type StoredOAuthTokens
} from '@modelcontextprotocol/client'
import * as v from 'valibot'

import { randomHex } from '@kalka/scene-graph/random'

import { call } from '@/app/platform/tauri/bridge'
import { appCredentialServices } from '@/app/settings/credentials/app'
import { isTauri } from '@/app/tauri/env'
import { tauriFetch } from '@/app/tauri/http'

import type { MCPConnection, MCPHTTPTransport } from './types'

/** A sign-in's client registration and tokens, kept together in the credential store. */
interface OAuthRecord {
  client?: StoredOAuthClientInformation
  tokens?: StoredOAuthTokens
  /** When the tokens were saved, in epoch milliseconds, to tell when the access token expires. */
  savedAt?: number
  redirectURL?: string
}

/** An access token counts as expired this long before it does, to cover the request's trip. */
const EXPIRY_MARGIN_MS = 60_000

const OAuthRecordJSON = v.pipe(
  v.string(),
  v.parseJson(),
  v.looseObject({
    client: v.optional(v.looseObject({ client_id: v.string() })),
    tokens: v.optional(v.looseObject({ access_token: v.string(), token_type: v.string() })),
    savedAt: v.optional(v.number()),
    redirectURL: v.optional(v.string())
  })
)

const OAuthCallback = v.object({
  code: v.optional(v.string()),
  state: v.optional(v.string()),
  iss: v.optional(v.string()),
  error: v.optional(v.string())
})

/** OAuth discovery and token requests leave from the main process, which CORS does not limit. */
const oauthFetch: FetchLike = (url, init) =>
  isTauri() ? tauriFetch(url, init, undefined, 30_000) : fetch(url, init)

type OAuthConnection = MCPConnection & {
  transport: MCPHTTPTransport
  authentication: Extract<MCPConnection['authentication'], { type: 'oauth' }>
}

export function isOAuthConnection(connection: MCPConnection): connection is OAuthConnection {
  return (
    connection.transport.type === 'streamable-http' && connection.authentication.type === 'oauth'
  )
}

async function readRecord(connection: OAuthConnection): Promise<OAuthRecord> {
  const text = await appCredentialServices.resolver.resolve(connection.authentication.credentialRef)
  if (!text) return {}
  const parsed = v.safeParse(OAuthRecordJSON, text)
  // The stored values are what the SDK saved; their shape was checked above.
  return parsed.success
    ? {
        client: parsed.output.client as StoredOAuthClientInformation | undefined,
        tokens: parsed.output.tokens as StoredOAuthTokens | undefined,
        savedAt: parsed.output.savedAt,
        redirectURL: parsed.output.redirectURL
      }
    : {}
}

/** Kalka's side of the MCP authorization spec for one connection, backed by the credential store. */
class ConnectionOAuthProvider implements OAuthClientProvider {
  authorizationURL: URL | null = null
  private verifier = ''
  private discovery: OAuthDiscoveryState | undefined
  private readonly expectedState = randomHex(16)

  constructor(
    private readonly connection: OAuthConnection,
    private readonly record: OAuthRecord
  ) {}

  // eslint-disable-next-line open-pencil/no-mixed-case-acronym-identifiers -- Upstream interface spelling.
  get redirectUrl(): string | undefined {
    return this.record.redirectURL
  }

  get clientMetadata(): OAuthClientMetadata {
    return {
      client_name: 'Kalka',
      redirect_uris: this.record.redirectURL ? [this.record.redirectURL] : [],
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      token_endpoint_auth_method: 'none'
    }
  }

  state(): string {
    return this.expectedState
  }

  clientInformation(): StoredOAuthClientInformation | undefined {
    return this.record.client
  }

  async saveClientInformation(client: StoredOAuthClientInformation): Promise<void> {
    this.record.client = client
    await this.persist()
  }

  tokens(): StoredOAuthTokens | undefined {
    return this.record.tokens
  }

  async saveTokens(tokens: StoredOAuthTokens): Promise<void> {
    this.record.tokens = tokens
    this.record.savedAt = Date.now()
    await this.persist()
  }

  redirectToAuthorization(url: URL): void {
    this.authorizationURL = url
  }

  saveCodeVerifier(verifier: string): void {
    this.verifier = verifier
  }

  codeVerifier(): string {
    return this.verifier
  }

  // The authorization server found before the browser leg, so its answer is checked against it.
  saveDiscoveryState(state: OAuthDiscoveryState): void {
    this.discovery = state
  }

  discoveryState(): OAuthDiscoveryState | undefined {
    return this.discovery
  }

  private async persist(): Promise<void> {
    await appCredentialServices.manager.set(
      this.connection.authentication.credentialRef,
      JSON.stringify(this.record)
    )
  }
}

/** The provider a transport uses for a signed-in connection; it refreshes expired tokens. */
export async function oauthProvider(connection: OAuthConnection): Promise<OAuthClientProvider> {
  return new ConnectionOAuthProvider(connection, await readRecord(connection))
}

/** Whether a connection has tokens from a sign-in. */
export async function isSignedIn(connection: OAuthConnection): Promise<boolean> {
  return Boolean((await readRecord(connection)).tokens)
}

/**
 * A current access token, refreshed when it expired, for agents that take headers. Throws when
 * the person has to sign in again.
 */
export async function oauthAccessToken(connection: OAuthConnection): Promise<string> {
  const record = await readRecord(connection)
  const current = record.tokens
  const lifetime = current?.expires_in
  const fresh =
    current &&
    (lifetime === undefined ||
      (record.savedAt ?? 0) + lifetime * 1000 - EXPIRY_MARGIN_MS > Date.now())
  if (current && fresh) return current.access_token
  const provider = new ConnectionOAuthProvider(connection, record)
  const result = await auth(provider, {
    serverUrl: connection.transport.url,
    fetchFn: oauthFetch
  })
  const token = provider.tokens()?.access_token
  if (result !== 'AUTHORIZED' || !token) {
    throw new Error(`Sign in to ${connection.name} again in Settings › MCP`)
  }
  return token
}

/** Where a sign-in sends the person and receives the answer: the desktop app's by default. */
export interface SignInEnvironment {
  /** Listens for the browser's redirect on a loopback port. */
  listen(): Promise<{ port: number; answer: () => Promise<unknown>; stop: () => Promise<void> }>
  /** Shows the authorization page to the person. */
  openBrowser(url: string): Promise<void>
  fetch: FetchLike
}

const desktopSignIn: SignInEnvironment = {
  async listen() {
    const { id, port } = await call<{ id: string; port: number }>('oauth.loopbackStart')
    return {
      port,
      answer: () => call('oauth.loopbackWait', id),
      stop: async () => {
        await call('oauth.loopbackCancel', id).catch(() => undefined)
      }
    }
  },
  async openBrowser(url) {
    const { openUrl } = await import('@tauri-apps/plugin-opener')
    await openUrl(url)
  },
  fetch: oauthFetch
}

/**
 * Signs in to a connection: registers Kalka with the server's authorization server, opens the
 * authorization page in the browser, and waits for its redirect to a loopback address the main
 * process listens on. A new sign-in replaces the previous registration and tokens.
 */
export async function signInMCPConnection(
  connection: OAuthConnection,
  environment: SignInEnvironment = desktopSignIn
): Promise<void> {
  if (environment === desktopSignIn && !isTauri()) {
    throw new Error('Sign-in to MCP servers needs the desktop app')
  }
  const loopback = await environment.listen()
  try {
    const provider = new ConnectionOAuthProvider(connection, {
      redirectURL: `http://127.0.0.1:${loopback.port}/callback`
    })
    const options = { serverUrl: connection.transport.url, fetchFn: environment.fetch }
    if ((await auth(provider, options)) === 'AUTHORIZED') return
    if (!provider.authorizationURL) throw new Error('The server did not start a sign-in')
    await environment.openBrowser(provider.authorizationURL.toString())

    const callback = v.parse(OAuthCallback, await loopback.answer())
    if (callback.error === 'timeout') throw new Error('The sign-in timed out')
    if (callback.error || !callback.code) {
      throw new Error(
        `The server refused the sign-in${callback.error ? `: ${callback.error}` : ''}`
      )
    }
    if (callback.state !== provider.state()) throw new Error('The sign-in answer did not match')
    const result = await auth(provider, {
      ...options,
      authorizationCode: callback.code,
      iss: callback.iss
    })
    if (result !== 'AUTHORIZED') throw new Error('The server did not grant access')
  } finally {
    await loopback.stop()
  }
}

/** Forgets a connection's sign-in. */
export async function signOutMCPConnection(connection: OAuthConnection): Promise<void> {
  await appCredentialServices.manager.clear(connection.authentication.credentialRef)
}
