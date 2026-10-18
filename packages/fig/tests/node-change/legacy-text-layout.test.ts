import { expect, test } from 'bun:test'

import { nodeChangeToProps } from '#fig/node-change/index'

import type { NodeChange } from '@kalka/kiwi/fig/codec'

/**
 * Files saved before Figma wrote `derivedTextData` keep the same layout in `textData`: a 16px
 * text with the font's own line height ("Auto", 100% of a 1.5 em face) laid out 24px tall.
 */
const legacyText: NodeChange = {
  type: 'TEXT',
  fontSize: 16,
  fontName: { family: 'Absent Sans', style: 'Regular' },
  lineHeight: { value: 100, units: 'PERCENT' },
  textAutoResize: 'WIDTH_AND_HEIGHT',
  size: { x: 179, y: 24 },
  textData: {
    characters: 'Customer information',
    layoutSize: { x: 179, y: 24 },
    baselines: [
      {
        firstCharacter: 0,
        endCharacter: 20,
        position: { x: 0, y: 17.6 },
        width: 178.13,
        lineY: 0,
        lineHeight: 24,
        lineAscent: 16
      }
    ],
    fontMetaData: [{ key: { family: 'Absent Sans', style: 'Regular' }, fontLineHeight: 1.5 }]
  }
}

test('reads the text layout older files keep in textData', () => {
  const props = nodeChangeToProps(legacyText, [])
  expect(props.lineHeight).toBe(24)
  expect(props.derivedLayout).toEqual({ width: 179, height: 24 })
})

test('prefers derivedTextData when a file has both', () => {
  const props = nodeChangeToProps(
    {
      ...legacyText,
      derivedTextData: {
        layoutSize: { x: 179, y: 30 },
        baselines: [
          {
            firstCharacter: 0,
            endCharacter: 20,
            position: { x: 0, y: 20 },
            width: 178.13,
            lineY: 0,
            lineHeight: 30,
            lineAscent: 18
          }
        ]
      }
    },
    []
  )
  expect(props.lineHeight).toBe(30)
  expect(props.derivedLayout).toEqual({ width: 179, height: 30 })
})
