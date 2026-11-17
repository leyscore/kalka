import * as v from 'valibot'

import type { SceneGraph } from './index'
import type { Vector } from './primitives'
import { randomHex } from './random'

/**
 * Comments: threads people pin on a layer or a point of a page, which agents can be asked to act
 * on. They are notes about the design, not part of it: they live on the document's root, are
 * saved with the document, and are changed outside the undo history, so undoing a design edit
 * never takes back a comment.
 */

export const COMMENT_AUTHOR_KINDS = ['person', 'agent'] as const
export type CommentAuthorKind = (typeof COMMENT_AUTHOR_KINDS)[number]

/**
 * Where an agent stands on a thread that asks it for something: waiting for it to pick the
 * request up, working on it, answered in the thread, or stopped on an error, retried by hand.
 */
export const COMMENT_AGENT_STATES = ['waiting', 'working', 'answered', 'failed'] as const
export type CommentAgentState = (typeof COMMENT_AGENT_STATES)[number]

export interface CommentAuthor {
  kind: CommentAuthorKind
  name: string
}

export interface CommentMessage {
  id: string
  author: CommentAuthor
  text: string
  /** Milliseconds since the epoch. */
  createdAt: number
}

/**
 * What a thread is pinned to: a layer, with the point as an offset from its top-left corner so the
 * pin moves with it, or a point of a page in world coordinates.
 */
export interface CommentAnchor {
  pageId: string
  nodeId: string | null
  x: number
  y: number
}

export interface CommentThread {
  id: string
  anchor: CommentAnchor
  messages: CommentMessage[]
  resolved: boolean
  /** Who resolved it, when it is. */
  resolvedBy?: string
  /** The agent the thread asks, and where it stands, when it asks one. */
  agent?: { name: string; state: CommentAgentState }
}

/** How long a message may be; a comment is a note, not a document. */
export const MAX_COMMENT_LENGTH = 4000

const author = v.object({
  kind: v.picklist(COMMENT_AUTHOR_KINDS),
  name: v.pipe(v.string(), v.maxLength(80))
})

const message = v.object({
  id: v.string(),
  author,
  text: v.pipe(v.string(), v.maxLength(MAX_COMMENT_LENGTH)),
  createdAt: v.pipe(v.number(), v.finite())
})

const threadSchema = v.object({
  id: v.string(),
  anchor: v.object({
    pageId: v.string(),
    nodeId: v.nullable(v.string()),
    x: v.pipe(v.number(), v.finite()),
    y: v.pipe(v.number(), v.finite())
  }),
  messages: v.pipe(v.array(message), v.minLength(1)),
  resolved: v.boolean(),
  resolvedBy: v.optional(v.string()),
  agent: v.optional(
    v.object({ name: v.pipe(v.string(), v.maxLength(80)), state: v.picklist(COMMENT_AGENT_STATES) })
  )
})

/** Stored threads, from a file: a malformed thread is dropped, and a repeated id kept once. */
export const commentThreadsSchema: v.GenericSchema<unknown, CommentThread[]> = v.pipe(
  v.array(v.unknown()),
  v.transform((items) => {
    const threads: CommentThread[] = []
    for (const item of items) {
      const parsed = v.safeParse(threadSchema, item)
      if (parsed.success && !threads.some((known) => known.id === parsed.output.id))
        threads.push(parsed.output)
    }
    return threads
  })
)

export function documentComments(graph: SceneGraph): CommentThread[] {
  return graph.getNode(graph.rootId)?.comments ?? []
}

export function findCommentThread(graph: SceneGraph, id: string): CommentThread | undefined {
  return documentComments(graph).find((thread) => thread.id === id)
}

function setComments(graph: SceneGraph, threads: CommentThread[]): void {
  graph.updateNode(graph.rootId, { comments: threads })
}

function updateThread(
  graph: SceneGraph,
  id: string,
  change: (thread: CommentThread) => CommentThread
): CommentThread | undefined {
  let updated: CommentThread | undefined
  const threads = documentComments(graph).map((thread) => {
    if (thread.id !== id) return thread
    updated = change(thread)
    return updated
  })
  if (updated) setComments(graph, threads)
  return updated
}

function newMessage(from: CommentAuthor, text: string, now: number): CommentMessage {
  return {
    id: randomHex(8),
    author: { ...from },
    text: text.trim().slice(0, MAX_COMMENT_LENGTH),
    createdAt: now
  }
}

/**
 * The agent a message asks, by an `@name` among `agents`, matched without case. The first
 * mention wins.
 */
export function mentionedAgent(text: string, agents: readonly string[]): string | null {
  for (const match of text.matchAll(/@([\p{L}\p{N}_-]+)/gu)) {
    const name = agents.find((agent) => agent.toLowerCase() === match[1].toLowerCase())
    if (name) return name
  }
  return null
}

/** Starts a thread; `agent` names the agent its message asks, if any. */
export function addCommentThread(
  graph: SceneGraph,
  anchor: CommentAnchor,
  from: CommentAuthor,
  text: string,
  options: { agent?: string | null; now?: number } = {}
): CommentThread {
  const thread: CommentThread = {
    id: randomHex(8),
    anchor: { ...anchor },
    messages: [newMessage(from, text, options.now ?? Date.now())],
    resolved: false
  }
  if (options.agent) thread.agent = { name: options.agent, state: 'waiting' }
  setComments(graph, [...documentComments(graph), thread])
  return thread
}

/**
 * Adds a reply. An agent's reply answers what was asked of it; a person's reply that asks an
 * agent hands the thread to it again; a reply reopens a resolved thread.
 */
export function replyToComment(
  graph: SceneGraph,
  id: string,
  from: CommentAuthor,
  text: string,
  options: { agent?: string | null; now?: number } = {}
): CommentThread | undefined {
  return updateThread(graph, id, (thread) => {
    const next: CommentThread = {
      ...thread,
      messages: [...thread.messages, newMessage(from, text, options.now ?? Date.now())],
      resolved: false,
      resolvedBy: undefined
    }
    if (from.kind === 'agent' && thread.agent) next.agent = { ...thread.agent, state: 'answered' }
    if (from.kind === 'person' && options.agent)
      next.agent = { name: options.agent, state: 'waiting' }
    return next
  })
}

export function setCommentResolved(
  graph: SceneGraph,
  id: string,
  resolved: boolean,
  by?: string
): CommentThread | undefined {
  return updateThread(graph, id, (thread) => ({
    ...thread,
    resolved,
    resolvedBy: resolved ? by : undefined
  }))
}

/** Where the agent a thread asks stands on it. */
export function setCommentAgentState(
  graph: SceneGraph,
  id: string,
  state: CommentAgentState
): CommentThread | undefined {
  const thread = findCommentThread(graph, id)
  if (!thread?.agent || thread.agent.state === state) return thread
  return updateThread(graph, id, (current) =>
    current.agent ? { ...current, agent: { ...current.agent, state } } : current
  )
}

/** Pins a thread somewhere else, such as after its pin was dragged. */
export function moveCommentThread(
  graph: SceneGraph,
  id: string,
  anchor: CommentAnchor
): CommentThread | undefined {
  return updateThread(graph, id, (thread) => ({ ...thread, anchor: { ...anchor } }))
}

export function deleteCommentThread(graph: SceneGraph, id: string): boolean {
  const threads = documentComments(graph)
  if (!threads.some((thread) => thread.id === id)) return false
  setComments(
    graph,
    threads.filter((thread) => thread.id !== id)
  )
  return true
}

/**
 * Where a thread's pin is, in world coordinates on its page: on its layer when the layer still
 * exists there, at its point otherwise. Null for a layer deleted since, whose pin has nothing left
 * to point at.
 */
export function commentPosition(graph: SceneGraph, thread: CommentThread): Vector | null {
  const { nodeId, x, y } = thread.anchor
  if (!nodeId) return { x, y }
  if (!graph.getNode(nodeId)) return null
  const origin = graph.getAbsolutePosition(nodeId)
  return { x: origin.x + x, y: origin.y + y }
}

/** Open threads that ask `agent` and wait for it, oldest first. */
export function waitingCommentsFor(graph: SceneGraph, agent?: string): CommentThread[] {
  return documentComments(graph).filter(
    (thread) =>
      !thread.resolved &&
      thread.agent?.state === 'waiting' &&
      (agent === undefined || thread.agent.name.toLowerCase() === agent.toLowerCase())
  )
}
