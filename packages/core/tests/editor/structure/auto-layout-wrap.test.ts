import { describe, expect, test } from 'bun:test'

import { getNodeOrThrow } from '#core-tests/helpers/assert'

import { createEditor } from '@kalka/core/editor'

/** Four layers stacked A (bottom) to D (top), laid out right to left. */
function setup() {
  const editor = createEditor()
  const page = editor.state.currentPageId
  const ids = ['A', 'B', 'C', 'D'].map(
    (name, i) =>
      editor.graph.createNode('RECTANGLE', page, { name, x: (3 - i) * 50, width: 40, height: 40 })
        .id
  )
  return { editor, page, ids }
}

describe('wrapping layers in auto layout', () => {
  test('puts the frame where the topmost wrapped layer was in the stack, as Figma does', () => {
    const { editor, page, ids } = setup()
    editor.select([ids[1], ids[2]])
    const frame = editor.wrapInAutoLayout()
    if (!frame) throw new Error('No frame')
    expect(getNodeOrThrow(editor.graph, page).childIds).toEqual([ids[0], frame, ids[3]])
  })

  test('undo puts the layers back in their stacking order', () => {
    for (const picked of [
      [1, 3],
      [3, 1],
      [0, 2]
    ]) {
      const { editor, page, ids } = setup()
      editor.select(picked.map((index) => ids[index]))
      editor.wrapInAutoLayout()
      editor.undoAction()
      expect(getNodeOrThrow(editor.graph, page).childIds).toEqual(ids)
    }
  })

  test('redo lays the layers out in the frame in the same order as the first time', () => {
    const { editor, ids } = setup()
    editor.select([ids[0], ids[3]])
    const frame = editor.wrapInAutoLayout()
    if (!frame) throw new Error('No frame')
    const order = [...getNodeOrThrow(editor.graph, frame).childIds]
    editor.undoAction()
    editor.redoAction()
    expect(getNodeOrThrow(editor.graph, frame).childIds).toEqual(order)
  })
})
