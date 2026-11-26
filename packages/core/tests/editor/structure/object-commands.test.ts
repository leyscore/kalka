import { describe, expect, test } from 'bun:test'

import { createEditor } from '@kalka/core/editor'
import type { Fill } from '@kalka/scene-graph'

const RED: Fill = {
  type: 'SOLID',
  color: { r: 1, g: 0, b: 0, a: 1 },
  opacity: 1,
  visible: true
}

function setup() {
  const editor = createEditor()
  const pageId = editor.state.currentPageId
  return { editor, pageId }
}

describe('Remove frame', () => {
  test('puts the frame’s layers where they were and deletes it, undoably', () => {
    const { editor, pageId } = setup()
    const frame = editor.graph.createNode('FRAME', pageId, {
      x: 100,
      y: 50,
      width: 200,
      height: 200
    })
    const child = editor.graph.createNode('RECTANGLE', frame.id, {
      x: 10,
      y: 20,
      width: 30,
      height: 30
    })
    editor.select([frame.id])

    expect(editor.canRemoveFrame()).toBe(true)
    expect(editor.removeFrameSelected()).toBe(true)
    expect(editor.graph.getNode(frame.id)).toBeUndefined()
    expect(editor.graph.getNode(child.id)?.parentId).toBe(pageId)
    expect(editor.graph.getAbsolutePosition(child.id)).toEqual({ x: 110, y: 70 })
    expect([...editor.state.selectedIds]).toEqual([child.id])

    editor.undoAction()
    expect(editor.graph.getNode(frame.id)?.childIds).toEqual([child.id])
    expect([...editor.state.selectedIds]).toEqual([frame.id])
  })
})

describe('Resize to fit', () => {
  test('fits a frame to its layers, which stay put', () => {
    const { editor, pageId } = setup()
    const frame = editor.graph.createNode('FRAME', pageId, { x: 0, y: 0, width: 500, height: 500 })
    const child = editor.graph.createNode('RECTANGLE', frame.id, {
      x: 40,
      y: 60,
      width: 100,
      height: 50
    })
    editor.select([frame.id])

    expect(editor.resizeToFitSelected()).toBe(true)
    const fitted = editor.graph.getNode(frame.id)
    expect(fitted).toMatchObject({ x: 40, y: 60, width: 100, height: 50 })
    expect(editor.graph.getAbsolutePosition(child.id)).toEqual({ x: 40, y: 60 })

    editor.undoAction()
    expect(editor.graph.getNode(frame.id)).toMatchObject({ x: 0, y: 0, width: 500, height: 500 })
  })

  test('makes an auto layout frame hug its layers', () => {
    const { editor, pageId } = setup()
    const frame = editor.graph.createNode('FRAME', pageId, {
      layoutMode: 'VERTICAL',
      primaryAxisSizing: 'FIXED',
      counterAxisSizing: 'FIXED'
    })
    editor.graph.createNode('RECTANGLE', frame.id, {})
    editor.select([frame.id])
    editor.resizeToFitSelected()
    expect(editor.graph.getNode(frame.id)).toMatchObject({
      primaryAxisSizing: 'HUG',
      counterAxisSizing: 'HUG'
    })
  })
})

describe('Swap fill and stroke', () => {
  test('turns fills into strokes of the layer’s weight and strokes into fills', () => {
    const { editor, pageId } = setup()
    const node = editor.graph.createNode('RECTANGLE', pageId, {
      fills: [RED],
      strokes: [],
      fillStyleId: 'style:red',
      boundVariables: { 'fills/0/color': 'var:red' }
    })
    editor.select([node.id])

    expect(editor.swapFillAndStrokeSelected()).toBe(true)
    const swapped = editor.graph.getNode(node.id)
    expect(swapped?.fills).toEqual([])
    expect(swapped?.strokes).toHaveLength(1)
    expect(swapped?.strokes[0]).toMatchObject({ color: RED.color, align: 'INSIDE' })
    expect(swapped?.strokeStyleId).toBe('style:red')
    expect(swapped?.fillStyleId).toBeNull()
    expect(swapped?.boundVariables).toEqual({ 'strokes/0/color': 'var:red' })

    editor.swapFillAndStrokeSelected()
    const back = editor.graph.getNode(node.id)
    expect(back?.fills).toEqual([RED])
    expect(back?.strokes).toEqual([])
  })
})

describe('Remove fill and Remove stroke', () => {
  test('clear the paints with their style and variables in one undo step', () => {
    const { editor, pageId } = setup()
    const node = editor.graph.createNode('RECTANGLE', pageId, {
      fills: [RED],
      fillStyleId: 'style:red',
      boundVariables: { 'fills/0/color': 'var:red', opacity: 'var:o' }
    })
    editor.select([node.id])

    expect(editor.removeFillSelected()).toBe(true)
    expect(editor.graph.getNode(node.id)).toMatchObject({
      fills: [],
      fillStyleId: null,
      boundVariables: { opacity: 'var:o' }
    })
    expect(editor.removeStrokeSelected()).toBe(false)

    editor.undoAction()
    expect(editor.graph.getNode(node.id)?.fills).toEqual([RED])
  })
})

describe('Hide other layers', () => {
  test('hides every layer but the selection and what holds it', () => {
    const { editor, pageId } = setup()
    const frame = editor.graph.createNode('FRAME', pageId, {})
    const kept = editor.graph.createNode('RECTANGLE', frame.id, {})
    const sibling = editor.graph.createNode('RECTANGLE', frame.id, {})
    const other = editor.graph.createNode('RECTANGLE', pageId, {})
    editor.select([kept.id])

    expect(editor.hideOtherLayers()).toBe(true)
    expect(editor.graph.getNode(frame.id)?.visible).toBe(true)
    expect(editor.graph.getNode(kept.id)?.visible).toBe(true)
    expect(editor.graph.getNode(sibling.id)?.visible).toBe(false)
    expect(editor.graph.getNode(other.id)?.visible).toBe(false)

    editor.undoAction()
    expect(editor.graph.getNode(other.id)?.visible).toBe(true)
  })
})
