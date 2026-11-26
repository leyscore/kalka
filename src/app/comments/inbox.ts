import { createGlobalState, useLocalStorage } from '@vueuse/core'
import * as v from 'valibot'
import { computed, type ComputedRef } from 'vue'

import type { CommentMessage, CommentThread } from '@kalka/scene-graph'

import { chatDocumentId } from '@/app/ai/chat/history/document'
import { useCollabInjected } from '@/app/collab/context'
import { currentPersonName, type CommentsController } from '@/app/comments/service'
import type { EditorStore } from '@/app/editor/active-store'

/**
 * What this person has read of each document's comments, and what asks for their attention: a
 * thread is unread while it holds a message someone else wrote after they last opened it, and a
 * notification is such a message that mentions them or answers a thread they took part in.
 * Reading is theirs alone, so it stays on this device, as Figma keeps it per account.
 */

const READS_KEY = 'kalka:comment-reads'
/** Documents remembered; the ones read longest ago are forgotten first. */
const MAX_DOCUMENTS = 200

/** Per document, per thread: the time of the latest message read there. */
type Reads = Record<string, { at: number; threads: Record<string, number> }>

const ReadsSchema = v.record(
  v.string(),
  v.object({ at: v.number(), threads: v.record(v.string(), v.number()) })
)

const useReads = createGlobalState(() =>
  useLocalStorage<Reads>(
    READS_KEY,
    {},
    {
      serializer: {
        read: (raw) => {
          const parsed = v.safeParse(v.pipe(v.string(), v.parseJson(), ReadsSchema), raw)
          return parsed.success ? parsed.output : {}
        },
        write: (value) => JSON.stringify(value)
      }
    }
  )
)

export type CommentNotificationReason = 'mention' | 'reply'

export interface CommentNotification {
  thread: CommentThread
  message: CommentMessage
  reason: CommentNotificationReason
}

function samePerson(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

/** Whether `me` wrote a message: an agent's never is, even under the same name. */
function writtenBy(message: CommentMessage, me: string): boolean {
  return message.author.kind === 'person' && samePerson(message.author.name, me)
}

/** The messages of a thread `me` has not read: someone else's, newer than the last one read. */
export function unreadMessages(
  thread: CommentThread,
  readAt: number,
  me: string
): CommentMessage[] {
  return thread.messages.filter((message) => message.createdAt > readAt && !writtenBy(message, me))
}

/** Why an unread message is for `me`, or null when it is not: a mention, or a reply to them. */
export function notificationReason(
  thread: CommentThread,
  message: CommentMessage,
  me: string
): CommentNotificationReason | null {
  if (message.mentions?.some((name) => samePerson(name, me))) return 'mention'
  const tookPart = thread.messages.some(
    (earlier) => earlier.createdAt < message.createdAt && writtenBy(earlier, me)
  )
  return tookPart ? 'reply' : null
}

/** The people a comment can mention: those here now, and those who commented in the document. */
export function mentionablePeople(threads: readonly CommentThread[], present: readonly string[]) {
  const me = currentPersonName()
  const names = new Map<string, string>()
  for (const name of present) names.set(name.toLowerCase(), name)
  for (const thread of threads)
    for (const message of thread.messages)
      if (message.author.kind === 'person')
        names.set(message.author.name.toLowerCase(), message.author.name)
  names.delete(me.toLowerCase())
  return [...names.values()].sort((a, b) => a.localeCompare(b))
}

/** The document comments are read in: its room when it is shared, else its file or recovery. */
function documentKey(store: EditorStore, roomId: string | null | undefined): string {
  return roomId ? `room:${roomId}` : chatDocumentId(store)
}

export function useCommentInbox(store: EditorStore, comments: CommentsController) {
  const reads = useReads()
  const collab = useCollabInjected()
  const key = computed(() => {
    void store.state.sceneVersion
    return documentKey(store, collab?.state.value.roomId)
  })
  const me = computed(() => currentPersonName())
  const readThreads = computed(() => reads.value[key.value]?.threads ?? {})

  const unread = computed(() =>
    comments.threads.value.filter(
      (thread) =>
        !thread.resolved &&
        unreadMessages(thread, readThreads.value[thread.id] ?? 0, me.value).length > 0
    )
  )
  const unreadIds = computed(() => new Set(unread.value.map((thread) => thread.id)))

  const notifications: ComputedRef<CommentNotification[]> = computed(() =>
    unread.value
      .flatMap((thread) =>
        unreadMessages(thread, readThreads.value[thread.id] ?? 0, me.value).flatMap((message) => {
          const reason = notificationReason(thread, message, me.value)
          return reason ? [{ thread, message, reason }] : []
        })
      )
      .sort((a, b) => b.message.createdAt - a.message.createdAt)
  )

  function write(threads: Record<string, number>) {
    const next: Reads = { ...reads.value, [key.value]: { at: Date.now(), threads } }
    const newest = Object.entries(next)
      .sort(([, a], [, b]) => b.at - a.at)
      .slice(0, MAX_DOCUMENTS)
    reads.value = Object.fromEntries(newest)
  }

  function latest(thread: CommentThread): number {
    return Math.max(0, ...thread.messages.map((message) => message.createdAt))
  }

  /** Marks a thread read up to its latest message. */
  function markRead(thread: CommentThread) {
    const at = latest(thread)
    if ((readThreads.value[thread.id] ?? 0) >= at) return
    write({ ...readThreads.value, [thread.id]: at })
  }

  function markAllRead() {
    const threads = { ...readThreads.value }
    for (const thread of comments.threads.value) threads[thread.id] = latest(thread)
    write(threads)
  }

  return {
    me,
    unread,
    unreadIds,
    notifications,
    isUnread: (thread: CommentThread) => unreadIds.value.has(thread.id),
    markRead,
    markAllRead,
    people: computed(() =>
      mentionablePeople(
        comments.threads.value,
        (collab?.state.value.peers ?? []).map((peer) => peer.name)
      )
    )
  }
}

export type CommentInbox = ReturnType<typeof useCommentInbox>
