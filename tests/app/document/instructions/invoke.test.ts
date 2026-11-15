import { describe, expect, test } from 'bun:test'

import { withLibrary } from '@/app/document/instructions/catalog'
import { findInvocations, matchSuggestions, suggestionAt } from '@/app/document/instructions/invoke'
import { librarySkills, parseSkillLibrary, skillSlug } from '@/app/document/instructions/library'
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

  test('a folder adds its skills to those of the library and may replace one by name', () => {
    const library = { skills: ['direction', 'critique'], documents: [] }
    const own = { skills: ['critique', 'pricing-page'], documents: ['brief.md'] }
    expect(withLibrary(library, own)).toEqual({
      skills: ['direction', 'critique', 'pricing-page'],
      documents: ['brief.md']
    })
  })
})

describe('skill library', () => {
  test('a skill turned off is not on offer, and an own skill stands for one of the same name', () => {
    const skills = librarySkills({
      own: { critique: 'Mine.', pricing: 'Prices.' },
      disabled: ['polish']
    })
    expect(skills.polish).toBeUndefined()
    expect(skills.critique).toBe('Mine.')
    expect(skills.pricing).toBe('Prices.')
    expect(skills.direction).toBe(BUILT_IN_SKILLS.direction)
  })

  test('a stored library that does not read starts over empty', () => {
    expect(parseSkillLibrary('not json')).toEqual({ own: {}, disabled: [] })
    expect(parseSkillLibrary('{"own":{"a":"b"},"disabled":["polish"]}')).toEqual({
      own: { a: 'b' },
      disabled: ['polish']
    })
  })

  test('a name becomes what is typed after a slash', () => {
    expect(skillSlug('  Pricing Page! ')).toBe('pricing-page')
    expect(skillSlug('---')).toBe('')
  })
})
