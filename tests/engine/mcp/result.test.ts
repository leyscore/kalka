import { describe, expect, test } from 'bun:test'

import * as v from 'valibot'

import { MAX_RESULT_BYTES, ok } from '#mcp/result'
import { fileResult } from '#mcp/tool/response'

const ErrorJSON = v.pipe(v.string(), v.parseJson(), v.object({ error: v.string() }))

describe('MCP result formatting', () => {
  test('returns structured errors for oversized text results', () => {
    const result = ok({ payload: 'x'.repeat(MAX_RESULT_BYTES) }, 'large_tool')

    expect(result.isError).toBe(true)
    expect(result.content[0].type).toBe('text')
    if (result.content[0].type !== 'text') throw new Error('Expected text result')
    const error = v.parse(ErrorJSON, result.content[0].text)
    expect(error.error).toContain('large_tool')
    expect(error.error).toContain('too large')
  })
})

describe('image results with several images', () => {
  const file = {
    base64: 'AAAA',
    mimeType: 'image/png',
    images: [{ base64: 'BBBB', mimeType: 'image/webp' }],
    note: 'Two pictures'
  }

  test('inlines every image, then the metadata without their bytes', () => {
    expect(fileResult('ask_user', file, null, 'inline')).toEqual({
      content: [
        { type: 'image', data: 'AAAA', mimeType: 'image/png' },
        { type: 'image', data: 'BBBB', mimeType: 'image/webp' },
        { type: 'text', text: JSON.stringify({ mimeType: 'image/png', note: 'Two pictures' }) }
      ]
    })
  })

  test('ignores further entries that are not images', () => {
    const result = fileResult(
      'ask_user',
      { ...file, images: [{ base64: 'CCCC', mimeType: 'application/pdf' }, 'nope'] },
      null,
      'inline'
    )
    expect(result.content.filter((part) => part.type === 'image')).toHaveLength(1)
  })
})
