import { describe, expect, it } from 'bun:test'

import {
  SceneGraph,
  blockEndParagraphs,
  listSpacedParagraphs,
  paragraphsInRange,
  textBlocks,
  textListItems,
  textListLines,
  withListType,
  type TextListLine
} from '@kalka/scene-graph'
import { writeLayerStyle } from '@kalka/scene-graph/css-model'

function textLayer(fields: Parameters<SceneGraph['createNode']>[2]) {
  const graph = new SceneGraph()
  const page = graph.getPages()[0]
  const node = graph.createNode('TEXT', page.id, { fontSize: 20, ...fields })
  return { graph, node }
}

const bullet = (level = 0): TextListLine => ({ type: 'UNORDERED', level })
const number = (level = 0): TextListLine => ({ type: 'ORDERED', level })
const plain: TextListLine = { type: 'NONE', level: 0 }

describe('spacing set as a percentage of the font size', () => {
  it('follows the font size, as Figma keeps 150% at 150%', () => {
    const { graph, node } = textLayer({
      lineHeight: 30,
      lineHeightUnit: 'PERCENT',
      letterSpacing: 1,
      letterSpacingUnit: 'PERCENT'
    })
    graph.updateNode(node.id, { fontSize: 40 })
    expect(node.lineHeight).toBe(60)
    expect(node.letterSpacing).toBe(2)
  })

  it('leaves spacing in pixels where it is', () => {
    const { graph, node } = textLayer({ lineHeight: 30, letterSpacing: 1 })
    graph.updateNode(node.id, { fontSize: 40 })
    expect(node.lineHeight).toBe(30)
    expect(node.letterSpacing).toBe(1)
  })

  it('keeps a line height set with the font size', () => {
    const { graph, node } = textLayer({ lineHeight: 30, lineHeightUnit: 'PERCENT' })
    graph.updateNode(node.id, { fontSize: 40, lineHeight: 44 })
    expect(node.lineHeight).toBe(44)
  })

  it('writes CSS that follows the size: a unitless line height and em', () => {
    const { node } = textLayer({
      lineHeight: 30,
      lineHeightUnit: 'PERCENT',
      letterSpacing: -0.4,
      letterSpacingUnit: 'PERCENT'
    })
    const style = writeLayerStyle(node, { parent: undefined, css: (_field, literal) => literal })
    expect(style['line-height']).toBe('1.5')
    expect(style['letter-spacing']).toBe('-0.02em')
  })
})

describe('list paragraphs', () => {
  it('fits the lines to the text', () => {
    expect(textListLines({ text: 'a\nb\nc', listLines: [bullet()] })).toEqual([
      bullet(),
      plain,
      plain
    ])
    expect(textListLines({ text: 'a', listLines: [bullet(), number()] })).toEqual([bullet()])
  })

  it('finds the paragraphs a range touches', () => {
    expect(paragraphsInRange('ab\ncd\nef', 1, 4)).toEqual([0, 1])
    expect(paragraphsInRange('ab\ncd\nef', 6, 6)).toEqual([2])
  })

  it('toggles a list type as the list buttons do', () => {
    const node = { text: 'a\nb', listLines: [] }
    const listed = withListType(node, [0, 1], 'UNORDERED')
    expect(listed).toEqual([bullet(), bullet()])
    expect(withListType({ ...node, listLines: listed }, [0, 1], 'UNORDERED')).toEqual([])
    expect(withListType({ ...node, listLines: listed }, [1], 'ORDERED')).toEqual([
      bullet(),
      number()
    ])
  })

  it('groups items into lists, a deeper item in the list of the one before', () => {
    const blocks = textBlocks([plain, number(), number(1), number(), plain, bullet()])
    expect(blocks).toEqual([
      { kind: 'paragraph', paragraph: 0 },
      {
        kind: 'list',
        type: 'ORDERED',
        level: 0,
        items: [
          {
            paragraph: 1,
            lists: [
              { kind: 'list', type: 'ORDERED', level: 1, items: [{ paragraph: 2, lists: [] }] }
            ]
          },
          { paragraph: 3, lists: [] }
        ]
      },
      { kind: 'paragraph', paragraph: 4 },
      { kind: 'list', type: 'UNORDERED', level: 0, items: [{ paragraph: 5, lists: [] }] }
    ])
  })

  it('numbers items within their own list', () => {
    const items = textListItems([number(), number(1), number(1), number(), plain, number()])
    expect(items.map((item) => item?.ordinal ?? null)).toEqual([1, 1, 2, 2, null, 1])
  })

  it('nests an item at most one level below the one before', () => {
    expect(textListItems([bullet(2)])).toEqual([{ type: 'UNORDERED', level: 0, ordinal: 1 }])
  })

  it('spaces list items apart within a list and paragraphs between blocks', () => {
    const lines = [plain, number(), number(1), number(), plain, bullet(), bullet()]
    expect([...listSpacedParagraphs(lines)]).toEqual([1, 2, 5])
    expect([...blockEndParagraphs(lines)]).toEqual([0, 3, 4])
  })
})
