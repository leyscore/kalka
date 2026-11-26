import { describe, expect, test } from 'bun:test'

import { createEditor } from '@kalka/core/editor'
import type { Fill } from '@kalka/scene-graph'

const BLUE: Fill = { type: 'SOLID', color: { r: 0, g: 0, b: 1, a: 1 }, opacity: 1, visible: true }

describe('Set default properties', () => {
  test('gives new shapes the selected shape’s paints, and leaves texts and frames alone', () => {
    const editor = createEditor()
    const pageId = editor.state.currentPageId
    const source = editor.graph.createNode('RECTANGLE', pageId, { fills: [BLUE], opacity: 0.5 })
    editor.select([source.id])

    expect(editor.setDefaultPropertiesFromSelection()).toBe(true)
    const ellipse = editor.graph.getNode(editor.createShape('ELLIPSE', 0, 0, 10, 10))
    expect(ellipse?.fills).toEqual([BLUE])
    expect(ellipse?.opacity).toBe(0.5)
    expect(editor.graph.getNode(editor.createShape('TEXT', 0, 0, 10, 10))?.opacity).toBe(1)
    expect(editor.graph.getNode(editor.createShape('FRAME', 0, 0, 10, 10))?.fills).not.toEqual([
      BLUE
    ])
  })

  test('takes type settings from a text for new texts', () => {
    const editor = createEditor()
    const pageId = editor.state.currentPageId
    const source = editor.graph.createNode('TEXT', pageId, { fontSize: 32, fontWeight: 700 })
    editor.select([source.id])
    editor.setDefaultPropertiesFromSelection()
    const text = editor.graph.getNode(editor.createShape('TEXT', 0, 0, 10, 10))
    expect(text).toMatchObject({ fontSize: 32, fontWeight: 700 })
  })

  test('needs a single shape or text', () => {
    const editor = createEditor()
    const frame = editor.graph.createNode('FRAME', editor.state.currentPageId, {})
    editor.select([frame.id])
    expect(editor.setDefaultPropertiesFromSelection()).toBe(false)
  })
})
