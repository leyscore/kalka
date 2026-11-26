import { describe, expect, test } from 'bun:test'

import type { CommentMessage, CommentThread } from '@kalka/scene-graph'

import { notificationReason, unreadMessages } from '@/app/comments/inbox'

function message(name: string, createdAt: number, mentions?: string[]): CommentMessage {
  return {
    id: `${name}-${createdAt}`,
    author: { kind: 'person', name },
    text: 'Hi',
    createdAt,
    mentions
  }
}

function thread(...messages: CommentMessage[]): CommentThread {
  return {
    id: 't',
    anchor: { pageId: 'p', nodeId: null, x: 0, y: 0 },
    messages,
    resolved: false
  }
}

describe('unread comments', () => {
  test("someone else's messages after the last read are unread, never one's own", () => {
    const conversation = thread(message('Ada', 1), message('Grace', 2), message('Ada', 3))
    expect(unreadMessages(conversation, 0, 'ada').map((entry) => entry.createdAt)).toEqual([2])
    expect(unreadMessages(conversation, 2, 'Ada')).toEqual([])
  })

  test('a message is for someone it mentions, or who wrote earlier in the thread', () => {
    const mention = message('Grace', 2, ['Ada'])
    const reply = message('Grace', 3)
    const conversation = thread(message('Ada', 1), mention, reply)
    expect(notificationReason(conversation, mention, 'Ada')).toBe('mention')
    expect(notificationReason(conversation, reply, 'Ada')).toBe('reply')
    expect(notificationReason(thread(message('Grace', 1)), message('Grace', 1), 'Ada')).toBeNull()
  })
})
