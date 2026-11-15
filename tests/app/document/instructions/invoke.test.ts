import { describe, expect, test } from 'bun:test'

import { withBuiltIn } from '@/app/document/instructions/catalog'
import { findInvocations, matchSuggestions, suggestionAt } from '@/app/document/instructions/invoke'
import { BUILT_IN_SKILLS, skillBody, usedSkills } from '@/app/document/instructions/starter-skills'

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

describe('built-in skills', () => {
  test('every skill a skill relies on exists', () => {
    for (const text of Object.values(BUILT_IN_SKILLS)) {
      for (const name of usedSkills(text)) expect(BUILT_IN_SKILLS[name]).toBeDefined()
    }
  })

  test('the Uses line names skills and is not part of what the agent reads', () => {
    const text = '# Page\n\nUses: /anti-slop, /copy\n\nDraw it.'
    expect(usedSkills(text)).toEqual(['anti-slop', 'copy'])
    expect(skillBody(text)).toBe('# Page\n\nDraw it.')
    expect(usedSkills('# Page\n\nDraw it.')).toEqual([])
  })

  test("a folder adds its skills to Kalka's and may replace one by name", () => {
    const own = { skills: ['critique', 'pricing-page'], documents: ['brief.md'] }
    const merged = withBuiltIn(own)
    expect(merged.skills.filter((name) => name === 'critique')).toHaveLength(1)
    expect(merged.skills).toContain('pricing-page')
    expect(merged.skills).toContain('direction')
    expect(merged.documents).toEqual(['brief.md'])
  })
})
