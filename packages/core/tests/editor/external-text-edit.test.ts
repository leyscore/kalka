import { describe, expect, test } from 'bun:test'

import { createEditor, type ExternalTextEditor } from '@kalka/core/editor'

function recorder(): ExternalTextEditor & { calls: string[] } {
  const calls: string[] = []
  return {
    calls,
    start: (id) => calls.push(`start:${id}`),
    stop: () => calls.push('stop'),
    selectAll: () => calls.push('selectAll'),
    selectWordAt: () => calls.push('selectWordAt'),
    setCursorAt: () => calls.push('setCursorAt')
  }
}

describe('external text editing', () => {
  test('an installed editor edits in place and the commit records one undo step', () => {
    const editor = createEditor()
    const text = editor.graph.createNode('TEXT', editor.state.currentPageId, { text: 'Bonjour' })
    const external = recorder()
    editor.setExternalTextEditor(external)
    expect(editor.textCaret).toBe(external)

    editor.startTextEditing(text.id)
    expect(external.calls).toEqual([`start:${text.id}`])
    expect(editor.state.editingTextId).toBe(text.id)

    // The external editor keeps the graph in step while typing.
    editor.updateTextEditNode(text.id, {
      text: 'Bonjour Kalka',
      styleRuns: [{ start: 8, length: 5, style: { fontWeight: 700 } }]
    })
    editor.commitTextEdit()
    expect(external.calls.at(-1)).toBe('stop')
    expect(editor.state.editingTextId).toBeNull()
    expect(editor.undo.undoLabel).toBe('Edit text')
    expect(editor.undo.peekUndo(1)).toBeUndefined()

    editor.undoAction()
    expect(editor.graph.getNode(text.id)?.text).toBe('Bonjour')
    expect(editor.graph.getNode(text.id)?.styleRuns).toEqual([])
    editor.redoAction()
    expect(editor.graph.getNode(text.id)?.text).toBe('Bonjour Kalka')
  })

  test('an edit that changed nothing records nothing', () => {
    const editor = createEditor()
    const text = editor.graph.createNode('TEXT', editor.state.currentPageId, { text: 'Bonjour' })
    editor.setExternalTextEditor(recorder())
    editor.startTextEditing(text.id)
    editor.commitTextEdit()
    expect(editor.undo.canUndo).toBe(false)
  })

  test('typing into a text layer just created joins its creation, so one undo removes it', () => {
    const editor = createEditor()
    editor.setExternalTextEditor(recorder())
    const id = editor.createShape('TEXT', 10, 10, 100, 20)
    const pageChildren = () => editor.graph.getNode(editor.state.currentPageId)?.childIds.length
    expect(pageChildren()).toBe(1)

    editor.startTextEditing(id)
    editor.updateTextEditNode(id, { text: 'Hello', styleRuns: [] })
    editor.commitTextEdit()

    editor.undoAction()
    expect(pageChildren()).toBe(0)
    editor.redoAction()
    expect(editor.graph.getNode(id)?.text).toBe('Hello')
  })

  test('a text layer just created and left empty goes when the edit ends, leaving no history', () => {
    const editor = createEditor()
    editor.setExternalTextEditor(recorder())
    const before = editor.createShape('RECTANGLE', 0, 0, 10, 10)
    const id = editor.createShape('TEXT', 10, 10, 100, 20)

    editor.startTextEditing(id)
    editor.commitTextEdit()

    expect(editor.graph.getNode(id)).toBeUndefined()
    expect(editor.undo.undoLabel).toBe('Create rectangle')
    expect(editor.undo.canRedo).toBe(false)
    expect(editor.graph.getNode(before)).toBeDefined()
  })

  test('a text emptied by its edit is deleted, and one undo brings it back with its text', () => {
    const editor = createEditor()
    const text = editor.graph.createNode('TEXT', editor.state.currentPageId, { text: 'Bonjour' })
    editor.setExternalTextEditor(recorder())

    editor.startTextEditing(text.id)
    editor.updateTextEditNode(text.id, { text: '', styleRuns: [] })
    editor.commitTextEdit()
    expect(editor.graph.getNode(text.id)).toBeUndefined()

    editor.undoAction()
    expect(editor.graph.getNode(text.id)?.text).toBe('Bonjour')
    expect(editor.undo.canUndo).toBe(false)
  })

  test('picking another tool ends the edit; the select and hand tools keep it', () => {
    const editor = createEditor()
    const text = editor.graph.createNode('TEXT', editor.state.currentPageId, { text: 'Bonjour' })
    editor.setExternalTextEditor(recorder())
    editor.startTextEditing(text.id)

    editor.setTool('HAND')
    editor.setTool('SELECT')
    expect(editor.state.editingTextId).toBe(text.id)
    editor.setTool('RECTANGLE')
    expect(editor.state.editingTextId).toBeNull()
  })
})
