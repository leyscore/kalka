import { describe, expect, test } from 'bun:test'

import { createEditor, type ExternalTextEditor } from '@open-pencil/core/editor'

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
})
