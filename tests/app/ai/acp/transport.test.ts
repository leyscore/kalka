import { describe, expect, test } from 'bun:test'

import type { PromptResponse } from '@agentclientprotocol/sdk'
import type { UIMessageChunk } from 'ai'

import { promptStream, type ACPPromptSession } from '@/app/ai/acp/transport'

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
