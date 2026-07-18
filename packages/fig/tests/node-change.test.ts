import { describe, expect, test } from 'bun:test'

import {
  applyStyleRefsToFields,
  buildStyleOverrideTable,
  convertEffects,
  convertFills,
  convertFontFeatures,
  convertLetterSpacing,
  convertLineHeight,
  decodeVectorNetworkBlob,
  encodeVectorNetworkBlob,
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

  test('normalizes imported paints and effects', () => {
    expect(convertFills([{ type: 'SOLID' }])[0]).toMatchObject({
      color: { r: 0, g: 0, b: 0, a: 1 },
      opacity: 1,
      visible: true
    })
    expect(convertEffects([{ type: 'DROP_SHADOW' }])[0]).toMatchObject({
      type: 'DROP_SHADOW',
      radius: 0,
      visible: true
    })
  })

  test('round-trips vector network blobs with handle mirroring', () => {
    const network = {
      vertices: [
        { x: 0, y: 0, handleMirroring: 'ANGLE' as const },
        { x: 10, y: 0, handleMirroring: 'NONE' as const }
      ],
      segments: [
        {
          start: 0,
          end: 1,
          tangentStart: { x: 0, y: 0 },
          tangentEnd: { x: 0, y: 0 }
        }
      ],
      regions: []
    }
    const { table, mirroringToId } = buildStyleOverrideTable(network)
    expect(decodeVectorNetworkBlob(encodeVectorNetworkBlob(network, mirroringToId), table)).toEqual(
      network
    )
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
