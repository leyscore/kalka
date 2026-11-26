import { describe, expect, test } from 'bun:test'

import type { CommentThread } from '@kalka/scene-graph'

import {
  applyCommentOps,
  decodeCommentOps,
  decodeQueuedComments,
  diffCommentOps,
  encodeCommentOps,
  type CommentOp
} from '@/app/collab/server/comment-ops'

const NOW = 1_800_000_000_000

function thread(id: string, author: string, extra: Partial<CommentThread> = {}): CommentThread {
  return {
    id,
    anchor: { pageId: 'page', nodeId: null, x: 1, y: 2 },
    messages: [
      { id: `${id}-m1`, author: { kind: 'person', name: author }, text: 'Hi', createdAt: 1 }
    ],
    resolved: false,
    ...extra
  }
}

const encoder = new TextEncoder()
const stamp = (value: string) => [encoder.encode(value).length, ...encoder.encode(value)]

describe('viewer comment operations', () => {
  test('a new thread, a reply, a reaction and a resolve become operations', () => {
    const before = [thread('a', 'Ada')]
    const first = before[0]?.messages[0]
    if (!first) throw new Error('fixture')
    const after: CommentThread[] = [
      {
        ...thread('a', 'Ada'),
        resolved: true,
        messages: [
          { ...first, reactions: [{ emoji: '🎉', people: ['me'] }] },
          { id: 'a-m2', author: { kind: 'person', name: 'me' }, text: 'Done', createdAt: 5 }
        ]
      },
      thread('b', 'me')
    ]
    expect(diffCommentOps(before, after).map((op) => op.op)).toEqual([
      'react',
      'reply',
      'resolve',
      'add'
    ])
  })

  test('applied under the name the server stamped, whatever the viewer wrote', () => {
    const ops = diffCommentOps([], [thread('b', 'Pretending to be the boss')])
    const [merged] = applyCommentOps([], ops, 'Viewer', NOW)
    expect(merged?.messages[0]?.author).toEqual({ kind: 'person', name: 'Viewer' })
  })

  test('applying the same operations twice changes nothing the second time', () => {
    const ops: CommentOp[] = [
      ...diffCommentOps([], [thread('b', 'V')]),
      { op: 'react', threadId: 'b', messageId: 'b-m1', emoji: '👍', on: true }
    ]
    const once = applyCommentOps([], ops, 'Viewer', NOW)
    expect(applyCommentOps(once, ops, 'Viewer', NOW)).toBe(once)
  })

  test('annotations, measurements and other people’s threads stay as they are', () => {
    const note = thread('n', 'Ada', { annotation: { properties: [] } })
    const others = thread('o', 'Ada')
    const threads = [note, others]
    const ops: CommentOp[] = [
      { op: 'reply', threadId: 'n', messageId: 'x', text: 'No', createdAt: 1 },
      { op: 'resolve', threadId: 'n', resolved: true },
      { op: 'delete', threadId: 'o' }
    ]
    expect(applyCommentOps(threads, ops, 'Viewer', NOW)).toBe(threads)
    // Whoever started a thread deletes it.
    expect(
      applyCommentOps([thread('m', 'Viewer')], [{ op: 'delete', threadId: 'm' }], 'Viewer')
    ).toEqual([])
  })

  test('a comment dated in the future is dated now', () => {
    const ops = diffCommentOps(
      [],
      [
        {
          ...thread('f', 'V'),
          messages: [
            { id: 'f1', author: { kind: 'person', name: 'V' }, text: 'Later', createdAt: NOW * 2 }
          ]
        }
      ]
    )
    expect(applyCommentOps([], ops, 'Viewer', NOW)[0]?.messages[0]?.createdAt).toBe(NOW)
  })

  test('only comment operations are read from the channel', () => {
    expect(decodeCommentOps(encodeCommentOps(diffCommentOps([], [thread('b', 'V')])))).toHaveLength(
      1
    )
    expect(decodeCommentOps(encoder.encode('{"ops":[{"op":"setNode","id":"x"}]}'))).toBeNull()
    expect(decodeCommentOps(encoder.encode('not json'))).toBeNull()
    expect(
      decodeCommentOps(
        encoder.encode(
          JSON.stringify({
            ops: [{ op: 'react', threadId: 'a', messageId: 'b', emoji: 'x'.repeat(300), on: true }]
          })
        )
      )
    ).toBeNull()
  })

  test('a stamped comment carries its id, sender and name', () => {
    const payload = Uint8Array.of(
      ...stamp('q1'),
      ...stamp('user-1'),
      ...stamp('Viewer'),
      ...encodeCommentOps([{ op: 'resolve', threadId: 'a', resolved: true }])
    )
    expect(decodeQueuedComments(payload)).toEqual({
      id: 'q1',
      userId: 'user-1',
      name: 'Viewer',
      ops: [{ op: 'resolve', threadId: 'a', resolved: true }]
    })
    expect(decodeQueuedComments(Uint8Array.of(9, 1, 2))).toBeNull()
  })
})
