import { describe, expect, test } from 'bun:test'

import type { UIMessage } from 'ai'

import { appendProjectInstructions } from '@/app/ai/chat/context'
import { fallbackTitle, snapshotMessages } from '@/app/ai/chat/history/messages'

function userMessage(id: string, text: string): UIMessage {
  return { id, role: 'user', parts: [{ type: 'text', text }] }
}

describe('conversation history', () => {
  test('names a conversation after what the person wrote, not the instructions sent with it', () => {
    const message = userMessage('m1', appendProjectInstructions('Make the hero bolder', '# Rules'))
    expect(fallbackTitle([message])).toBe('Make the hero bolder')
  })

  test('saves the request as written, so a reopened conversation shows no instructions', () => {
    const message = userMessage('m2', appendProjectInstructions('test', '# Rules'))
    expect(snapshotMessages([message])[0]?.displayText).toBe('test')
  })
})
