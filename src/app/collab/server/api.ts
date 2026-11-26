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

/** What members who open a server file by its link may do: change it, or only look. */
export const serverLinkRoleSchema = v.picklist(['edit', 'view'])
export type ServerLinkRole = v.InferOutput<typeof serverLinkRoleSchema>

export const serverDocumentSchema = v.object({
  id: v.string(),
  name: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
  hasFile: v.boolean(),
  /** Who made it; a server older than link roles may not say. */
  createdBy: v.optional(v.string()),
  /** A server older than link roles shares every file to edit. */
  linkRole: v.optional(serverLinkRoleSchema, 'edit'),
  /** For a branch, the file it branches from; a server older than branches has none. */
  branchOf: v.optional(v.nullable(v.string()), null)
})
export type ServerDocument = v.InferOutput<typeof serverDocumentSchema>

/**
 * The server's files as Home lists them, as Figma lists branches under their main file rather
 * than as files of their own: the main files, and each one's branches in the server's order. A
 * branch whose main file is not in the list stays a file of its own.
 */
export function groupServerBranches(documents: readonly ServerDocument[]): {
  files: ServerDocument[]
  branches: Map<string, ServerDocument[]>
} {
  const ids = new Set(documents.map((document) => document.id))
  const branches = new Map<string, ServerDocument[]>()
  const files: ServerDocument[] = []
  for (const document of documents) {
    const main = document.branchOf
    if (main && ids.has(main)) branches.set(main, [...(branches.get(main) ?? []), document])
    else files.push(document)
  }
  return { files, branches }
}

/** A version the server keeps of a file: every half hour it is saved, named, or before a restore. */
export const serverVersionSchema = v.object({
  id: v.string(),
  createdAt: v.number(),
  kind: v.picklist(['auto', 'named', 'restore']),
  label: v.nullable(v.string()),
  by: v.nullable(v.string()),
  size: v.number()
})
export type ServerVersion = v.InferOutput<typeof serverVersionSchema>

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

/** One call to a Kalka server's API, its reply checked against `schema`. */
export async function serverRequest<S extends v.GenericSchema>(
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
/** A Kalka file the server sends as it is, or null when it has none. */
async function serverBytes(base: string, token: string, path: string): Promise<Response | null> {
  let response: Response
  try {
    response = await fetch(`${base}${path}`, { headers: { Authorization: `Bearer ${token}` } })
  } catch {
    throw new ServerRequestError(0, 'unreachable')
  }
  if (response.status === 404) return null
  if (!response.ok) throw new ServerRequestError(response.status, `HTTP ${response.status}`)
  return response
}

async function versionFile(
  base: string,
  token: string,
  id: string,
  versionId: string
): Promise<Uint8Array | null> {
  const response = await serverBytes(base, token, `/api/documents/${id}/versions/${versionId}/file`)
  return response ? new Uint8Array(await response.arrayBuffer()) : null
}

/** Where a branch began, as the main file was then; null from a server that keeps none. */
async function branchBase(base: string, token: string, id: string): Promise<Uint8Array | null> {
  const response = await serverBytes(base, token, `/api/documents/${id}/base`)
  return response ? new Uint8Array(await response.arrayBuffer()) : null
}

/** A branch's main file as it is now, with when it was saved. */
export interface BranchMainFile {
  data: Uint8Array
  savedAt: number
}

async function branchMain(base: string, token: string, id: string): Promise<BranchMainFile | null> {
  const response = await serverBytes(base, token, `/api/documents/${id}/main`)
  if (!response) return null
  const data = new Uint8Array(await response.arrayBuffer())
  return { data, savedAt: Number(response.headers.get('X-Kalka-Saved-At') ?? 0) }
}

async function pendingVersion(
  base: string,
  token: string,
  id: string
): Promise<PendingVersion | null> {
  const response = await serverBytes(base, token, `/api/documents/${id}/pending`)
  if (!response) return null
  const data = new Uint8Array(await response.arrayBuffer())
  return { data, version: response.headers.get('X-Kalka-Version') ?? '' }
}

export const serverAPI = {
  info: (base: string) => serverRequest(base, '/api/server', { schema: serverInfoSchema }),
  signIn: (base: string, email: string, password: string) =>
    serverRequest(base, '/api/auth/login', {
      method: 'POST',
      body: { email, password },
      schema: sessionSchema
    }),
  /** With `verifier`, the PKCE verifier of the single sign-on that produced the code. */
  exchange: (base: string, code: string, verifier?: string) =>
    serverRequest(base, '/api/auth/exchange', {
      method: 'POST',
      body: verifier ? { code, verifier } : { code },
      schema: sessionSchema
    }),
  signOut: (base: string, token: string) =>
    serverRequest(base, '/api/auth/logout', { method: 'POST', token, schema: v.unknown() }),
  me: (base: string, token: string) =>
    serverRequest(base, '/api/me', { token, schema: serverUserSchema }),
  documents: (base: string, token: string) =>
    serverRequest(base, '/api/documents', { token, schema: v.array(serverDocumentSchema) }),
  createDocument: (base: string, token: string, name: string) =>
    serverRequest(base, '/api/documents', {
      method: 'POST',
      token,
      body: { name },
      schema: serverDocumentSchema
    }),
  renameDocument: (base: string, token: string, id: string, name: string) =>
    serverRequest(base, `/api/documents/${id}`, {
      method: 'PATCH',
      token,
      body: { name },
      schema: serverDocumentSchema
    }),
  setLinkRole: (base: string, token: string, id: string, linkRole: ServerLinkRole) =>
    serverRequest(base, `/api/documents/${id}`, {
      method: 'PATCH',
      token,
      body: { linkRole },
      schema: serverDocumentSchema
    }),
  ticket: (base: string, token: string, id: string) =>
    serverRequest(base, `/api/documents/${id}/ticket`, {
      method: 'POST',
      token,
      body: {},
      schema: ticketSchema
    }),
  document: (base: string, token: string, id: string) =>
    serverRequest(base, `/api/documents/${id}`, { token, schema: serverDocumentSchema }),
  branches: (base: string, token: string, id: string) =>
    serverRequest(base, `/api/documents/${id}/branches`, {
      token,
      schema: v.array(serverDocumentSchema)
    }),
  createBranch: (base: string, token: string, id: string, name: string) =>
    serverRequest(base, `/api/documents/${id}/branches`, {
      method: 'POST',
      token,
      body: { name },
      schema: serverDocumentSchema
    }),
  /** Merges a branch into the file it comes from; `force` replaces changes made there since. */
  mergeBranch: (base: string, token: string, id: string, force: boolean) =>
    serverRequest(base, `/api/documents/${id}/merge`, {
      method: 'POST',
      token,
      body: { force },
      schema: serverDocumentSchema
    }),
  branchBase,
  branchMain,
  /** Records that a branch now holds its main file's changes as saved at `savedAt`. */
  updateBranch: (base: string, token: string, id: string, savedAt: number) =>
    serverRequest(base, `/api/documents/${id}/update`, {
      method: 'POST',
      token,
      body: { savedAt },
      schema: serverDocumentSchema
    }),
  /** Merges a file made from the main file saved at `mainSavedAt` and the changes chosen. */
  mergeBranchFile: (
    base: string,
    token: string,
    id: string,
    data: Uint8Array,
    mainSavedAt: number
  ) =>
    serverRequest(base, `/api/documents/${id}/merge?mainSavedAt=${mainSavedAt}`, {
      method: 'POST',
      token,
      raw: new Blob([new Uint8Array(data)], { type: 'application/vnd.kalka+zip' }),
      schema: serverDocumentSchema
    }),
  versions: (base: string, token: string, id: string) =>
    serverRequest(base, `/api/documents/${id}/versions`, {
      token,
      schema: v.array(serverVersionSchema)
    }),
  saveVersion: (base: string, token: string, id: string, label: string) =>
    serverRequest(base, `/api/documents/${id}/versions`, {
      method: 'POST',
      token,
      body: { label },
      schema: serverVersionSchema
    }),
  versionFile,
  /** Puts a version back, keeping the file as it is first under `before`. */
  restoreVersion: (base: string, token: string, id: string, versionId: string, before: string) =>
    serverRequest(base, `/api/documents/${id}/versions/${versionId}/restore`, {
      method: 'POST',
      token,
      body: { before },
      schema: v.object({ restored: v.boolean() })
    }),
  pending: pendingVersion,
  /** Dismisses a waiting version; `dismissed` is false when another window took it first. */
  dismissPending: (base: string, token: string, id: string, version: string) =>
    serverRequest(base, `/api/documents/${id}/pending?version=${encodeURIComponent(version)}`, {
      method: 'DELETE',
      token,
      schema: v.object({ dismissed: v.boolean() })
    }),
  saveFile: (base: string, token: string, id: string, data: Uint8Array) =>
    serverRequest(base, `/api/documents/${id}/file`, {
      method: 'PUT',
      token,
      raw: new Blob([new Uint8Array(data)]),
      schema: v.unknown()
    })
}
