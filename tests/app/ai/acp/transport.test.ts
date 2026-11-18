import { describe, expect, test } from 'bun:test'

import type { PromptResponse } from '@agentclientprotocol/sdk'
import type { UIMessage, UIMessageChunk } from 'ai'

import {
  earlierConversation,
  imageBlocks,
  promptStream,
  type ACPPromptSession
} from '@/app/ai/acp/transport'

function fakeSession(reply: Promise<PromptResponse>): ACPPromptSession {
  return {
    sessionId: 'session',
    onUpdate: null,
    connection: {
      prompt: () => reply,
      cancel: async () => undefined
    }
  }
}

async function readAll(stream: ReadableStream<UIMessageChunk>): Promise<UIMessageChunk[]> {
  const chunks: UIMessageChunk[] = []
  for await (const chunk of stream) chunks.push(chunk)
  return chunks
}

describe('promptStream', () => {
  test('ends when the agent ends its turn, so the chat takes the next message', async () => {
    const session = fakeSession(Promise.resolve({ stopReason: 'end_turn' }))
    const chunks = await readAll(promptStream(session, 'test', undefined, String))
    expect(chunks.at(-1)).toEqual({ type: 'finish', finishReason: 'stop' })
    expect(session.onUpdate).toBeNull()
  })

  test('ends with the agent error when the prompt fails', async () => {
    const session = fakeSession(Promise.reject(new Error('Credit balance is too low')))
    const chunks = await readAll(promptStream(session, 'test', undefined, () => 'No credit'))
    expect(chunks).toContainEqual({ type: 'error', errorText: 'No credit' })
    expect(chunks.at(-1)).toEqual({ type: 'finish', finishReason: 'error' })
  })
})

describe('earlierConversation', () => {
  const message = (id: string, role: 'user' | 'assistant', text: string): UIMessage => ({
    id,
    role,
    parts: [{ type: 'text', text }]
  })

  test('gives a new session the conversation before the message it answers', () => {
    const transcript = earlierConversation([
      message('1', 'user', 'Design a landing page'),
      message('2', 'assistant', 'Hero and header are in.'),
      message('3', 'user', 'Now the footer')
    ])
    expect(transcript).toContain('Design a landing page')
    expect(transcript).toContain('Hero and header are in.')
    expect(transcript).not.toContain('Now the footer')
  })

  test('is null for a first message, and keeps the end of a long conversation', () => {
    expect(earlierConversation([message('1', 'user', 'Hello')])).toBeNull()
    const long = earlierConversation([
      message('1', 'user', `start ${'x'.repeat(40_000)}`),
      message('2', 'assistant', 'latest state'),
      message('3', 'user', 'go on')
    ])
    expect(long).toContain('latest state')
    expect(long).not.toContain('start ')
  })
})

describe('imageBlocks', () => {
  test("turns a message's attached images into prompt images", () => {
    const blocks = imageBlocks({
      id: '1',
      role: 'user',
      parts: [
        { type: 'text', text: 'Make it look like this' },
        { type: 'file', mediaType: 'image/png', url: 'data:image/png;base64,iVBORw0KGgo=' },
        { type: 'file', mediaType: 'application/pdf', url: 'data:application/pdf;base64,JVBERg==' }
      ]
    })
    expect(blocks).toEqual([{ type: 'image', mimeType: 'image/png', data: 'iVBORw0KGgo=' }])
  })

  test('is empty without a message or images', () => {
    expect(imageBlocks(undefined)).toEqual([])
    expect(imageBlocks({ id: '1', role: 'user', parts: [{ type: 'text', text: 'Hi' }] })).toEqual(
      []
    )
  })
})
