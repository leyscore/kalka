import { describe, expect, test } from 'bun:test'

import { findInvocations, matchSuggestions, suggestionAt } from '@/app/document/instructions/invoke'

const catalog = { skills: ['critique', 'landing-page'], documents: ['brief.md', 'offers.md'] }

describe('findInvocations', () => {
  test('finds the skills and documents the folder has, once each', () => {
    const found = findInvocations('/critique this, then /critique again with @brief.md.', catalog)
    expect(found).toEqual({ skills: ['critique'], documents: ['brief.md'] })
  })

  test('leaves paths, addresses and unknown names as text', () => {
    const found = findInvocations('see /usr/bin, mail me@example.com, try /unknown', catalog)
    expect(found).toEqual({ skills: [], documents: [] })
  })
})

describe('suggestionAt', () => {
  test('reads the word the caret is in', () => {
    expect(suggestionAt('make it /cri', 12)).toEqual({ kind: 'skill', query: 'cri', start: 8 })
    expect(suggestionAt('@', 1)).toEqual({ kind: 'document', query: '', start: 0 })
  })

  test('is null in ordinary text and after the word ends', () => {
    expect(suggestionAt('make it', 7)).toBeNull()
    expect(suggestionAt('/critique now', 13)).toBeNull()
  })
})

describe('matchSuggestions', () => {
  test('puts names that start with the query first', () => {
    expect(matchSuggestions(['landing-page', 'polish', 'page-flow'], 'pa')).toEqual([
      'page-flow',
      'landing-page'
    ])
  })
})
