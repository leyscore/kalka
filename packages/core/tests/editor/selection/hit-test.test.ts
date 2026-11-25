import { describe, expect, test } from 'bun:test'

import { createEditor } from '@kalka/core/editor'

describe('editor scoped hit testing', () => {
  test('uses world coordinates inside entered containers', () => {
    const editor = createEditor()
    const pageId = editor.state.currentPageId
    const frame = editor.graph.createNode('FRAME', pageId, {
      x: 100,
      y: 100,
      width: 200,
      height: 200
    })
    const child = editor.graph.createNode('RECTANGLE', frame.id, {
      x: 20,
      y: 20,
      width: 40,
      height: 40,
      fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0, a: 1 }, opacity: 1, visible: true }]
    })

    editor.state.enteredContainerId = frame.id
    editor.setCanvasKit(
      {} as Parameters<typeof editor.setCanvasKit>[0],
      {} as Parameters<typeof editor.setCanvasKit>[1]
    )

    expect(editor.hitTestAtPoint(130, 130)?.id).toBe(child.id)
  })

  // Figma desktop: a locked layer is not selectable on the canvas, only from the layers panel.
  test('passes clicks through locked layers, but a right-click keeps a locked selection', () => {
    const editor = createEditor()
    const pageId = editor.state.currentPageId
    const fills = [
      { type: 'SOLID' as const, color: { r: 1, g: 0, b: 0, a: 1 }, opacity: 1, visible: true }
    ]
    const below = editor.graph.createNode('RECTANGLE', pageId, { width: 100, height: 100, fills })
    const locked = editor.graph.createNode('RECTANGLE', pageId, {
      width: 100,
      height: 100,
      fills,
      locked: true
    })

    expect(editor.hitTestAtPoint(50, 50)?.id).toBe(below.id)
    expect(editor.hitTestAtPoint(50, 50, true)?.id).toBe(below.id)
    editor.selectAtPoint(50, 50)
    expect(editor.state.selectedIds).toEqual(new Set([below.id]))

    editor.select([locked.id])
    editor.selectAtPoint(50, 50)
    expect(editor.state.selectedIds).toEqual(new Set([locked.id]))
  })
})
