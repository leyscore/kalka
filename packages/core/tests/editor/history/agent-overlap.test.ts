import { describe, expect, test } from 'bun:test'

import { expectDefined } from '#core-tests/helpers/assert'

import { createEditor } from '@kalka/core/editor'
import { addCommentThread, documentComments } from '@kalka/scene-graph'

/** An agent's edit recorded as the chat records it: what the page changed while the call ran. */
function setup() {
  const editor = createEditor()
  const pageId = editor.state.currentPageId
  const title = editor.graph.createNode('TEXT', pageId, { name: 'Title', text: 'Hello' })
  const card = editor.graph.createNode('FRAME', pageId, { name: 'Card', x: 0, width: 200 })
  const node = (id: string) => expectDefined(editor.graph.getNode(id), id)
  return { editor, pageId, title, card, node }
}

describe('an agent edit with the user editing meanwhile', () => {
  test('undoing the agent step keeps the edit the user made while the agent worked', () => {
    const { editor, pageId, title, card, node } = setup()
    const finish = editor.captureDocumentChange(pageId)
    editor.graph.updateNode(title.id, { text: 'Written by the agent' })
    // While the agent's call awaits, the user moves the card, an undo step of its own.
    editor.updateNodeWithUndo(card.id, { x: 300 }, 'Move')
    const change = finish()
    editor.pushUndoStep({
      label: 'Agent: set_text',
      forward: () => editor.restoreDocumentChange(change, 'after'),
      inverse: () => editor.restoreDocumentChange(change, 'before')
    })

    editor.undoAction()
    expect(node(title.id).text).toBe('Hello')
    expect(node(card.id).x).toBe(300)

    editor.undoAction()
    expect(node(card.id).x).toBe(0)

    editor.redoAction()
    editor.redoAction()
    expect(node(card.id).x).toBe(300)
    expect(node(title.id).text).toBe('Written by the agent')
  })

  test('undoing the agent step keeps a comment written while the agent worked', () => {
    const { editor, pageId, title, node } = setup()
    const finish = editor.captureDocumentChange(pageId)
    editor.graph.updateNode(title.id, { text: 'Written by the agent' })
    // Comments live outside the undo history, whoever writes them and whenever.
    addCommentThread(
      editor.graph,
      { pageId, nodeId: null, x: 10, y: 10 },
      { kind: 'person', name: 'Ada' },
      'Looks good'
    )
    const change = finish()
    editor.pushUndoStep({
      label: 'Agent: set_text',
      forward: () => editor.restoreDocumentChange(change, 'after'),
      inverse: () => editor.restoreDocumentChange(change, 'before')
    })

    editor.undoAction()
    expect(node(title.id).text).toBe('Hello')
    expect(documentComments(editor.graph)).toHaveLength(1)
  })

  test('undoing the agent step keeps text typed while the agent worked', () => {
    const { editor, pageId, title, card, node } = setup()
    const finish = editor.captureDocumentChange(pageId)
    editor.updateNodeWithUndo(card.id, { x: 0 }, 'noop')
    editor.graph.updateNode(card.id, { x: 120 })
    // Typing records its step only when the edit ends, after the agent's call.
    editor.state.editingTextId = title.id
    editor.updateTextEditNode(title.id, { text: 'Hello, world' })
    const change = finish()
    editor.pushUndoStep({
      label: 'Agent: move',
      forward: () => editor.restoreDocumentChange(change, 'after'),
      inverse: () => editor.restoreDocumentChange(change, 'before')
    })

    editor.undoAction()
    expect(node(card.id).x).toBe(0)
    expect(node(title.id).text).toBe('Hello, world')
  })
})
