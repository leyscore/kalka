import * as v from 'valibot'
import { shallowRef } from 'vue'

import type { CommentMessage, CommentThread } from '@kalka/scene-graph'

import { roomForStore } from '@/app/collab/rooms'
import { withServerSession } from '@/app/collab/server/account'
import { serverRequest } from '@/app/collab/server/api'
import { isServerRoom } from '@/app/collab/server/documents'
import type { EditorStore } from '@/app/editor/active-store'

/**
 * Notifications from the signed-in Kalka server, as Figma's bell lists them for every file: who
 * mentioned this person in a comment, or answered a thread they wrote in, wherever the file is.
 * The server keeps them (`server/src/notifications.ts`); the window that posts a comment tells it
 * whom the comment is for.
 */

const notificationSchema = v.object({
  id: v.string(),
  documentId: v.string(),
  documentName: v.string(),
  threadId: v.string(),
  from: v.string(),
  reason: v.picklist(['mention', 'reply']),
  excerpt: v.string(),
  createdAt: v.number(),
  read: v.boolean()
})

const inboxSchema = v.object({ notifications: v.array(notificationSchema), unread: v.number() })

export type ServerNotification = v.InferOutput<typeof notificationSchema>

/** The latest notifications the server sent, and how many are unread. */
export const serverNotifications = shallowRef<ServerNotification[]>([])
export const serverUnreadNotifications = shallowRef(0)

function keep(inbox: v.InferOutput<typeof inboxSchema>) {
  serverNotifications.value = inbox.notifications
  serverUnreadNotifications.value = inbox.unread
}

export async function refreshServerNotifications(): Promise<void> {
  keep(
    await withServerSession((url, token) =>
      serverRequest(url, '/api/me/notifications', { token, schema: inboxSchema })
    )
  )
}

/** Marks notifications read: these, or all of them. */
export async function readServerNotifications(ids?: string[]): Promise<void> {
  keep(
    await withServerSession((url, token) =>
      serverRequest(url, '/api/me/notifications/read', {
        method: 'POST',
        token,
        body: ids ? { ids } : {},
        schema: inboxSchema
      })
    )
  )
}

const MAX_EXCERPT = 280

/**
 * Whom a new message is for: the people it mentions, and those who wrote in its thread before,
 * whom a reply answers. Agents are never notified this way.
 */
export function commentRecipients(
  thread: CommentThread,
  message: CommentMessage
): { mentions: string[]; participants: string[] } {
  const participants = new Set<string>()
  for (const earlier of thread.messages) {
    if (earlier.id === message.id) break
    if (earlier.author.kind === 'person') participants.add(earlier.author.name)
  }
  return { mentions: [...(message.mentions ?? [])], participants: [...participants] }
}

/**
 * Tells the server about a message just posted in a server file, so the people it is for are
 * notified there; nothing for a file elsewhere, or a message for nobody.
 */
export function notifyCommentPosted(store: EditorStore, thread: CommentThread | undefined): void {
  const roomId = roomForStore(store)?.roomId
  const message = thread?.messages.at(-1)
  if (!thread || !message || !roomId || !isServerRoom(roomId)) return
  const { mentions, participants } = commentRecipients(thread, message)
  if (mentions.length === 0 && participants.length === 0) return
  withServerSession((url, token) =>
    serverRequest(url, `/api/documents/${roomId}/notify`, {
      method: 'POST',
      token,
      body: {
        threadId: thread.id,
        mentions: mentions.slice(0, 50),
        participants: participants.slice(0, 50),
        excerpt: message.text.slice(0, MAX_EXCERPT)
      },
      schema: v.object({ notified: v.number() })
    })
  ).catch((error: unknown) => console.warn('[Kalka server] Could not notify people', error))
}
