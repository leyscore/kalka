import { expect, test } from 'bun:test'

import { nodeChangeToProps } from '#fig/node-change/index'

import type { FigTextLayout, NodeChange } from '@kalka/kiwi/fig/codec'

/** Lines as Figma saves them: each reports its height, and sits `step` below the one before. */
function lines(count: number, lineHeight: number, step: number): FigTextLayout {
  return {
    layoutSize: { x: 337, y: step * count },
    baselines: Array.from({ length: count }, (_, index) => ({
      firstCharacter: index,
      endCharacter: index + 1,
      position: { x: 0, y: index * step + 12 },
      width: 300,
      lineY: index * step,
      lineHeight,
      lineAscent: 12
    }))
  }
}

// A 12.5px face whose own line is 1.3 em: Figma's Auto line height is 16.25px, and it sets the
// lines 16px apart.
const autoText: NodeChange = {
  type: 'TEXT',
  fontSize: 12.5,
  fontName: { family: 'Absent Sans', style: 'Regular' },
  lineHeight: { value: 100, units: 'PERCENT' },
  textAutoResize: 'HEIGHT',
  textData: { characters: 'Use more than one\nbutton' },
  derivedTextData: lines(2, 16.25, 16)
}

test('a line height relative to the font is the whole pixels Figma sets lines apart', () => {
  expect(nodeChangeToProps(autoText, []).lineHeight).toBe(16)
  expect(
    nodeChangeToProps(
      { ...autoText, lineHeight: undefined, derivedTextData: lines(1, 14.3, 14) },
      []
    ).lineHeight
  ).toBe(14)
})

test('a line height in pixels stays as the text sets it', () => {
  const props = nodeChangeToProps(
    {
      ...autoText,
      lineHeight: { value: 16.25, units: 'PIXELS' },
      derivedTextData: lines(2, 16.25, 16.25)
    },
    []
  )
  expect(props.lineHeight).toBe(16.25)
})
