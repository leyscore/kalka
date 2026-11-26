import { describe, expect, test } from 'bun:test'

import { createEditor } from '@kalka/core/editor'

function frameWithText() {
  const editor = createEditor()
  const pageId = editor.state.currentPageId
  const frame = editor.graph.createNode('FRAME', pageId, {
    x: 100,
    y: 100,
    width: 200,
    height: 100,
    cornerRadius: 8
  })
  const text = editor.graph.createNode('TEXT', frame.id, {
    x: 20,
    y: 10,
    width: 80,
    height: 20,
    fontSize: 16,
    text: 'Hi'
  })
  editor.select([frame.id])
  return { editor, frame, text }
}

describe('the Scale tool', () => {
  test('scales a layer and its contents about the anchor, one undo step', () => {
    const { editor, frame, text } = frameWithText()
    // The anchor is the frame's bottom-right corner, as when its top-left handle is dragged.
    const session = editor.beginScale(editor.state.selectedIds, { x: 300, y: 200 })
    session?.update(1.5)
    session?.update(2)
    session?.commit()

    expect(editor.graph.getNode(frame.id)).toMatchObject({
      x: -100,
      y: 0,
      width: 400,
      height: 200,
      cornerRadius: 16
    })
    expect(editor.graph.getNode(text.id)).toMatchObject({ x: 40, y: 20, fontSize: 32 })

    editor.undo.undo()
    expect(editor.graph.getNode(frame.id)).toMatchObject({ x: 100, width: 200, cornerRadius: 8 })
    expect(editor.graph.getNode(text.id)?.fontSize).toBe(16)
    editor.undo.redo()
    expect(editor.graph.getNode(text.id)?.fontSize).toBe(32)
    editor.dispose()
  })

  test('a cancelled drag puts everything back without an undo step', () => {
    const { editor, frame, text } = frameWithText()
    const session = editor.beginScale(editor.state.selectedIds, { x: 100, y: 100 })
    session?.update(3)
    session?.cancel()
    expect(editor.graph.getNode(frame.id)).toMatchObject({ x: 100, y: 100, width: 200 })
    expect(editor.graph.getNode(text.id)?.fontSize).toBe(16)
    expect(editor.undo.canUndo).toBe(false)
    editor.dispose()
  })
})
