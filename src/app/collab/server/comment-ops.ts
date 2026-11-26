import * as v from 'valibot'

import {
  COMMENT_REACTIONS,
  MAX_COMMENT_LENGTH,
  type CommentMessage,
  type CommentThread
} from '@kalka/scene-graph'

/**
 * What someone who may only view a server file changes in its comments, as operations the
 * editors in the room write into the document for them (`server/src/comments.ts`). An operation
 * can only add a thread or a reply, react, resolve, or delete a thread its sender started; it
 * never touches the design, an annotation or a measurement, nor asks an agent. Each one is
 * idempotent, so every editor may apply the same one, and applying it again changes nothing.
 */

const id = v.pipe(v.string(), v.minLength(1), v.maxLength(64))
const text = v.pipe(v.string(), v.maxLength(MAX_COMMENT_LENGTH))
const mentions = v.optional(v.pipe(v.array(v.pipe(v.string(), v.maxLength(80))), v.maxLength(50)))
const createdAt = v.pipe(v.number(), v.finite())

const opSchema = v.variant('op', [
  v.object({
    op: v.literal('add'),
    threadId: id,
    messageId: id,
    anchor: v.object({
      pageId: id,
      nodeId: v.nullable(id),
      x: v.pipe(v.number(), v.finite()),
      y: v.pipe(v.number(), v.finite())
    }),
    text,
    mentions,
    createdAt
  }),
  v.object({ op: v.literal('reply'), threadId: id, messageId: id, text, mentions, createdAt }),
  v.object({
    op: v.literal('react'),
    threadId: id,
    messageId: id,
    emoji: v.picklist(COMMENT_REACTIONS),
    on: v.boolean()
  }),
  v.object({ op: v.literal('resolve'), threadId: id, resolved: v.boolean() }),
  v.object({ op: v.literal('delete'), threadId: id })
])

export type CommentOp = v.InferOutput<typeof opSchema>

const MAX_OPS = 50
const opsSchema = v.object({ ops: v.pipe(v.array(opSchema), v.minLength(1), v.maxLength(MAX_OPS)) })

const encoder = new TextEncoder()
const decoder = new TextDecoder()

export function encodeCommentOps(ops: CommentOp[]): Uint8Array {
  return encoder.encode(JSON.stringify({ ops }))
}

/** The operations a payload holds, or null for anything else. */
export function decodeCommentOps(bytes: Uint8Array): CommentOp[] | null {
  const parsed = v.safeParse(v.pipe(v.string(), v.parseJson(), opsSchema), decoder.decode(bytes))
  return parsed.success ? parsed.output.ops : null
}

/** A comment the server kept, stamped with who sent it: `[id][user id][name][operations]`. */
export interface QueuedComments {
  id: string
  userId: string
  name: string
  ops: CommentOp[]
}

export function decodeQueuedComments(bytes: Uint8Array): QueuedComments | null {
  let at = 0
  const text = (): string | null => {
    const length = bytes[at]
    if (length === undefined || at + 1 + length > bytes.length) return null
    const value = decoder.decode(bytes.subarray(at + 1, at + 1 + length))
    at += 1 + length
    return value
  }
  const queuedId = text()
  const userId = text()
  const name = text()
  if (!queuedId || userId === null || !name) return null
  const ops = decodeCommentOps(bytes.subarray(at))
  return ops ? { id: queuedId, userId, name, ops } : null
}

/** Threads a viewer may change: plain comments, not an annotation or a measurement. */
function isPlainThread(thread: CommentThread): boolean {
  return !thread.annotation && !thread.measurement
}

function newMessage(
  messageId: string,
  author: string,
  body: string,
  at: number,
  now: number,
  named: string[] | undefined
): CommentMessage {
  const message: CommentMessage = {
    id: messageId,
    author: { kind: 'person', name: author },
    text: body.trim().slice(0, MAX_COMMENT_LENGTH),
    // Never later than now, so a clock ahead cannot pin a comment to the top for good.
    createdAt: Math.min(at, now)
  }
  if (named && named.length > 0) message.mentions = [...named]
  return message
}

function applyOne(
  threads: CommentThread[],
  op: CommentOp,
  author: string,
  now: number
): CommentThread[] {
  if (op.op === 'add') {
    if (threads.some((thread) => thread.id === op.threadId)) return threads
    const message = newMessage(op.messageId, author, op.text, op.createdAt, now, op.mentions)
    if (!message.text) return threads
    return [
      ...threads,
      { id: op.threadId, anchor: { ...op.anchor }, messages: [message], resolved: false }
    ]
  }
  const index = threads.findIndex((thread) => thread.id === op.threadId)
  const thread = threads[index]
  if (!thread || !isPlainThread(thread)) return threads
  let next: CommentThread | null = thread
  if (op.op === 'reply') {
    if (thread.messages.some((message) => message.id === op.messageId)) return threads
    const message = newMessage(op.messageId, author, op.text, op.createdAt, now, op.mentions)
    if (!message.text) return threads
    // A reply reopens a resolved thread, as `replyToComment` does.
    next = { ...thread, messages: [...thread.messages, message], resolved: false }
    delete next.resolvedBy
  } else if (op.op === 'react') {
    const messages = thread.messages.map((message) => react(message, op, author))
    if (messages.every((message, at) => message === thread.messages[at])) return threads
    next = { ...thread, messages }
  } else if (op.op === 'resolve') {
    if (thread.resolved === op.resolved) return threads
    next = { ...thread, resolved: op.resolved }
    if (op.resolved) next.resolvedBy = author
    else delete next.resolvedBy
  } else {
    // Only whoever started a thread deletes it.
    const [first] = thread.messages
    if (first?.author.kind !== 'person' || first.author.name !== author) return threads
    next = null
  }
  const out = [...threads]
  if (next) out[index] = next
  else out.splice(index, 1)
  return out
}

function react(
  message: CommentMessage,
  op: Extract<CommentOp, { op: 'react' }>,
  person: string
): CommentMessage {
  if (message.id !== op.messageId) return message
  const reactions = message.reactions ?? []
  const existing = reactions.find((reaction) => reaction.emoji === op.emoji)
  if (Boolean(existing?.people.includes(person)) === op.on) return message
  if (!existing)
    return { ...message, reactions: [...reactions, { emoji: op.emoji, people: [person] }] }
  const next = reactions
    .map((reaction) =>
      reaction === existing
        ? {
            ...reaction,
            people: op.on
              ? [...reaction.people, person]
              : reaction.people.filter((name) => name !== person)
          }
        : reaction
    )
    .filter((reaction) => reaction.people.length > 0)
  return { ...message, reactions: next }
}

/** The threads once `author`'s operations are applied; the same array when nothing changes. */
export function applyCommentOps(
  threads: CommentThread[],
  ops: readonly CommentOp[],
  author: string,
  now = Date.now()
): CommentThread[] {
  return ops.reduce((current, op) => applyOne(current, op, author, now), threads)
}

function peopleOf(message: CommentMessage, emoji: string): string[] {
  return message.reactions?.find((reaction) => reaction.emoji === emoji)?.people ?? []
}

function isReaction(emoji: string): emoji is (typeof COMMENT_REACTIONS)[number] {
  return (COMMENT_REACTIONS as readonly string[]).includes(emoji)
}

/**
 * The operations that turn `before` into `after`, for what a viewer may change: new threads and
 * replies, reactions given or taken back, threads resolved or reopened, and threads deleted.
 * Anything else, such as a pin moved, has no operation and stays as the room has it.
 */
export function diffCommentOps(before: CommentThread[], after: CommentThread[]): CommentOp[] {
  const ops: CommentOp[] = []
  const known = new Map(before.map((thread) => [thread.id, thread]))
  for (const thread of after) {
    const previous = known.get(thread.id)
    if (!previous) {
      if (!isPlainThread(thread)) continue
      const [first, ...replies] = thread.messages
      if (!first) continue
      ops.push({
        op: 'add',
        threadId: thread.id,
        messageId: first.id,
        anchor: { ...thread.anchor },
        text: first.text,
        mentions: first.mentions,
        createdAt: first.createdAt
      })
      for (const reply of replies) ops.push(replyOp(thread.id, reply))
      continue
    }
    if (!isPlainThread(previous)) continue
    const earlier = new Map(previous.messages.map((message) => [message.id, message]))
    for (const message of thread.messages) {
      const was = earlier.get(message.id)
      if (!was) {
        ops.push(replyOp(thread.id, message))
        continue
      }
      const emojis = new Set([
        ...(message.reactions ?? []).map((reaction) => reaction.emoji),
        ...(was.reactions ?? []).map((reaction) => reaction.emoji)
      ])
      for (const emoji of emojis) {
        const now = peopleOf(message, emoji).length
        const then = peopleOf(was, emoji).length
        if (now !== then && isReaction(emoji))
          ops.push({
            op: 'react',
            threadId: thread.id,
            messageId: message.id,
            emoji,
            on: now > then
          })
      }
    }
    if (thread.resolved !== previous.resolved)
      ops.push({ op: 'resolve', threadId: thread.id, resolved: thread.resolved })
  }
  const kept = new Set(after.map((thread) => thread.id))
  for (const thread of before) {
    if (!kept.has(thread.id) && isPlainThread(thread))
      ops.push({ op: 'delete', threadId: thread.id })
  }
  return ops
}

function replyOp(threadId: string, message: CommentMessage): CommentOp {
  return {
    op: 'reply',
    threadId,
    messageId: message.id,
    text: message.text,
    mentions: message.mentions,
    createdAt: message.createdAt
  }
}
