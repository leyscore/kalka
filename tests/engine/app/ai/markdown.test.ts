import { describe, expect, test } from 'bun:test'

import { markdownRenderKey } from '@/app/shell/markdown/state'

describe('chat Markdown rendering state', () => {
  test('keeps one parser while streaming and remounts when content settles', () => {
    expect(markdownRenderKey({ mode: 'streaming', surface: 'message' })).toBe('message-streaming')
    expect(markdownRenderKey({ mode: 'static', surface: 'message' })).toBe('message-static')
  })

  test('isolates reasoning parser keys from response parser keys', () => {
    expect(markdownRenderKey({ mode: 'streaming', surface: 'reasoning' })).toBe(
      'reasoning-streaming'
    )
  })
})
