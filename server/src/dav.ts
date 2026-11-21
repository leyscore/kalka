// WebDAV: the server's files as one folder of `.kalka` archives, for Finder, Windows, Nextcloud
// (External storage), rclone and other sync clients. Sign-in is Basic auth with an email and an
// app password. The server never opens an archive: every request stays a few database reads,
// within the free Workers plan's CPU time.
import type { DocumentInfo, Env, User } from './env'
import { clientIp, directoryOf, HttpError, MAX_FILE_BYTES, roomOf, tenantOf } from './http'
import { directoryName } from './names'

export const DAV_PREFIX = '/dav'
const ROOT = `${DAV_PREFIX}/`
const CONTENT_TYPE = 'application/vnd.kalka+zip'
const EXTENSION = '.kalka'
/** Files desktops write next to others (Finder's `._x`, `.DS_Store`, Windows' thumbnails, office locks). */
const SIDECAR = /^(\._.*|\.ds_store|desktop\.ini|thumbs\.db|\.~lock\..*|~\$.*)$/i
const ALLOW = 'OPTIONS, GET, HEAD, PUT, DELETE, PROPFIND, PROPPATCH, MKCOL, COPY, MOVE, LOCK, UNLOCK'

export type DavHooks = {
  /** Tells the server what happened (an event, as every route emits). */
  emit(user: User | null, action: string, target: string | null, detail?: Record<string, unknown>): Promise<void>
}

function escapeXml(text: string): string {
  return text.replace(/[<>&"']/g, (char) => `&#${char.charCodeAt(0)};`)
}

function text(status: number, message: string, headers: Record<string, string> = {}): Response {
  return new Response(message ? `${message}\n` : null, {
    status,
    headers: message ? { 'Content-Type': 'text/plain; charset=utf-8', ...headers } : headers
  })
}

function xml(status: number, body: string, headers: Record<string, string> = {}): Response {
  return new Response(`<?xml version="1.0" encoding="utf-8"?>\n${body}`, {
    status,
    headers: { 'Content-Type': 'application/xml; charset=utf-8', ...headers }
  })
}

/** A document's name as a file name: what Windows and macOS refuse becomes a dash. */
function safeName(name: string): string {
  const cleaned = name
    .replace(/[\u0000-\u001f\\/:*?"<>|]+/g, '-')
    .replace(/\.kalka$/i, '')
    .replace(/^[\s.]+|[\s.]+$/g, '')
  return cleaned || 'Untitled'
}

/**
 * File names for every document. Two documents with the same name get the start of their ID,
 * so each name always leads to the same document.
 */
function fileNames(docs: DocumentInfo[]): Map<string, { name: string; doc: DocumentInfo }> {
  const counts = new Map<string, number>()
  for (const doc of docs) {
    const key = safeName(doc.name).toLowerCase()
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const byName = new Map<string, { name: string; doc: DocumentInfo }>()
  for (const doc of docs) {
    const base = safeName(doc.name)
    const name = `${(counts.get(base.toLowerCase()) ?? 0) > 1 ? `${base} (${doc.id.slice(0, 6)})` : base}${EXTENSION}`
    byName.set(name.toLowerCase(), { name, doc })
  }
  return byName
}

function stemOf(fileName: string): string {
  return fileName.replace(/\.kalka$/i, '').trim().slice(0, 200) || 'Untitled'
}

function hrefOf(name: string): string {
  return ROOT + encodeURIComponent(name)
}

function etagOf(doc: DocumentInfo): string {
  return `"${doc.id}-${doc.fileSavedAt ?? doc.updatedAt}"`
}

function modifiedOf(doc: DocumentInfo): number {
  return doc.fileSavedAt ?? doc.updatedAt
}

const SUPPORTED_LOCK =
  '<d:supportedlock><d:lockentry><d:lockscope><d:exclusive/></d:lockscope><d:locktype><d:write/></d:locktype></d:lockentry></d:supportedlock>'

function propResponse(href: string, props: string): string {
  return `<d:response><d:href>${escapeXml(href)}</d:href><d:propstat><d:prop>${props}</d:prop><d:status>HTTP/1.1 200 OK</d:status></d:propstat></d:response>`
}

function folderProps(serverName: string, modified: number): string {
  return (
    `<d:displayname>${escapeXml(serverName)}</d:displayname><d:resourcetype><d:collection/></d:resourcetype>` +
    `<d:getlastmodified>${new Date(modified).toUTCString()}</d:getlastmodified>` +
    `<d:creationdate>${new Date(modified).toISOString()}</d:creationdate>` +
    `<d:getetag>"root-${modified}"</d:getetag>${SUPPORTED_LOCK}<d:lockdiscovery/>`
  )
}

function fileProps(name: string, doc: DocumentInfo): string {
  return (
    `<d:displayname>${escapeXml(name)}</d:displayname><d:resourcetype/>` +
    `<d:getcontentlength>${doc.fileSize ?? 0}</d:getcontentlength>` +
    `<d:getcontenttype>${CONTENT_TYPE}</d:getcontenttype>` +
    `<d:getetag>${escapeXml(etagOf(doc))}</d:getetag>` +
    `<d:getlastmodified>${new Date(modifiedOf(doc)).toUTCString()}</d:getlastmodified>` +
    `<d:creationdate>${new Date(doc.createdAt).toISOString()}</d:creationdate>${SUPPORTED_LOCK}<d:lockdiscovery/>`
  )
}

async function signIn(env: Env, request: Request): Promise<User | Response> {
  const header = request.headers.get('Authorization') ?? ''
  const directory = directoryOf(env)
  const challenge = {
    'WWW-Authenticate': `Basic realm="${String(env.KALKA_SERVER_NAME ?? 'Kalka').replace(/"/g, '')}", charset="UTF-8"`
  }
  if (header.startsWith('Bearer ')) {
    const user = await directory.authenticate(header.slice(7).trim())
    return user ?? text(401, 'Sign in again.', challenge)
  }
  if (!header.startsWith('Basic ')) return text(401, 'Sign in with your email and an app password.', challenge)
  let decoded = ''
  try {
    decoded = new TextDecoder().decode(Uint8Array.from(atob(header.slice(6).trim()), (c) => c.charCodeAt(0)))
  } catch {
    return text(400, 'Malformed credentials.')
  }
  const at = decoded.indexOf(':')
  const email = at < 0 ? decoded : decoded.slice(0, at)
  const password = at < 0 ? '' : decoded.slice(at + 1)
  const ip = clientIp(request, env)
  const result = await directory.appPasswordSignIn(email, password, `dav:${ip === 'unknown' ? email.toLowerCase() : ip}`)
  if (result === 'limited') return text(429, 'Too many attempts. Wait a few minutes and try again.')
  if (!result) return text(401, 'Wrong email or app password. Create an app password in the console, under Your account.', challenge)
  return result
}

/** What the request names, decoded: '' for the folder, null for anything deeper. */
function relativeName(path: string): string | null {
  if (path === DAV_PREFIX || path === ROOT) return ''
  let name: string
  try {
    name = decodeURIComponent(path.slice(ROOT.length))
  } catch {
    return null
  }
  name = name.replace(/\/+$/, '')
  return name.includes('/') ? null : name
}

function destinationName(request: Request): string | null {
  const header = request.headers.get('Destination')
  if (!header) return null
  try {
    const name = relativeName(new URL(header, request.url).pathname)
    return name ? name : null
  } catch {
    return null
  }
}

function canEdit(user: User): boolean {
  return user.role === 'admin' || user.role === 'editor'
}

async function readBody(request: Request): Promise<ArrayBuffer> {
  const declared = Number(request.headers.get('Content-Length') ?? 0)
  if (declared > MAX_FILE_BYTES) throw new HttpError(413, 'This file is too large.')
  const data = await request.arrayBuffer()
  if (data.byteLength > MAX_FILE_BYTES) throw new HttpError(413, 'This file is too large.')
  // A Kalka file is a ZIP archive; anything else would wait as a version Kalka cannot open.
  if (data.byteLength > 0 && !isZip(data)) throw new HttpError(415, 'This is not a Kalka file.')
  return data
}

/** Whether the bytes start as a ZIP archive does, the only check that needs no unpacking. */
function isZip(data: ArrayBuffer): boolean {
  const head = new Uint8Array(data, 0, Math.min(4, data.byteLength))
  return head.length === 4 && head[0] === 0x50 && head[1] === 0x4b && head[2] === 0x03 && head[3] === 0x04
}

function lockResponse(request: Request, href: string, status: number, owner: string): Response {
  const existing = /<(opaquelocktoken:[^>]+)>/.exec(request.headers.get('If') ?? '')?.[1]
  const token = existing ?? `opaquelocktoken:${crypto.randomUUID()}`
  const body =
    '<d:prop xmlns:d="DAV:"><d:lockdiscovery><d:activelock>' +
    '<d:locktype><d:write/></d:locktype><d:lockscope><d:exclusive/></d:lockscope><d:depth>0</d:depth>' +
    (owner ? `<d:owner>${owner}</d:owner>` : '') +
    `<d:timeout>Second-3600</d:timeout><d:locktoken><d:href>${escapeXml(token)}</d:href></d:locktoken>` +
    `<d:lockroot><d:href>${escapeXml(href)}</d:href></d:lockroot></d:activelock></d:lockdiscovery></d:prop>`
  return xml(status, body, { 'Lock-Token': `<${token}>` })
}

/** The owner a LOCK request names, kept as sent (it is XML already) but stripped of markup risks. */
function lockOwner(body: string): string {
  const inner = /<(?:\w+:)?owner[^>]*>([\s\S]*?)<\/(?:\w+:)?owner>/i.exec(body)?.[1] ?? ''
  const href = /<(?:\w+:)?href[^>]*>([\s\S]*?)<\/(?:\w+:)?href>/i.exec(inner)?.[1]
  const value = (href ?? inner).replace(/<[^>]*>/g, '').trim().slice(0, 200)
  return value ? (href ? `<d:href>${escapeXml(value)}</d:href>` : escapeXml(value)) : ''
}

export async function dav(env: Env, request: Request, path: string, hooks: DavHooks): Promise<Response> {
  const method = request.method.toUpperCase()
  if (method === 'OPTIONS') {
    return new Response(null, { headers: { DAV: '1, 2', Allow: ALLOW, 'MS-Author-Via': 'DAV' } })
  }
  const signedIn = await signIn(env, request)
  if (signedIn instanceof Response) {
    if (signedIn.status === 401 && request.headers.get('Authorization')) {
      await hooks.emit(null, 'auth.login_failed', null, { method: 'webdav' })
    }
    return signedIn
  }
  const user = signedIn
  const name = relativeName(path)
  if (name === null) return text(method === 'PUT' || method === 'MKCOL' ? 409 : 404, 'Files sit in one folder; there are no subfolders.')

  const directory = directoryOf(env)
  const docs = await directory.listDocuments()
  const names = fileNames(docs)
  const entry = name ? names.get(name.toLowerCase()) : undefined
  const sidecar = name !== '' && SIDECAR.test(name)
  const href = name ? hrefOf(entry?.name ?? name) : ROOT
  const writeDenied = () => text(403, 'Your role does not allow changes. Ask an administrator.')

  /** Sizes of files saved before the server kept them, read once from their rooms. */
  async function withSizes(list: { name: string; doc: DocumentInfo }[]) {
    for (const item of list) {
      if (!item.doc.hasFile || item.doc.fileSize !== null) continue
      const info = await roomOf(env, item.doc.id).fileInfo()
      if (info) {
        item.doc.fileSize = info.size
        item.doc.fileSavedAt ??= info.savedAt || null
        await directory.setFileInfo(item.doc.id, info.size, info.savedAt || item.doc.updatedAt)
      }
    }
  }

  switch (method) {
    case 'PROPFIND': {
      if (name === '') {
        const depth = request.headers.get('Depth') ?? 'infinity'
        const list = depth === '0' ? [] : [...names.values()]
        await withSizes(list)
        const newest = docs.reduce((max, doc) => Math.max(max, modifiedOf(doc)), 0) || Date.now()
        const serverName = String(env.KALKA_SERVER_NAME ?? 'Kalka')
        const body = [propResponse(ROOT, folderProps(serverName, newest)), ...list.map((item) => propResponse(hrefOf(item.name), fileProps(item.name, item.doc)))]
        return xml(207, `<d:multistatus xmlns:d="DAV:">${body.join('')}</d:multistatus>`)
      }
      if (!entry) return text(404, 'No such file.')
      await withSizes([entry])
      return xml(207, `<d:multistatus xmlns:d="DAV:">${propResponse(href, fileProps(entry.name, entry.doc))}</d:multistatus>`)
    }

    case 'GET':
    case 'HEAD': {
      if (name === '') {
        const list = [...names.values()]
        const html = `<!doctype html><meta charset="utf-8"><title>Kalka files</title><ul>${list.map((item) => `<li><a href="${escapeXml(hrefOf(item.name))}">${escapeXml(item.name)}</a></li>`).join('')}</ul>`
        return new Response(method === 'HEAD' ? null : html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
      }
      if (!entry) return text(404, 'No such file.')
      const headers = {
        'Content-Type': CONTENT_TYPE,
        ETag: etagOf(entry.doc),
        'Last-Modified': new Date(modifiedOf(entry.doc)).toUTCString()
      }
      if (request.headers.get('If-None-Match') === headers.ETag) return new Response(null, { status: 304, headers })
      if (method === 'HEAD') {
        await withSizes([entry])
        return new Response(null, { headers: { ...headers, 'Content-Length': String(entry.doc.fileSize ?? 0) } })
      }
      const data = entry.doc.hasFile ? await roomOf(env, entry.doc.id).getFile() : null
      await hooks.emit(user, 'document.exported', entry.doc.id, { name: entry.doc.name, via: 'webdav' })
      return new Response(data ?? new Uint8Array(), { headers: { ...headers, 'Content-Length': String(data?.byteLength ?? 0) } })
    }

    case 'PUT': {
      if (!canEdit(user)) return writeDenied()
      if (sidecar) {
        await request.body?.cancel()
        return new Response(null, { status: 201 })
      }
      if (name === '') return text(405, 'This is the folder.')
      if (!name.toLowerCase().endsWith(EXTENSION)) return text(403, 'Only .kalka files can be saved here.')
      if (entry && request.headers.get('If-None-Match') === '*') return text(412, 'This file already exists.')
      const data = await readBody(request)
      const directoryKey = directoryName(tenantOf(env))
      if (entry) {
        // An empty upload (some clients create a file before writing it) keeps the archive.
        if (data.byteLength > 0) {
          await roomOf(env, entry.doc.id).putFile(data, entry.doc.id, directoryKey, true)
          await directory.setPending(entry.doc.id, user.name)
          await hooks.emit(user, 'document.uploaded', entry.doc.id, { name: entry.doc.name, via: 'webdav', bytes: data.byteLength })
        }
        return new Response(null, { status: 204, headers: { ETag: `"${entry.doc.id}-${Date.now()}"` } })
      }
      const doc = await directory.createDocument(stemOf(name), user.id)
      if (data.byteLength > 0) {
        await roomOf(env, doc.id).putFile(data, doc.id, directoryKey, true)
        await directory.setPending(doc.id, user.name)
      }
      await hooks.emit(user, 'document.created', doc.id, { name: doc.name, via: 'webdav', bytes: data.byteLength })
      return new Response(null, { status: 201, headers: { ETag: `"${doc.id}-${Date.now()}"` } })
    }

    case 'DELETE': {
      if (!canEdit(user)) return writeDenied()
      if (sidecar) return new Response(null, { status: 204 })
      if (name === '') return text(403, 'The folder itself cannot be deleted.')
      if (!entry) return text(404, 'No such file.')
      // Deleting over WebDAV moves the document to the trash, as in Kalka.
      await directory.deleteDocument(entry.doc.id, user.id)
      await roomOf(env, entry.doc.id).closeAll()
      await hooks.emit(user, 'document.trashed', entry.doc.id, { name: entry.doc.name, via: 'webdav' })
      return new Response(null, { status: 204 })
    }

    case 'MOVE':
    case 'COPY': {
      if (!canEdit(user)) return writeDenied()
      const target = destinationName(request)
      if (!target) return text(400, 'Give a Destination in this folder.')
      if (sidecar) return new Response(null, { status: 201 })
      if (!entry) return text(404, 'No such file.')
      if (!target.toLowerCase().endsWith(EXTENSION)) return text(403, 'Only .kalka files can be saved here.')
      const existing = names.get(target.toLowerCase())
      if (existing?.doc.id === entry.doc.id) {
        if (method === 'COPY') return text(403, 'A file cannot be copied onto itself.')
        await directory.renameDocument(entry.doc.id, stemOf(target))
        return new Response(null, { status: 201 })
      }
      if (existing) {
        if ((request.headers.get('Overwrite') ?? 'T').toUpperCase() === 'F') return text(412, 'A file with this name exists.')
        await directory.deleteDocument(existing.doc.id)
        await roomOf(env, existing.doc.id).destroy()
        await hooks.emit(user, 'document.deleted', existing.doc.id, { name: existing.doc.name, via: 'webdav' })
      }
      if (method === 'MOVE') {
        await directory.renameDocument(entry.doc.id, stemOf(target))
        await hooks.emit(user, 'document.renamed', entry.doc.id, { from: entry.doc.name, to: stemOf(target), via: 'webdav' })
      } else {
        const copy = await directory.createDocument(stemOf(target), user.id)
        const data = entry.doc.hasFile ? await roomOf(env, entry.doc.id).getFile() : null
        if (data) {
          await roomOf(env, copy.id).putFile(data, copy.id, directoryName(tenantOf(env)), true)
          await directory.setPending(copy.id, user.name)
        }
        await hooks.emit(user, 'document.created', copy.id, { name: copy.name, via: 'webdav', copyOf: entry.doc.id })
      }
      return new Response(null, { status: existing ? 204 : 201 })
    }

    case 'MKCOL':
      return text(403, 'Files sit in one folder; there are no subfolders.')

    case 'PROPPATCH': {
      // Clients set times and Finder flags; the server keeps none of them, and says they took.
      if (name !== '' && !entry && !sidecar) return text(404, 'No such file.')
      await request.text()
      return xml(207, `<d:multistatus xmlns:d="DAV:"><d:response><d:href>${escapeXml(href)}</d:href><d:propstat><d:prop/><d:status>HTTP/1.1 200 OK</d:status></d:propstat></d:response></d:multistatus>`)
    }

    case 'LOCK': {
      // Locks are advisory: the server hands out tokens so Finder and Office mount read-write,
      // and Kalka's own merging keeps concurrent edits safe.
      if (!canEdit(user)) return writeDenied()
      const owner = lockOwner(await request.text())
      return lockResponse(request, href, name === '' || entry || sidecar ? 200 : 201, owner)
    }

    case 'UNLOCK':
      return new Response(null, { status: 204 })

    default:
      return text(405, 'Not supported here.', { Allow: ALLOW })
  }
}
