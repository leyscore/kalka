import { describe, expect, test } from 'bun:test'

import {
  steppedFontSize,
  steppedFontWeight,
  steppedLetterSpacing,
  steppedLineHeight
} from '@kalka/core/editor'

describe('Figma’s text adjust shortcuts', () => {
  test('step the font size by a pixel, never below one', () => {
    expect(steppedFontSize({ fontSize: 16 }, 1)).toBe(17)
    expect(steppedFontSize({ fontSize: 1 }, -1)).toBe(1)
  })

  test('step the weight through the named weights', () => {
    expect(steppedFontWeight({ fontWeight: 400 }, 1)).toBe(500)
    expect(steppedFontWeight({ fontWeight: 450 }, -1)).toBe(400)
    expect(steppedFontWeight({ fontWeight: 900 }, 1)).toBe(900)
  })

  test('step the line height in its unit, auto starting from 1.2', () => {
    expect(steppedLineHeight({ fontSize: 20, lineHeight: null, lineHeightUnit: 'PIXELS' }, 1)).toBe(
      25
    )
    expect(steppedLineHeight({ fontSize: 20, lineHeight: 30, lineHeightUnit: 'PERCENT' }, -1)).toBe(
      29.8
    )
  })

  test('step the letter spacing by a tenth of a pixel or a percent of the size', () => {
    expect(
      steppedLetterSpacing({ fontSize: 16, letterSpacing: 0.2, letterSpacingUnit: 'PIXELS' }, 1)
    ).toBe(0.3)
    expect(
      steppedLetterSpacing({ fontSize: 20, letterSpacing: 0, letterSpacingUnit: 'PERCENT' }, -1)
    ).toBe(-0.2)
  })
})
