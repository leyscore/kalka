import { describe, expect, test } from 'bun:test'

import { getNodeOrThrow } from '#core-tests/helpers/assert'

import { createEditor } from '@kalka/core/editor'
import type { Rect } from '@kalka/scene-graph/primitives'

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

describe('reading the layout of the layers it wraps, as Figma does', () => {
  function wrap(boxes: Rect[]) {
    const editor = createEditor()
    const page = editor.state.currentPageId
    const ids = boxes.map(
      (box, i) => editor.graph.createNode('RECTANGLE', page, { name: `L${i}`, ...box }).id
    )
    editor.select(ids)
    const frameId = editor.wrapInAutoLayout()
    if (!frameId) throw new Error('No frame')
    return { frame: getNodeOrThrow(editor.graph, frameId), ids }
  }

  test('makes a row with the average gap and keeps the order along the row', () => {
    const { frame, ids } = wrap([
      { x: 236, y: 2, width: 92, height: 53 },
      { x: 0, y: 0, width: 92, height: 53 },
      { x: 118, y: 4, width: 92, height: 53 }
    ])
    expect(frame.layoutMode).toBe('HORIZONTAL')
    expect(frame.itemSpacing).toBe(26)
    expect(frame.childIds).toEqual([ids[1], ids[2], ids[0]])
  })

  test('keeps tall layers side by side a row', () => {
    const { frame } = wrap([
      { x: 0, y: 0, width: 50, height: 200 },
      { x: 60, y: 0, width: 50, height: 200 },
      { x: 120, y: 0, width: 50, height: 200 }
    ])
    expect(frame.layoutMode).toBe('HORIZONTAL')
    expect(frame.itemSpacing).toBe(10)
  })

  test('makes a column from stacked layers and keeps their shared centre', () => {
    const { frame, ids } = wrap([
      { x: 10, y: 80, width: 80, height: 20 },
      { x: 0, y: 0, width: 100, height: 40 },
      { x: 30, y: 56, width: 40, height: 16 }
    ])
    expect(frame.layoutMode).toBe('VERTICAL')
    expect(frame.itemSpacing).toBe(12)
    expect(frame.counterAxisAlign).toBe('CENTER')
    expect(frame.childIds).toEqual([ids[1], ids[2], ids[0]])
  })

  test('never guesses a negative gap for overlapping layers', () => {
    const { frame } = wrap([
      { x: 0, y: 0, width: 100, height: 40 },
      { x: 60, y: 0, width: 100, height: 40 }
    ])
    expect(frame.itemSpacing).toBe(0)
  })
})
