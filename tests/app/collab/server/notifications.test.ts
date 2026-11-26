import { describe, expect, test } from 'bun:test'

import type { CommentThread } from '@kalka/scene-graph'

import { commentRecipients } from '@/app/collab/server/notifications'

const thread: CommentThread = {
  id: 't',
  anchor: { pageId: 'p', nodeId: null, x: 0, y: 0 },
  resolved: false,
  messages: [
    { id: 'm1', author: { kind: 'person', name: 'Ada' }, text: 'First', createdAt: 1 },
    { id: 'm2', author: { kind: 'agent', name: 'Wren' }, text: 'Done', createdAt: 2 },
    { id: 'm3', author: { kind: 'person', name: 'Bob' }, text: 'Thanks', createdAt: 3 },
    {
      id: 'm4',
      author: { kind: 'person', name: 'Cleo' },
      text: '@Dan look',
      createdAt: 4,
      mentions: ['Dan']
    }
  ]
}

describe('server notifications', () => {
  test('a message is for the people it mentions and those who wrote before it', () => {
    const latest = thread.messages[3]
    if (!latest) throw new Error('fixture')
    expect(commentRecipients(thread, latest)).toEqual({
      mentions: ['Dan'],
      participants: ['Ada', 'Bob']
    })
  })

  test('the first message of a thread answers nobody', () => {
    const first = thread.messages[0]
    if (!first) throw new Error('fixture')
    expect(commentRecipients(thread, first)).toEqual({ mentions: [], participants: [] })
  })
})
