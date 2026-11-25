import { describe, expect, test } from 'bun:test'

import { createEditor } from '@kalka/core/editor'

// Figma: undo and redo select the layers the step was made on.
describe('selection through undo and redo', () => {
  test('selects the layer each step changed', () => {
    const editor = createEditor()
    const page = editor.state.currentPageId
    const first = editor.graph.createNode('RECTANGLE', page, { name: 'First' })
    const second = editor.graph.createNode('RECTANGLE', page, { name: 'Second', x: 200 })

    editor.select([second.id])
    editor.updateNodeWithUndo(second.id, { x: 80 }, 'Move')
    editor.select([first.id])
    editor.renameNode(first.id, 'Button')
    editor.deleteSelected()
    expect(editor.graph.getNode(first.id)).toBeUndefined()

    editor.undoAction()
    expect(editor.graph.getNode(first.id)).toBeDefined()
    expect(editor.state.selectedIds).toEqual(new Set([first.id]))
    editor.undoAction()
    expect(editor.graph.getNode(first.id)?.name).toBe('First')
    expect(editor.state.selectedIds).toEqual(new Set([first.id]))
    editor.undoAction()
    expect(editor.graph.getNode(second.id)?.x).toBe(200)
    expect(editor.state.selectedIds).toEqual(new Set([second.id]))

    editor.select([first.id])
    editor.redoAction()
    expect(editor.graph.getNode(second.id)?.x).toBe(80)
    expect(editor.state.selectedIds).toEqual(new Set([second.id]))
  })
})
