import { describe, expect, test } from 'bun:test'

import { computeImageHash } from '@kalka/scene-graph'

describe('computeImageHash', () => {
  test('names bytes by their SHA-1, as Figma names images', () => {
    expect(computeImageHash(new TextEncoder().encode('abc'))).toBe(
      'a9993e364706816aba3e25717850c26c9cd0d89d'
    )
    expect(computeImageHash(new Uint8Array())).toBe('da39a3ee5e6b4b0d3255bfef95601890afd80709')
  })
})
