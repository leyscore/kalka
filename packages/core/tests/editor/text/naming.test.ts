import { describe, expect, test } from 'bun:test'

import { createEditor, type ExternalTextEditor } from '@kalka/core/editor'

const external: ExternalTextEditor = {
  start: () => undefined,
  stop: () => undefined,
  selectAll: () => undefined,
  selectWordAt: () => undefined,
  setCursorAt: () => undefined
}

function edit(name: string, text: string, next: string, autoRename = true) {
  const editor = createEditor()
  editor.setExternalTextEditor(external)
  const node = editor.graph.createNode('TEXT', editor.state.currentPageId, {
    name,
    text,
    autoRename
  })
  editor.startTextEditing(node.id)
  editor.updateTextEditNode(node.id, { text: next, styleRuns: [] })
  editor.commitTextEdit()
  const nameOf = () => editor.graph.getNode(node.id)?.name
  return { editor, nameOf }
}

describe('text layers named after their text', () => {
  test('a layer still named after its text follows it, in the same undo step', () => {
    const { editor, nameOf } = edit('Type something', 'Type something', 'Along the curve\nmore')
    expect(nameOf()).toBe('Along the curve')
    editor.undoAction()
    expect(nameOf()).toBe('Type something')
    editor.redoAction()
    expect(nameOf()).toBe('Along the curve')
  })

  test('a layer renamed by hand keeps its name', () => {
    expect(edit('Title', 'Bonjour', 'Salut').nameOf()).toBe('Title')
    expect(edit('Bonjour', 'Bonjour', 'Salut', false).nameOf()).toBe('Bonjour')
  })

  test('the name is the first line, spaces collapsed, and an empty first line keeps the name', () => {
    expect(edit('Bonjour', 'Bonjour', '  Salut   à tous  \nsecond').nameOf()).toBe('Salut à tous')
    expect(edit('Bonjour', 'Bonjour', '\nSalut').nameOf()).toBe('Bonjour')
  })

  test('a long text named after its first line follows an edit, as an imported heading', () => {
    const heading = 'Des sites qui se construisent seuls, page après page'
    expect(edit(heading, heading, 'Votre site en une heure').nameOf()).toBe(
      'Votre site en une heure'
    )
  })
})
