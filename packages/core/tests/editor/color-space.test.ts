import { describe, expect, test } from 'bun:test'

import { createEditor } from '@kalka/core/editor'

describe('document color space', () => {
  test('converting to another color space is one undo step that restores colors and space', () => {
    const editor = createEditor()
    const id = editor.createShape('RECTANGLE', 0, 0, 100, 100)
    editor.graph.updateNode(id, {
      fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0, a: 1 }, opacity: 1, visible: true }]
    })
    const before = structuredClone(editor.graph.getNode(id)?.fills)
    const space = editor.graph.documentColorSpace
    const target = space === 'display-p3' ? 'srgb' : 'display-p3'

    editor.setDocumentColorSpace(target, 'convert')
    expect(editor.graph.documentColorSpace).toBe(target)

    editor.undoAction()
    expect(editor.graph.documentColorSpace).toBe(space)
    expect(editor.graph.getNode(id)?.fills).toEqual(before)

    editor.redoAction()
    expect(editor.graph.documentColorSpace).toBe(target)
  })

  test('assigning a color space can be undone', () => {
    const editor = createEditor()
    const space = editor.graph.documentColorSpace
    const target = space === 'display-p3' ? 'srgb' : 'display-p3'
    editor.setDocumentColorSpace(target)
    editor.undoAction()
    expect(editor.graph.documentColorSpace).toBe(space)
  })
})
