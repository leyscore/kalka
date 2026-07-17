import { describe, expect, test } from 'bun:test'

import {
  applyStyleRefsToFields,
  convertFontFeatures,
  convertLetterSpacing,
  convertLineHeight,
  mapTextDecoration
} from '../src/node-change'

describe('@open-pencil/fig NodeChange policy', () => {
  test('converts normalized text values', () => {
    expect(convertLineHeight({ value: 120, units: 'PERCENT' }, 20)).toBe(24)
    expect(convertLetterSpacing({ value: 10, units: 'PERCENT' }, 20)).toBe(2)
    expect(mapTextDecoration('UNDERLINE')).toBe('UNDERLINE')
  })

  test('converts Figma OpenType feature toggles', () => {
    expect(
      convertFontFeatures({
        toggledOnOTFeatures: ['DLIG'],
        toggledOffOTFeatures: ['LIGA']
      })
    ).toEqual([
      { tag: 'DLIG', enabled: true },
      { tag: 'LIGA', enabled: false }
    ])
  })

  test('resolves imported style references before SceneGraph conversion', () => {
    const fields: Record<string, unknown> = {
      styleIdForFill: { guid: { sessionID: 2, localID: 3 } }
    }
    applyStyleRefsToFields(
      new Map([
        [
          '2:3',
          {
            type: 'RECTANGLE',
            styleType: 'FILL',
            fillPaints: [{ type: 'SOLID', visible: true }]
          }
        ]
      ]),
      fields
    )
    expect(fields.fillPaints).toEqual([{ type: 'SOLID', visible: true }])
  })
})
