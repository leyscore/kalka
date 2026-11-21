import * as v from 'valibot'

/** The HTTP API of a Kalka server (`kalka-server/src/index.ts`). */

export const serverRoleSchema = v.picklist(['admin', 'editor', 'viewer'])

export const serverUserSchema = v.object({
  id: v.string(),
  email: v.string(),
  name: v.string(),
  role: serverRoleSchema,
  source: v.picklist(['local', 'sso'])
})
export type ServerUser = v.InferOutput<typeof serverUserSchema>

export const serverInfoSchema = v.object({
  kalkaServer: v.literal(true),
  name: v.string(),
  version: v.string(),
  protocol: v.number(),
  setupRequired: v.boolean(),
  auth: v.object({
    password: v.boolean(),
    sso: v.nullable(v.object({ label: v.string(), startPath: v.string() }))
  })
})
export type ServerInfo = v.InferOutput<typeof serverInfoSchema>

const sessionSchema = v.object({ token: v.string(), user: serverUserSchema })
export type ServerSession = v.InferOutput<typeof sessionSchema>

export const serverDocumentSchema = v.object({
  id: v.string(),
  name: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
  hasFile: v.boolean()
})
export type ServerDocument = v.InferOutput<typeof serverDocumentSchema>

const ticketSchema = v.object({ url: v.string(), role: serverRoleSchema })
const errorSchema = v.object({ error: v.string() })

export class ServerRequestError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message)
    this.name = 'ServerRequestError'
  }
}

/**
 * `kalka.acme.com` or `https://kalka.acme.com/` as `https://kalka.acme.com`, and `localhost:8787`
 * as `http://localhost:8787`; null if not a URL.
 */
export function normalizeServerURL(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  // Another scheme (ftp:, javascript:) is refused, not taken for a host; `host:8787` is a port.
  if (/^[a-z][a-z0-9+.-]*:(?!\d)/i.test(trimmed) && !/^https?:\/\//i.test(trimmed)) return null
  // Without a scheme, a server on this machine is plain HTTP, as development servers are.
  const local = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/|$)/i.test(trimmed)
  const withScheme = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `${local ? 'http' : 'https'}://${trimmed}`
  try {
    const url = new URL(withScheme)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    return `${url.origin}${url.pathname.replace(/\/+$/, '')}`
  } catch {
    return null
  }
}

interface RequestOptions<S extends v.GenericSchema> {
  method?: string
  token?: string | null
  body?: unknown
  raw?: BodyInit
  schema: S
}

async function request<S extends v.GenericSchema>(
  base: string,
  path: string,
  { method = 'GET', token, body, raw, schema }: RequestOptions<S>
): Promise<v.InferOutput<S>> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  let response: Response
  try {
    response = await fetch(`${base}${path}`, {
      method,
      headers,
      body: raw ?? (body === undefined ? undefined : JSON.stringify(body))
    })
  } catch {
    throw new ServerRequestError(0, 'unreachable')
  }
  const text = await response.text()
  if (!response.ok) {
    const parsed = v.safeParse(v.pipe(v.string(), v.parseJson(), errorSchema), text)
    throw new ServerRequestError(
      response.status,
      parsed.success ? parsed.output.error : `HTTP ${response.status}`
    )
  }
  const parsed = v.safeParse(v.pipe(v.string(), v.parseJson(), schema), text)
  if (!parsed.success) throw new ServerRequestError(response.status, 'not-a-kalka-server')
  return parsed.output
}

/** A version uploaded outside Kalka (WebDAV, a restore), waiting to be applied. */
export interface PendingVersion {
  data: Uint8Array
  version: string
}

/** The waiting version of a document, or null when none waits. */
async function pendingVersion(
  base: string,
  token: string,
  id: string
): Promise<PendingVersion | null> {
  let response: Response
  try {
    response = await fetch(`${base}/api/documents/${id}/pending`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  } catch {
    throw new ServerRequestError(0, 'unreachable')
  }
  if (response.status === 404) return null
  if (!response.ok) throw new ServerRequestError(response.status, `HTTP ${response.status}`)
  const data = new Uint8Array(await response.arrayBuffer())
  return { data, version: response.headers.get('X-Kalka-Version') ?? '' }
}

export const serverAPI = {
  info: (base: string) => request(base, '/api/server', { schema: serverInfoSchema }),
  signIn: (base: string, email: string, password: string) =>
    request(base, '/api/auth/login', {
      method: 'POST',
      body: { email, password },
      schema: sessionSchema
    }),
  exchange: (base: string, code: string) =>
    request(base, '/api/auth/exchange', { method: 'POST', body: { code }, schema: sessionSchema }),
  signOut: (base: string, token: string) =>
    request(base, '/api/auth/logout', { method: 'POST', token, schema: v.unknown() }),
  me: (base: string, token: string) =>
    request(base, '/api/me', { token, schema: serverUserSchema }),
  documents: (base: string, token: string) =>
    request(base, '/api/documents', { token, schema: v.array(serverDocumentSchema) }),
  createDocument: (base: string, token: string, name: string) =>
    request(base, '/api/documents', {
      method: 'POST',
      token,
      body: { name },
      schema: serverDocumentSchema
    }),
  renameDocument: (base: string, token: string, id: string, name: string) =>
    request(base, `/api/documents/${id}`, {
      method: 'PATCH',
      token,
      body: { name },
      schema: serverDocumentSchema
    }),
  ticket: (base: string, token: string, id: string) =>
    request(base, `/api/documents/${id}/ticket`, {
      method: 'POST',
      token,
      body: {},
      schema: ticketSchema
    }),
  document: (base: string, token: string, id: string) =>
    request(base, `/api/documents/${id}`, { token, schema: serverDocumentSchema }),
  pending: pendingVersion,
  /** Dismisses a waiting version; `dismissed` is false when another window took it first. */
  dismissPending: (base: string, token: string, id: string, version: string) =>
    request(base, `/api/documents/${id}/pending?version=${encodeURIComponent(version)}`, {
      method: 'DELETE',
      token,
      schema: v.object({ dismissed: v.boolean() })
    }),
  saveFile: (base: string, token: string, id: string, data: Uint8Array) =>
    request(base, `/api/documents/${id}/file`, {
      method: 'PUT',
      token,
      raw: new Blob([new Uint8Array(data)]),
      schema: v.unknown()
    })
}
