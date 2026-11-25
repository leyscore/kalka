import { describe, expect, test } from 'bun:test'

import { createEditor } from '@kalka/core/editor'

describe('reorderChildWithUndo', () => {
  // Figma: a layer dragged out of a frame in the layers panel stays where it was on the canvas.
  test('keeps a layer in place on the canvas when it changes parent', () => {
    const editor = createEditor()
    const page = editor.state.currentPageId
    const outer = editor.graph.createNode('FRAME', page, {
      x: 100,
      y: 100,
      width: 400,
      height: 400
    })
    const inner = editor.graph.createNode('FRAME', outer.id, {
      x: 50,
      y: 60,
      width: 200,
      height: 200
    })
    const rect = editor.graph.createNode('RECTANGLE', inner.id, { x: 40, y: 30 })
    const sibling = editor.graph.createNode('RECTANGLE', page, { x: 900 })

    editor.reorderChildWithUndo(rect.id, page, 0)
    expect(editor.graph.getNode(rect.id)?.parentId).toBe(page)
    expect(editor.graph.getAbsolutePosition(rect.id)).toEqual({ x: 190, y: 190 })
    expect(editor.graph.getChildren(page).map((node) => node.id)).toEqual([
      rect.id,
      outer.id,
      sibling.id
    ])

    editor.undoAction()
    expect(editor.graph.getNode(rect.id)?.parentId).toBe(inner.id)
    expect(editor.graph.getNode(rect.id)).toMatchObject({ x: 40, y: 30 })

    editor.redoAction()
    expect(editor.graph.getAbsolutePosition(rect.id)).toEqual({ x: 190, y: 190 })

    editor.reorderChildWithUndo(rect.id, inner.id, 0)
    expect(editor.graph.getNode(rect.id)).toMatchObject({ parentId: inner.id, x: 40, y: 30 })
  })
})
