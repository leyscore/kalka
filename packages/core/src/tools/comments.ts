import * as v from 'valibot'

import {
  documentComments,
  documentFrameReviews,
  findCommentThread,
  replyToComment as addReply,
  reviewedFrameOf,
  setCommentAgentState,
  setCommentResolved,
  setFrameReady,
  type CommentAgentState,
  type CommentThread,
  type SceneGraph
} from '@kalka/scene-graph'
import type { Vector } from '@kalka/scene-graph/primitives'

import { defineTool } from './schema'

/**
 * Comments for agents: people pin threads on layers and points of a page, and ask an agent with
 * `@agent`. Agents read them, act, and answer in the thread, where the person sees the answer
 * on the pin. Writing a comment is a note about the design, outside its undo history.
 */

/** The name an agent's replies carry when its host gives none. */
export const DEFAULT_COMMENT_AGENT_NAME = 'Agent'

interface ThreadView {
  id: string
  page_id: string
  on: { layer_id: string; layer_name: string } | { point: Vector }
  layer_deleted?: true
  resolved: boolean
  asks_agent?: CommentAgentState
  messages: { from: string; by: string; text: string }[]
}

function describeThread(graph: SceneGraph, thread: CommentThread): ThreadView {
  const layer = thread.anchor.nodeId ? graph.getNode(thread.anchor.nodeId) : undefined
  const view: ThreadView = {
    id: thread.id,
    page_id: thread.anchor.pageId,
    on: layer
      ? { layer_id: layer.id, layer_name: layer.name }
      : { point: { x: thread.anchor.x, y: thread.anchor.y } },
    resolved: thread.resolved,
    messages: thread.messages.map((message) => ({
      from: message.author.name,
      by: message.author.kind,
      text: message.text
    }))
  }
  if (thread.anchor.nodeId && !layer) view.layer_deleted = true
  if (thread.agent) view.asks_agent = thread.agent.state
  return view
}

/** Threads waiting for an agent, now taken by the one reading them, described for it. */
export function claimWaitingComments(graph: SceneGraph): ThreadView[] {
  const waiting = documentComments(graph).filter(
    (thread) => !thread.resolved && thread.agent?.state === 'waiting'
  )
  for (const thread of waiting) setCommentAgentState(graph, thread.id, 'working')
  return waiting.map((thread) =>
    describeThread(graph, findCommentThread(graph, thread.id) ?? thread)
  )
}

export const getComments = defineTool({
  name: 'get_comments',
  description:
    'Read the comment threads people pinned on layers and points of the design: who said what, on which layer, and whether a thread asks you (asks_agent). Threads waiting for an agent are yours once you read them: act on each, then answer with reply_to_comment, or ask your question there if you need a decision. Resolved threads are left out unless include_resolved.',
  execution: { kind: 'sync', mutation: 'none' },
  exposure: { webmcp: false },
  input: v.strictObject({
    include_resolved: v.optional(v.pipe(v.boolean(), v.description('Also list resolved threads')))
  }),
  execute: (figma, { include_resolved }) => {
    const graph = figma.graph
    // Reading claims what waits for an agent, so its pin shows the request is being handled.
    claimWaitingComments(graph)
    return {
      threads: documentComments(graph)
        .filter((thread) => include_resolved || !thread.resolved)
        .map((thread) => describeThread(graph, thread))
    }
  }
})

const threadId = v.pipe(
  v.string(),
  v.minLength(1),
  v.description('The thread id from get_comments')
)

export const replyToComment = defineTool({
  name: 'reply_to_comment',
  description:
    'Answer in a comment thread: say what you changed for a request, or ask the question you need answered before you act. The person sees it on the pin.',
  execution: { kind: 'sync', mutation: 'none' },
  exposure: { webmcp: false },
  input: v.strictObject({
    thread_id: threadId,
    text: v.pipe(v.string(), v.minLength(1), v.description('Your reply'))
  }),
  execute: (figma, { thread_id, text }) => {
    const name = figma.commentAuthorName ?? DEFAULT_COMMENT_AGENT_NAME
    const thread = addReply(figma.graph, thread_id, { kind: 'agent', name }, text)
    if (!thread) return { error: `No comment thread "${thread_id}". Call get_comments.` }
    return { thread: describeThread(figma.graph, thread) }
  }
})

export const resolveComment = defineTool({
  name: 'resolve_comment',
  description:
    'Mark a comment thread resolved once what it asked is done, or reopen it with resolved false.',
  execution: { kind: 'sync', mutation: 'none' },
  exposure: { webmcp: false },
  input: v.strictObject({
    thread_id: threadId,
    resolved: v.optional(v.boolean(), true)
  }),
  execute: (figma, { thread_id, resolved }) => {
    const name = figma.commentAuthorName ?? DEFAULT_COMMENT_AGENT_NAME
    const thread = setCommentResolved(figma.graph, thread_id, resolved, name)
    if (!thread) return { error: `No comment thread "${thread_id}". Call get_comments.` }
    return { id: thread.id, resolved: thread.resolved }
  }
})

export const getFrameReviews = defineTool({
  name: 'get_frame_reviews',
  description:
    'Which top-level frames people marked ready for development (status ready), and which changed since and need review again (status review). Frames not listed are drafts. Read it before you build a design in code: build what is ready.',
  execution: { kind: 'sync', mutation: 'none' },
  exposure: { webmcp: false },
  input: v.strictObject({}),
  execute: (figma) => ({
    frames: documentFrameReviews(figma.graph).map((review) => ({
      id: review.nodeId,
      name: figma.graph.getNode(review.nodeId)?.name ?? '',
      status: review.status,
      by: review.by
    }))
  })
})

export const setFrameReview = defineTool({
  name: 'set_frame_review',
  description:
    'Mark a top-level frame ready for development, or a draft again with ready false. Only when the person asks you to: approving a design is theirs to decide.',
  execution: { kind: 'sync', mutation: 'none' },
  exposure: { webmcp: false },
  input: v.strictObject({
    id: v.pipe(v.string(), v.minLength(1), v.description('The top-level frame')),
    ready: v.optional(v.boolean(), true)
  }),
  execute: (figma, { id, ready }) => {
    const frame = reviewedFrameOf(figma.graph, id) === id ? id : null
    if (!frame) return { error: `"${id}" is not a top-level frame of a page.` }
    const name = figma.commentAuthorName ?? DEFAULT_COMMENT_AGENT_NAME
    setFrameReady(figma.graph, frame, ready ? `${name} (asked)` : null)
    return { id: frame, status: ready ? 'ready' : 'draft' }
  }
})
