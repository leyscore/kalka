import { randomId } from './crypto'

/**
 * Notifications, as Figma's bell keeps them for every file: someone mentioned you in a comment, or
 * answered a thread you wrote in. The server never reads comments, which live in each document;
 * the Kalka window that posts one says who it is for, by name, and the server turns those names
 * into its members and keeps a note for each until they read it, whether or not they have the
 * file open. A note says who sent it, which the server knows, never who the sender claims to be.
 */

export const NOTIFICATION_SCHEMA = `
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  document_id TEXT NOT NULL,
  thread_id TEXT NOT NULL,
  from_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  read_at INTEGER
);
CREATE INDEX IF NOT EXISTS notifications_by_user ON notifications (user_id, created_at);
`

/** The newest a person keeps; older notes go as new ones arrive. */
const KEPT_PER_PERSON = 200
export const MAX_EXCERPT = 280
export const MAX_NAMES = 50

export type NotificationReason = 'mention' | 'reply'

export interface Notification {
  id: string
  documentId: string
  documentName: string
  threadId: string
  from: string
  reason: NotificationReason
  excerpt: string
  createdAt: number
  read: boolean
}

export interface CommentNotice {
  documentId: string
  threadId: string
  /** People the comment mentions, by name. */
  mentions: string[]
  /** People who wrote in the thread before, by name, whom a reply answers. */
  participants: string[]
  excerpt: string
}

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

/**
 * Keeps a note for each member a comment is for: a mention first, else a reply. Never for the
 * sender, nor for a deactivated account. Returns how many were kept.
 */
export function addNotifications(
  sql: SqlStorage,
  sender: { id: string; name: string },
  notice: CommentNotice
): number {
  const members = sql
    .exec('SELECT id, name FROM users WHERE disabled = 0')
    .toArray()
    .map((row) => ({ id: String(row.id), name: String(row.name) }))
  const reasons = new Map<string, NotificationReason>()
  for (const member of members) {
    if (member.id === sender.id) continue
    if (notice.mentions.some((name) => sameName(name, member.name))) reasons.set(member.id, 'mention')
    else if (notice.participants.some((name) => sameName(name, member.name))) reasons.set(member.id, 'reply')
  }
  const now = Date.now()
  const excerpt = notice.excerpt.trim().slice(0, MAX_EXCERPT)
  for (const [userId, reason] of reasons) {
    sql.exec(
      'INSERT INTO notifications (id, user_id, document_id, thread_id, from_name, reason, excerpt, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      randomId(16),
      userId,
      notice.documentId,
      notice.threadId,
      sender.name,
      reason,
      excerpt,
      now
    )
    sql.exec(
      'DELETE FROM notifications WHERE user_id = ? AND id NOT IN (SELECT id FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?)',
      userId,
      userId,
      KEPT_PER_PERSON
    )
  }
  return reasons.size
}

/** A person's notes, newest first, on files that are not in the trash. */
export function listNotifications(sql: SqlStorage, userId: string, limit = 50): Notification[] {
  return sql
    .exec(
      `SELECT n.id, n.document_id, d.name AS document_name, n.thread_id, n.from_name, n.reason, n.excerpt, n.created_at, n.read_at
       FROM notifications n JOIN documents d ON d.id = n.document_id
       WHERE n.user_id = ? AND d.deleted_at IS NULL ORDER BY n.created_at DESC LIMIT ?`,
      userId,
      limit
    )
    .toArray()
    .map((row) => ({
      id: String(row.id),
      documentId: String(row.document_id),
      documentName: String(row.document_name),
      threadId: String(row.thread_id),
      from: String(row.from_name),
      reason: row.reason === 'mention' ? 'mention' : 'reply',
      excerpt: String(row.excerpt),
      createdAt: Number(row.created_at),
      read: row.read_at !== null
    }))
}

/** Marks a person's notes read: these, or, without ids, all of them, or those of one file. */
export function readNotifications(
  sql: SqlStorage,
  userId: string,
  which: { ids?: string[]; documentId?: string }
): void {
  const now = Date.now()
  if (which.ids) {
    for (const id of which.ids) {
      sql.exec('UPDATE notifications SET read_at = ? WHERE id = ? AND user_id = ? AND read_at IS NULL', now, id, userId)
    }
  } else if (which.documentId) {
    sql.exec(
      'UPDATE notifications SET read_at = ? WHERE user_id = ? AND document_id = ? AND read_at IS NULL',
      now,
      userId,
      which.documentId
    )
  } else {
    sql.exec('UPDATE notifications SET read_at = ? WHERE user_id = ? AND read_at IS NULL', now, userId)
  }
}

/** How many of a person's notes they have not read. */
export function unreadNotifications(sql: SqlStorage, userId: string): number {
  const row = sql
    .exec(
      'SELECT COUNT(*) AS count FROM notifications n JOIN documents d ON d.id = n.document_id WHERE n.user_id = ? AND n.read_at IS NULL AND d.deleted_at IS NULL',
      userId
    )
    .toArray()[0]
  return Number(row?.count ?? 0)
}
