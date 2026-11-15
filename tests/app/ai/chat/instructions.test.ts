import { describe, expect, test } from 'bun:test'

import {
  appendProjectInstructions,
  PROJECT_INSTRUCTIONS_MARKER,
  stripModelNotes
} from '@/app/ai/chat/context'
import { formatProjectInstructions, MAX_INSTRUCTIONS_BYTES } from '@/app/ai/chat/instructions'

describe('formatProjectInstructions', () => {
  test('lists the files in name order under their names and skips empty ones', () => {
    const note = formatProjectInstructions([
      { name: 'tone.md', text: 'Friendly.\n' },
      { name: 'empty.md', text: '  \n' },
      { name: 'brand.md', text: 'Blue only.' }
    ])
    expect(note).toBe('### brand.md\nBlue only.\n\n### tone.md\nFriendly.')
  })

  test('is empty when no file says anything', () => {
    expect(formatProjectInstructions([])).toBe('')
    expect(formatProjectInstructions([{ name: 'a.md', text: '' }])).toBe('')
  })

  test('cuts what goes past the size limit and leaves out the files after it', () => {
    const note = formatProjectInstructions([
      { name: 'a.md', text: 'x'.repeat(MAX_INSTRUCTIONS_BYTES + 50) },
      { name: 'b.md', text: 'never reached' }
    ])
    expect(note.endsWith('[cut]')).toBe(true)
    expect(note).not.toContain('b.md')
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
