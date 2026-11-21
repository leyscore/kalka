import { DurableObject } from 'cloudflare:workers'

import { randomId } from './crypto'
import type { Env, Role } from './env'
import {
  decodeFrame,
  decodeU32,
  encodeAction,
  encodePeerEvent,
  encodeU32,
  encodeWelcome,
  FRAME_JOIN,
  FRAME_LEAVE,
  SERVER_COMPACT,
  SERVER_LOAD,
  SERVER_PEER,
  SERVER_PENDING,
  SERVER_SNAPSHOT,
  SYNC_REPLY,
  YJS_UPDATE
} from './protocol'

/** Rows hold at most 8 MB; documents are stored in parts well under that. */
const PART_BYTES = 1024 * 1024
/** Past either, the room asks an editor for a fresh snapshot to replace the log. */
const COMPACT_AFTER_UPDATES = 300
const COMPACT_AFTER_BYTES = 8 * 1024 * 1024
const COMPACT_RETRY_MS = 60_000
const TOUCH_EVERY_MS = 60_000

/** Close codes: the person may no longer open the room, or must reopen it with a new role. */
export const CLOSE_REVOKED = 4401
export const CLOSE_ROLE_CHANGED = 4403

/** `srv-load` items: the parts of the deflated snapshot, then log updates, then done. */
export const LOAD_SNAPSHOT_PART = 1
export const LOAD_UPDATE = 2
export const LOAD_DONE = 3

type Attachment = { peerId: string; userId: string; name: string; role: Role }

const SCHEMA = `
CREATE TABLE IF NOT EXISTS log (seq INTEGER NOT NULL, part INTEGER NOT NULL, data BLOB NOT NULL, PRIMARY KEY (seq, part));
CREATE TABLE IF NOT EXISTS snapshot (part INTEGER PRIMARY KEY, data BLOB NOT NULL);
CREATE TABLE IF NOT EXISTS file (part INTEGER PRIMARY KEY, data BLOB NOT NULL);
CREATE TABLE IF NOT EXISTS pending (part INTEGER PRIMARY KEY, data BLOB NOT NULL);
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`

function withKind(kind: number, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(data.length + 1)
  out[0] = kind
  out.set(data, 1)
  return out
}

function joinParts(parts: ArrayBuffer[]): Uint8Array {
  const size = parts.reduce((sum, part) => sum + part.byteLength, 0)
  const out = new Uint8Array(size)
  let at = 0
  for (const part of parts) {
    out.set(new Uint8Array(part), at)
    at += part.byteLength
  }
  return out
}

/**
 * One document: it relays what editors send each other, and keeps the document so it opens
 * when nobody else is online. It never decodes the document: Kalka merges and compacts it, so
 * every message stays within the few milliseconds of CPU the free Workers plan allows.
 */
export class DocumentRoom extends DurableObject<Env> {
  private sql: SqlStorage
  private compactRequestedAt = 0
  private lastTouch = 0

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    this.sql = ctx.storage.sql
    this.sql.exec(SCHEMA)
  }

  private meta(key: string): string | undefined {
    const row = this.sql.exec('SELECT value FROM meta WHERE key = ?', key).toArray()[0]
    return row ? String(row.value) : undefined
  }

  private setMeta(key: string, value: string | number): void {
    this.sql.exec('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', key, String(value))
  }

  private numberMeta(key: string): number {
    return Number(this.meta(key) ?? 0)
  }

  private sockets(): { ws: WebSocket; info: Attachment }[] {
    return this.ctx.getWebSockets().flatMap((ws) => {
      const info = ws.deserializeAttachment() as Attachment | null
      return info ? [{ ws, info }] : []
    })
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected a WebSocket', { status: 426 })
    }
    const documentId = request.headers.get('X-Kalka-Document') ?? ''
    if (documentId) this.setMeta('document', documentId)
    const directory = request.headers.get('X-Kalka-Directory')
    if (directory) this.setMeta('directory', directory)
    const info: Attachment = {
      peerId: randomId(12),
      userId: request.headers.get('X-Kalka-User') ?? '',
      name: decodeURIComponent(request.headers.get('X-Kalka-Name') ?? ''),
      role: (request.headers.get('X-Kalka-Role') as Role | null) ?? 'viewer'
    }
    const { 0: client, 1: server } = new WebSocketPair()
    const others = this.sockets()
    this.ctx.acceptWebSocket(server)
    server.serializeAttachment(info)
    server.send(encodeWelcome(info.peerId, [SERVER_PEER, ...others.map((other) => other.info.peerId)]))
    for (const other of others) other.ws.send(encodePeerEvent(FRAME_JOIN, info.peerId))
    this.sendLoad(server)
    this.reportLive()
    return new Response(null, { status: 101, webSocket: client })
  }

  /** Sends the stored document: the snapshot's parts, every update since, then done. */
  private sendLoad(ws: WebSocket): void {
    const send = (kind: number, data: Uint8Array) =>
      ws.send(encodeAction(SERVER_LOAD, SERVER_PEER, withKind(kind, data)))
    for (const row of this.sql.exec('SELECT data FROM snapshot ORDER BY part')) {
      send(LOAD_SNAPSHOT_PART, new Uint8Array(row.data as ArrayBuffer))
    }
    let seq: number | null = null
    let parts: ArrayBuffer[] = []
    for (const row of this.sql.exec('SELECT seq, part, data FROM log ORDER BY seq, part')) {
      if (seq !== null && row.seq !== seq) {
        send(LOAD_UPDATE, joinParts(parts))
        parts = []
      }
      seq = Number(row.seq)
      parts.push(row.data as ArrayBuffer)
    }
    if (seq !== null) send(LOAD_UPDATE, joinParts(parts))
    const pending = this.pendingVersion()
    if (pending) ws.send(this.pendingFrame(pending))
    send(LOAD_DONE, new Uint8Array())
  }

  /** The id of the version waiting to be applied, or null. */
  private pendingVersion(): string | null {
    const row = this.sql.exec('SELECT COUNT(*) AS parts FROM pending').toArray()[0]
    if (!row || Number(row.parts) === 0) return null
    return this.meta('pendingVersion') ?? 'pending'
  }

  private pendingFrame(version: string): Uint8Array {
    return encodeAction(SERVER_PENDING, SERVER_PEER, new TextEncoder().encode(version))
  }

  async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string): Promise<void> {
    if (typeof message === 'string') return
    const info = ws.deserializeAttachment() as Attachment | null
    const frame = decodeFrame(new Uint8Array(message))
    if (!info || frame?.type !== 'action') return
    const { namespace, peer: target, payload } = frame
    const canEdit = info.role !== 'viewer'

    if (target === SERVER_PEER) {
      if (namespace === SERVER_SNAPSHOT && canEdit) this.takeSnapshot(payload)
      return
    }
    // Viewers follow along; what they would change never reaches anyone.
    if (!canEdit && (namespace === YJS_UPDATE || namespace === SYNC_REPLY)) return

    const out = encodeAction(namespace, info.peerId, payload)
    for (const other of this.sockets()) {
      if (other.ws === ws) continue
      if (target && other.info.peerId !== target) continue
      other.ws.send(out)
    }
    if (namespace === YJS_UPDATE && !target) this.store(payload)
  }

  private writeParts(table: 'log' | 'snapshot' | 'file' | 'pending', data: Uint8Array, seq?: number) {
    const count = Math.max(1, Math.ceil(data.length / PART_BYTES))
    for (let part = 0; part < count; part++) {
      const chunk = data.subarray(part * PART_BYTES, (part + 1) * PART_BYTES)
      if (table === 'log') {
        this.sql.exec('INSERT INTO log (seq, part, data) VALUES (?, ?, ?)', seq, part, chunk)
      } else {
        this.sql.exec(`INSERT INTO ${table} (part, data) VALUES (?, ?)`, part, chunk)
      }
    }
  }

  private store(update: Uint8Array): void {
    const seq = this.numberMeta('nextSeq') + 1
    this.writeParts('log', update, seq)
    this.setMeta('nextSeq', seq)
    this.setMeta('logBytes', this.numberMeta('logBytes') + update.length)
    this.setMeta('logCount', this.numberMeta('logCount') + 1)
    this.touch()
    this.maybeCompact(seq)
  }

  /** The directory that lists this document: the server's own, or its tenant's. */
  private directory() {
    return this.env.DIRECTORY.get(this.env.DIRECTORY.idFromName(this.meta('directory') ?? 'directory'))
  }

  private touch(hasFile?: boolean, fileSize?: number): void {
    const documentId = this.meta('document')
    const now = Date.now()
    if (!documentId || (hasFile === undefined && now - this.lastTouch < TOUCH_EVERY_MS)) return
    this.lastTouch = now
    const directory = this.directory()
    this.ctx.waitUntil(directory.touchDocument(documentId, hasFile, fileSize))
  }

  private maybeCompact(seq: number): void {
    const due =
      this.numberMeta('logCount') > COMPACT_AFTER_UPDATES ||
      this.numberMeta('logBytes') > COMPACT_AFTER_BYTES
    if (!due || Date.now() - this.compactRequestedAt < COMPACT_RETRY_MS) return
    const editor = this.sockets().find((socket) => socket.info.role !== 'viewer')
    if (!editor) return
    this.compactRequestedAt = Date.now()
    editor.ws.send(encodeAction(SERVER_COMPACT, SERVER_PEER, encodeU32(seq)))
  }

  /**
   * An editor's whole document, as it stood once it had applied every update up to `seq`:
   * it replaces the snapshot and those updates.
   */
  private takeSnapshot(payload: Uint8Array): void {
    const decoded = decodeU32(payload)
    if (!decoded || decoded.rest.length === 0) return
    const { value: seq, rest: snapshot } = decoded
    if (seq <= this.numberMeta('snapshotSeq') || seq > this.numberMeta('nextSeq')) return
    this.ctx.storage.transactionSync(() => {
      this.sql.exec('DELETE FROM snapshot')
      this.writeParts('snapshot', snapshot)
      this.sql.exec('DELETE FROM log WHERE seq <= ?', seq)
      const left = this.sql
        .exec('SELECT COUNT(DISTINCT seq) AS count, COALESCE(SUM(LENGTH(data)), 0) AS bytes FROM log')
        .toArray()[0]
      this.setMeta('logCount', Number(left?.count ?? 0))
      this.setMeta('logBytes', Number(left?.bytes ?? 0))
      this.setMeta('snapshotSeq', seq)
    })
    this.compactRequestedAt = 0
  }

  private leave(ws: WebSocket): void {
    const info = ws.deserializeAttachment() as Attachment | null
    if (!info) return
    ws.serializeAttachment(null)
    for (const other of this.sockets()) {
      if (other.ws !== ws) other.ws.send(encodePeerEvent(FRAME_LEAVE, info.peerId))
    }
    this.reportLive()
  }

  /** Tells the server's file list how many Kalka windows have this document open. */
  private reportLive(): void {
    const documentId = this.meta('document')
    if (!documentId) return
    const directory = this.directory()
    this.ctx.waitUntil(directory.setLive(documentId, this.sockets().length))
  }

  async webSocketClose(ws: WebSocket, code: number): Promise<void> {
    this.leave(ws)
    try {
      ws.close(code === 1005 ? 1000 : code, 'Closing')
    } catch {
      // Already closed.
    }
  }

  async webSocketError(ws: WebSocket): Promise<void> {
    this.leave(ws)
  }

  /**
   * The document saved as a Kalka file, which Kalka uploads now and then. With `pending`, the
   * file came from outside Kalka (WebDAV, a restore): it is also kept as a version Kalka
   * clients may apply, since the live document is the log, which this server never decodes.
   */
  putFile(data: ArrayBuffer, documentId: string, directory?: string, pending?: boolean): void {
    this.setMeta('document', documentId)
    if (directory) this.setMeta('directory', directory)
    this.ctx.storage.transactionSync(() => {
      this.sql.exec('DELETE FROM file')
      this.writeParts('file', new Uint8Array(data))
      if (pending) {
        this.sql.exec('DELETE FROM pending')
        this.writeParts('pending', new Uint8Array(data))
        this.setMeta('pendingVersion', randomId(16))
      }
    })
    this.setMeta('fileSavedAt', Date.now())
    this.touch(true, data.byteLength)
    // Kalka windows that have the document open apply the new version without reopening it.
    const version = pending ? this.pendingVersion() : null
    if (version) for (const { ws } of this.sockets()) ws.send(this.pendingFrame(version))
  }

  private readParts(table: 'file' | 'pending'): ArrayBuffer | null {
    const parts = this.sql
      .exec(`SELECT data FROM ${table} ORDER BY part`)
      .toArray()
      .map((row) => row.data as ArrayBuffer)
    return parts.length ? joinParts(parts).buffer as ArrayBuffer : null
  }

  getFile(): ArrayBuffer | null {
    return this.readParts('file')
  }

  /** Size and save time of the Kalka file, without reading it. */
  fileInfo(): { size: number; savedAt: number } | null {
    const row = this.sql.exec('SELECT COUNT(*) AS parts, COALESCE(SUM(LENGTH(data)), 0) AS size FROM file').toArray()[0]
    if (!row || Number(row.parts) === 0) return null
    return { size: Number(row.size), savedAt: this.numberMeta('fileSavedAt') }
  }

  /** The version waiting to be applied, with its id, or null. */
  getPending(): { data: ArrayBuffer; version: string } | null {
    const data = this.readParts('pending')
    const version = this.pendingVersion()
    return data && version ? { data, version } : null
  }

  /**
   * Dismisses the waiting version; with `version`, only if it is still that one, so the Kalka
   * window that applies a version is the one whose dismissal went through. Returns whether a
   * version was dismissed.
   */
  clearPending(version?: string): boolean {
    const current = this.pendingVersion()
    if (!current || (version !== undefined && version !== current)) return false
    this.sql.exec('DELETE FROM pending')
    return true
  }

  /**
   * Someone lost access, or their role changed: their sockets close now, so nothing they send
   * afterwards is relayed or stored. With a new role they reconnect and take it from a new ticket.
   */
  revokeUser(userId: string, role: Role | null): void {
    for (const { ws, info } of this.sockets()) {
      if (info.userId !== userId || info.role === role) continue
      this.leave(ws)
      try {
        ws.close(role ? CLOSE_ROLE_CHANGED : CLOSE_REVOKED, role ? 'Role changed' : 'Access revoked')
      } catch {
        // Already closed.
      }
    }
  }

  /** Closes every connection and erases the document. */
  async destroy(): Promise<void> {
    for (const { ws } of this.sockets()) {
      try {
        ws.close(4404, 'Document deleted')
      } catch {
        // Already closed.
      }
    }
    await this.ctx.storage.deleteAll()
    this.sql.exec(SCHEMA)
  }
}
