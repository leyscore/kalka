import { describe, expect, test } from 'bun:test'

import type { NodeChange } from '@open-pencil/kiwi/fig/codec'

import { applyStyleRefsToFields } from '#core/kiwi/fig/node-change/style-refs'

describe('fig import style refs', () => {
  test('effect and grid styles replace stale direct payloads', () => {
    const effectGuid = { sessionID: 4, localID: 5000 }
    const gridGuid = { sessionID: 4, localID: 5001 }
    const effect = {
      type: 'DROP_SHADOW' as const,
      color: { r: 0, g: 0, b: 0, a: 0.25 },
      offset: { x: 0, y: 4 },
      radius: 8,
      spread: 0,
      visible: true
    }
    const grid = { pattern: 'COLUMNS', count: 12, gutterSize: 16, visible: true }
    const fields: Record<string, unknown> = {
      styleIdForEffect: { guid: effectGuid },
      styleIdForGrid: { guid: gridGuid },
      effects: [],
      layoutGrids: []
    }

    applyStyleRefsToFields(
      new Map([
        ['4:5000', { styleType: 'EFFECT', effects: [effect] }],
        ['4:5001', { styleType: 'GRID', layoutGrids: [grid] }]
      ]),
      fields
    )

    expect(fields.effects).toEqual([effect])
    expect(fields.layoutGrids).toEqual([grid])
  })

  test('stroke fill style overrides stale direct stroke paint', () => {
    const styleGuid = { sessionID: 4, localID: 4594 }
    const stylePaint = {
      type: 'SOLID' as const,
      color: { r: 0.886274516582489, g: 0.9098039269447327, b: 0.9411764740943909, a: 1 },
      opacity: 1,
      visible: true,
      blendMode: 'NORMAL' as const
    }
    const fields: Record<string, unknown> &
      Pick<NodeChange, 'styleIdForStrokeFill' | 'strokePaints'> = {
      styleIdForStrokeFill: { guid: styleGuid },
      strokePaints: [
        {
          type: 'SOLID',
          color: { r: 0, g: 0, b: 0, a: 1 },
          opacity: 1,
          visible: true,
          blendMode: 'NORMAL'
        }
      ]
    }

    applyStyleRefsToFields(
      new Map([
        [
          '4:4594',
          {
            styleType: 'FILL',
            fillPaints: [stylePaint]
          }
        ]
      ]),
      fields
    )

    expect(fields.strokePaints).toEqual([stylePaint])
  })
})
