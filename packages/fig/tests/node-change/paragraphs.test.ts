import { expect, test } from 'bun:test'

import { nodeChangeToProps, sceneNodeToKiwi } from '#fig/node-change/index'

import type { NodeChange } from '@kalka/kiwi/fig/codec'
import { SceneGraph } from '@kalka/scene-graph'

const text: NodeChange = {
  type: 'TEXT',
  fontSize: 20,
  fontName: { family: 'Absent Sans', style: 'Regular' },
  textData: { characters: 'Intro\nFirst\nNested\nOutro' }
}

test('a line height typed in percent stays a percentage of the font size', () => {
  const props = nodeChangeToProps({ ...text, lineHeight: { value: 1.5, units: 'RAW' } }, [])
  expect(props.lineHeight).toBe(30)
  expect(props.lineHeightUnit).toBe('PERCENT')
  // Figma's Auto is 100% of the font's own height, not of its size.
  const auto = nodeChangeToProps({ ...text, lineHeight: { value: 100, units: 'PERCENT' } }, [])
  expect(auto.lineHeightUnit).toBe('PIXELS')
})

test('letter spacing in percent keeps its unit', () => {
  const props = nodeChangeToProps({ ...text, letterSpacing: { value: -2, units: 'PERCENT' } }, [])
  expect(props.letterSpacing).toBeCloseTo(-0.4)
  expect(props.letterSpacingUnit).toBe('PERCENT')
})

test('paragraph spacing, indent and lists come through', () => {
  const props = nodeChangeToProps(
    {
      ...text,
      paragraphSpacing: 12,
      paragraphIndent: 8,
      listSpacing: 6,
      textData: {
        characters: 'Intro\nFirst\nNested\nOutro',
        lines: [
          { lineType: 'PLAIN', indentationLevel: 0 },
          { lineType: 'ORDERED_LIST', indentationLevel: 1 },
          { lineType: 'UNORDERED_LIST', indentationLevel: 2 },
          { lineType: 'PLAIN', indentationLevel: 0 }
        ]
      }
    },
    []
  )
  expect(props.paragraphSpacing).toBe(12)
  expect(props.paragraphIndent).toBe(8)
  expect(props.listSpacing).toBe(6)
  expect(props.listLines).toEqual([
    { type: 'NONE', level: 0 },
    { type: 'ORDERED', level: 0 },
    { type: 'UNORDERED', level: 1 },
    { type: 'NONE', level: 0 }
  ])
})

test('export writes them back as Figma saves them', () => {
  const graph = new SceneGraph()
  const page = graph.getPages()[0]
  const node = graph.createNode('TEXT', page.id, {
    text: 'Intro\nFirst',
    fontSize: 20,
    lineHeight: 30,
    lineHeightUnit: 'PERCENT',
    letterSpacing: -0.4,
    letterSpacingUnit: 'PERCENT',
    paragraphSpacing: 12,
    listSpacing: 6,
    listLines: [
      { type: 'NONE', level: 0 },
      { type: 'UNORDERED', level: 0 }
    ]
  })
  const [change] = sceneNodeToKiwi(node, { sessionID: 1, localID: 1 }, 0, { value: 2 }, graph, [])
  expect(change?.lineHeight).toEqual({ value: 1.5, units: 'RAW' })
  expect(change?.letterSpacing).toEqual({ value: -2, units: 'PERCENT' })
  expect(change?.paragraphSpacing).toBe(12)
  expect(change?.listSpacing).toBe(6)
  expect(change?.textData?.lines).toEqual([
    { lineType: 'PLAIN' },
    { lineType: 'UNORDERED_LIST', indentationLevel: 1 }
  ])
})
