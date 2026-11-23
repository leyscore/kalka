import { describe, expect, test } from 'bun:test'

import { pseudoText, webFontLink } from '../src/content/capture'
import { hexColor } from '../src/content/describe'

describe('hexColor', () => {
  test('writes an opaque computed color as hex', () => {
    expect(hexColor('rgb(27, 36, 64)')).toBe('#1B2440')
  })

  test('keeps a translucent color with its alpha as a percentage', () => {
    expect(hexColor('rgba(47, 91, 234, 0.5)')).toBe('#2F5BEA 50%')
  })

  test('leaves values it cannot read unchanged', () => {
    expect(hexColor('color(display-p3 1 0 0)')).toBe('color(display-p3 1 0 0)')
  })
})

describe('pseudoText', () => {
  test('reads the quoted text a pseudo-element draws', () => {
    expect(pseudoText('"from "')).toBe('from ')
  })

  test('treats a pseudo-element without content as absent', () => {
    expect(pseudoText('none')).toBeNull()
    expect(pseudoText('normal')).toBeNull()
  })

  test('keeps an empty string for decorative pseudo-elements', () => {
    expect(pseudoText('""')).toBe('')
  })
})

describe('webFontLink', () => {
  test('links a Google Fonts stylesheet, whose rules the page cannot read', () => {
    expect(
      webFontLink('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap')
    ).toBe(
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&amp;display=swap">'
    )
  })

  test('leaves out stylesheets from other sites and inline ones', () => {
    expect(webFontLink('https://cdn.example.com/site.css')).toBeNull()
    expect(webFontLink(null)).toBeNull()
  })
})
