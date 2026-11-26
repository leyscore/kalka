import { randomId } from './crypto'

/**
 * Comments from people who may only view a file. Figma lets viewers comment; here the live
 * document is a log this server never decodes, and a viewer's Yjs update could change anything
 * in it, so viewers never send one. They send what they wrote on a channel of its own instead:
 * the server stamps it with who sent it, keeps it, and hands it to the editors, whose Kalka checks
 * it is a comment and nothing else, writes it into the document, and acknowledges it. Until an
 * editor does, it stays here, and reaches every editor who opens the file.
 */

/** The most a room keeps waiting, and the largest one: a comment is a note, not a document. */
export const MAX_QUEUED_COMMENTS = 500
export const MAX_COMMENT_BYTES = 16 * 1024

export const COMMENT_SCHEMA = `
CREATE TABLE IF NOT EXISTS comment_queue (id TEXT PRIMARY KEY, created_at INTEGER NOT NULL, user_id TEXT NOT NULL, name TEXT NOT NULL, data BLOB NOT NULL);
`

export interface QueuedComment {
  id: string
  userId: string
  name: string
  data: Uint8Array
}

const encoder = new TextEncoder()

function shortString(value: string): Uint8Array {
  let bytes = encoder.encode(value)
  // Names and ids fit a byte's length; a longer name is cut, never the frame refused.
  if (bytes.length > 255) bytes = bytes.subarray(0, 255)
  const out = new Uint8Array(bytes.length + 1)
  out[0] = bytes.length
  out.set(bytes, 1)
  return out
}

/** `[id][user id][name][the comment as sent]`, the strings one length byte then UTF-8. */
export function encodeQueuedComment(comment: QueuedComment): Uint8Array {
  const parts = [shortString(comment.id), shortString(comment.userId), shortString(comment.name), comment.data]
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0))
  let at = 0
  for (const part of parts) {
    out.set(part, at)
    at += part.length
  }
  return out
}

/** The ids an editor acknowledges, one per line. */
export function decodeAcks(payload: Uint8Array): string[] {
  return new TextDecoder()
    .decode(payload)
    .split('\n')
    .map((id) => id.trim())
    .filter((id) => id.length > 0 && id.length <= 64)
}

export class CommentQueue {
  constructor(private readonly sql: SqlStorage) {
    sql.exec(COMMENT_SCHEMA)
  }

  /** Keeps a comment; null when it is empty, too large, or the room has too many waiting. */
  add(userId: string, name: string, data: Uint8Array): QueuedComment | null {
    if (data.length === 0 || data.length > MAX_COMMENT_BYTES) return null
    const row = this.sql.exec('SELECT COUNT(*) AS count FROM comment_queue').toArray()[0]
    if (Number(row?.count ?? 0) >= MAX_QUEUED_COMMENTS) return null
    const comment: QueuedComment = { id: randomId(16), userId, name, data: data.slice() }
    this.sql.exec(
      'INSERT INTO comment_queue (id, created_at, user_id, name, data) VALUES (?, ?, ?, ?, ?)',
      comment.id,
      Date.now(),
      userId,
      name,
      comment.data
    )
    return comment
  }

  /** What waits, oldest first. */
  list(): QueuedComment[] {
    return this.sql
      .exec('SELECT id, user_id, name, data FROM comment_queue ORDER BY created_at, id')
      .toArray()
      .map((row) => ({
        id: String(row.id),
        userId: String(row.user_id),
        name: String(row.name),
        data: new Uint8Array(row.data as ArrayBuffer)
      }))
  }

  /** An editor wrote these into the document: they no longer wait. */
  acknowledge(ids: string[]): void {
    for (const id of ids) this.sql.exec('DELETE FROM comment_queue WHERE id = ?', id)
  }
}
