import { describe, expect, test } from 'bun:test'

import {
  appendProjectInstructions,
  PROJECT_INSTRUCTIONS_MARKER,
  stripModelNotes
} from '@/app/ai/chat/context'
import {
  countInstructionSections,
  describeCatalog,
  formatProjectInstructions,
  MAX_INSTRUCTIONS_BYTES
} from '@/app/ai/chat/instructions'

describe('formatProjectInstructions', () => {
  test('keeps the sections in the order given and skips empty ones', () => {
    const note = formatProjectInstructions([
      { title: 'summary.md', text: 'A bakery site.\n' },
      { title: 'empty.md', text: '  \n' },
      { title: 'Skill /critique', text: 'Look at hierarchy first.' }
    ])
    expect(note).toBe(
      '### summary.md\nA bakery site.\n\n### Skill /critique\nLook at hierarchy first.'
    )
    expect(countInstructionSections(note)).toBe(2)
  })

  test('is empty when nothing says anything', () => {
    expect(formatProjectInstructions([])).toBe('')
    expect(formatProjectInstructions([{ title: 'a.md', text: '' }])).toBe('')
  })

  test('cuts what goes past the size limit and leaves out what comes after it', () => {
    const note = formatProjectInstructions([
      { title: 'a.md', text: 'x'.repeat(MAX_INSTRUCTIONS_BYTES + 50) },
      { title: 'b.md', text: 'never reached' }
    ])
    expect(note.endsWith('[cut]')).toBe(true)
    expect(note).not.toContain('b.md')
  })
})

describe('describeCatalog', () => {
  test('names what can be asked for, each with its sign', () => {
    expect(describeCatalog({ skills: ['critique'], documents: ['brief.md'] })).toBe(
      'Skills the person can give you with a slash: /critique\nDocuments the person can give you with an at sign: @brief.md'
    )
    expect(describeCatalog({ skills: [], documents: [] })).toBe('')
  })
})

describe('appendProjectInstructions', () => {
  test('adds the note after the request, and the request reads back without it', () => {
    const sent = appendProjectInstructions('Draw a hero', '### brand.md\nBlue only.')
    expect(sent).toContain(PROJECT_INSTRUCTIONS_MARKER)
    expect(stripModelNotes(sent)).toBe('Draw a hero')
  })

  test('leaves the request alone when there are no instructions', () => {
    expect(appendProjectInstructions('Draw a hero', '')).toBe('Draw a hero')
  })
})
