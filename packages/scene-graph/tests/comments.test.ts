import { describe, expect, test } from 'bun:test'

import {
  addCommentThread,
  commentPosition,
  commentThreadsSchema,
  deleteCommentThread,
  documentComments,
  documentFrameReviews,
  frameReview,
  markChangedFramesForReview,
  mentionedAgent,
  replyToComment,
  SceneGraph,
  setCommentAgentState,
  setCommentResolved,
  setFrameReady,
  waitingCommentsFor
} from '@kalka/scene-graph'
import * as v from 'valibot'

const person = { kind: 'person' as const, name: 'Ada' }
const agent = { kind: 'agent' as const, name: 'Claude' }

function card() {
  const graph = new SceneGraph()
  const page = graph.getPages()[0]
  const frame = graph.createNode('FRAME', page.id, { name: 'Card', x: 100, y: 50 })
  return { graph, page, frame }
}

describe('comment threads', () => {
  test('a pin on a layer moves with it, and has nothing to point at once it is deleted', () => {
    const { graph, page, frame } = card()
    const thread = addCommentThread(graph, { pageId: page.id, nodeId: frame.id, x: 10, y: 5 }, person, 'Hi')
    expect(commentPosition(graph, thread)).toEqual({ x: 110, y: 55 })
    graph.updateNode(frame.id, { x: 300 })
    expect(commentPosition(graph, thread)).toEqual({ x: 310, y: 55 })
    graph.deleteNode(frame.id)
    expect(commentPosition(graph, thread)).toBeNull()
  })

  test('a request to an agent waits, is worked on, then answered by its reply', () => {
    const { graph, page } = card()
    const thread = addCommentThread(graph, { pageId: page.id, nodeId: null, x: 0, y: 0 }, person, '@claude make it warmer', {
      agent: mentionedAgent('@claude make it warmer', ['Claude', 'Codex'])
    })
    expect(thread.agent).toEqual({ name: 'Claude', state: 'waiting' })
    expect(waitingCommentsFor(graph, 'claude').map((item) => item.id)).toEqual([thread.id])

    setCommentAgentState(graph, thread.id, 'working')
    expect(waitingCommentsFor(graph)).toEqual([])
    const answered = replyToComment(graph, thread.id, agent, 'Warmer palette applied.')
    expect(answered?.agent?.state).toBe('answered')
    expect(answered?.messages.map((message) => message.author.kind)).toEqual(['person', 'agent'])

    // Asking again hands the thread back to the agent.
    const again = replyToComment(graph, thread.id, person, '@Claude and the footer', { agent: 'Claude' })
    expect(again?.agent?.state).toBe('waiting')
  })

  test('a reply reopens a resolved thread, and deleting removes it', () => {
    const { graph, page } = card()
    const thread = addCommentThread(graph, { pageId: page.id, nodeId: null, x: 0, y: 0 }, person, 'Typo')
    expect(setCommentResolved(graph, thread.id, true, 'Ada')).toMatchObject({ resolved: true, resolvedBy: 'Ada' })
    expect(replyToComment(graph, thread.id, person, 'Not quite')?.resolved).toBe(false)
    expect(deleteCommentThread(graph, thread.id)).toBe(true)
    expect(documentComments(graph)).toEqual([])
  })

  test('a mention names only an agent that exists, and threads read from a file drop what is malformed', () => {
    expect(mentionedAgent('ping @nobody', ['Claude'])).toBeNull()
    expect(mentionedAgent('email me at a@b.c', ['Claude'])).toBeNull()
    const threads = v.parse(commentThreadsSchema, [
      { id: 'a', anchor: { pageId: 'p', nodeId: null, x: 0, y: 0 }, messages: [], resolved: false },
      { id: 'b', anchor: { pageId: 'p', nodeId: null, x: 0, y: 0 }, messages: [{ id: 'm', author: person, text: 'ok', createdAt: 1 }], resolved: false },
      'nonsense'
    ])
    expect(threads.map((thread) => thread.id)).toEqual(['b'])
  })
})

describe('frame reviews', () => {
  test('a frame marked ready needs review again once anything in it changes', () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0]
    const frame = graph.createNode('FRAME', page.id, { name: 'Landing' })
    const title = graph.createNode('TEXT', frame.id, { name: 'Title', text: 'Hi' })
    const other = graph.createNode('FRAME', page.id, { name: 'Phone' })
    setFrameReady(graph, frame.id, 'Ada', 5)
    setFrameReady(graph, other.id, 'Ada', 5)
    expect(frameReview(graph, frame.id)).toEqual({ nodeId: frame.id, status: 'ready', by: 'Ada', at: 5 })

    expect(markChangedFramesForReview(graph, [title.id])).toBe(true)
    expect(frameReview(graph, frame.id)?.status).toBe('review')
    expect(frameReview(graph, other.id)?.status).toBe('ready')

    setFrameReady(graph, other.id, null)
    expect(frameReview(graph, other.id)).toBeUndefined()
    graph.deleteNode(frame.id)
    markChangedFramesForReview(graph, [frame.id])
    expect(documentFrameReviews(graph)).toEqual([])
  })
})
