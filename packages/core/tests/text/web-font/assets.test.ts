import { describe, expect, test } from 'bun:test'

import { remoteFacesForText } from '#core/text/web-font/assets'

const LATIN = { face: { unicodeRange: ['U+0000-00FF', 'U+0131'] } }
const CYRILLIC = { face: { unicodeRange: ['U+0301', 'U+0400-045F'] } }
const GREEK = { face: { unicodeRange: ['U+0370-03FF'] } }

describe('the files of a web font an export ships', () => {
  test('are the ones holding a character the text draws', () => {
    const faces = [LATIN, CYRILLIC, GREEK]
    expect(remoteFacesForText(faces, 'Pringles')).toEqual([LATIN])
    expect(remoteFacesForText(faces, 'Три корочки')).toEqual([LATIN, CYRILLIC])
    expect(remoteFacesForText(faces, 'Три')).toEqual([CYRILLIC])
  })

  test('fall back to the first file when none says what it holds', () => {
    const whole = { face: {} }
    expect(remoteFacesForText([whole, { face: {} }], 'Три')).toEqual([whole])
    expect(remoteFacesForText([LATIN, GREEK], '日本')).toEqual([LATIN])
  })
})
