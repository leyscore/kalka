import { describe, expect, test } from 'bun:test'

import type { UIMessage } from 'ai'

import { serializeChatLog } from '@/app/ai/debug'
import { setActiveEditorStore } from '@/app/editor/active-store'
import { createEditorStore } from '@/app/editor/session'

const messages: UIMessage[] = [
  { id: 'user-1', role: 'user', parts: [{ type: 'text', text: 'Create a card' }] }
]

describe('AI debug log', () => {
  setActiveEditorStore(createEditorStore())

  test('records request-level failures', () => {
    const log = serializeChatLog(messages, {
      reason: 'insufficient-credit',
      detail: '402 Payment Required'
    })

    expect(log).toContain('=== ERRORS ===')
    expect(log).toContain('insufficient-credit: 402 Payment Required')
  })

  test('reports when no request failure was recorded', () => {
    expect(serializeChatLog(messages)).toContain('=== ERRORS ===\n\n  (none recorded)')
  })
})
