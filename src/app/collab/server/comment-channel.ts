import { isEqual } from 'es-toolkit'
import * as v from 'valibot'

import { commentThreadsSchema, documentComments, type CommentThread } from '@kalka/scene-graph'

import {
  applyCommentOps,
  decodeQueuedComments,
  diffCommentOps,
  encodeCommentOps,
  type CommentOp
} from '@/app/collab/server/comment-ops'
import type { YNodes } from '@/app/collab/shared-tree/fields'
import type { ServerRoomTransport } from '@/app/collab/transport/server'
import {
  SERVER_COMMENT,
  SERVER_COMMENT_ACK,
  SERVER_PEER
} from '@/app/collab/transport/server-protocol'
import type { EditorStore } from '@/app/editor/active-store'

/** Comments not in the room's document yet, with whose they are. */
interface PendingComments {
  author: string
  ops: CommentOp[]
}

export interface ServerCommentOptions {
  room: ServerRoomTransport
  store: EditorStore
  ynodes: YNodes
  /** Whether the room's document is the one this tab shows, so comments can go into it. */
  hasDocument: () => boolean
  /** The name the server knows this person by, which their comments carry. */
  personName: () => string
  /** Runs a write to the tab's graph that the room must not receive, as a remote change is. */
  quietly: (write: () => void) => void
}

export interface ServerComments {
  /**
   * A viewer changed comments in their tab: what they changed goes to the server for the
   * editors to write in, and shows here meanwhile. Returns whether there was any.
   */
  sendLocalChanges(): boolean
  /** The room's comments changed, or were just put back: a viewer's waiting ones show again. */
  showPending(): void
  /** The room's document arrived: an editor writes in the comments that waited for it. */
  flush(): void
}

/**
 * Comments from people who may only view a server file, through the server's comment channel
 * (`server/src/comments.ts`). A viewer never edits the document, comments included: their tab
 * sends what they wrote as comment operations, which the server stamps with their name and keeps,
 * and shows them on top of the room's comments until they arrive in it. An editor's tab writes
 * every comment operation it receives into the document, then tells the server it did.
 */
export function bindServerComments({
  room,
  store,
  ynodes,
  hasDocument,
  personName,
  quietly
}: ServerCommentOptions): ServerComments {
  const [sendComment, onComment] = room.makeAction(SERVER_COMMENT)
  const [sendAck] = room.makeAction(SERVER_COMMENT_ACK)
  const canEdit = () => room.role() !== null && room.role() !== 'viewer'
  /** A viewer's comments waiting to reach the document: their own and others' the server kept. */
  let pending: PendingComments[] = []
  /** Comments an editor received before the room's document reached its tab. */
  const waiting = new Map<string, PendingComments>()

  /** The comments the room's document holds, whatever this tab shows. */
  function roomComments(): CommentThread[] {
    const stored = ynodes.get(store.graph.rootId)?.get('comments')
    if (stored === undefined) return []
    const parsed = v.safeParse(commentThreadsSchema, stored)
    return parsed.success ? parsed.output : []
  }

  function withPending(threads: CommentThread[]): CommentThread[] {
    return pending.reduce(
      (current, entry) => applyCommentOps(current, entry.ops, entry.author),
      threads
    )
  }

  function showPending() {
    if (canEdit()) return
    const inRoom = roomComments()
    // Those the document now holds no longer wait.
    pending = pending.filter((entry) => applyCommentOps(inRoom, entry.ops, entry.author) !== inRoom)
    const shown = withPending(inRoom)
    if (isEqual(shown, documentComments(store.graph))) return
    quietly(() => store.graph.updateNode(store.graph.rootId, { comments: shown }))
  }

  function sendLocalChanges(): boolean {
    if (canEdit()) return false
    const ops = diffCommentOps(withPending(roomComments()), documentComments(store.graph))
    if (ops.length === 0) return false
    sendComment(encodeCommentOps(ops), SERVER_PEER)
    pending.push({ author: personName(), ops })
    return true
  }

  function write(id: string, entry: PendingComments) {
    const threads = documentComments(store.graph)
    const next = applyCommentOps(threads, entry.ops, entry.author)
    // A write the room receives, as any edit an editor makes; outside the undo history.
    if (next !== threads) store.graph.updateNode(store.graph.rootId, { comments: next })
    // After the edit's update, so the server stores the comment before it forgets it.
    queueMicrotask(() => sendAck(new TextEncoder().encode(id), SERVER_PEER))
  }

  function flush() {
    if (!canEdit() || !hasDocument()) return
    for (const [id, entry] of waiting) write(id, entry)
    waiting.clear()
  }

  onComment((data, peerId) => {
    // Only the server's stamp says who wrote a comment; nothing a peer relays is taken.
    if (peerId !== SERVER_PEER) return
    const queued = decodeQueuedComments(data)
    if (!queued) return
    const entry = { author: queued.name, ops: queued.ops }
    if (canEdit()) {
      waiting.set(queued.id, entry)
      flush()
      return
    }
    pending.push(entry)
    if (hasDocument()) showPending()
  })

  return { sendLocalChanges, showPending, flush }
}
