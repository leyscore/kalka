import { afterEach, describe, expect, test } from 'bun:test'

import { createEditor, type Editor } from '@kalka/core/editor'

import {
  autoLayoutDragValue,
  cancelAutoLayoutValueDrag,
  commitAutoLayoutValueDrag,
  handleAutoLayoutValueMove,
  tryStartAutoLayoutValueDrag
} from '#vue/shared/input/spacing-drag'

let editor: Editor | null = null

afterEach(() => {
  editor?.dispose()
  editor = null
})

/** A selected column at (100, 100): 20 padding, two 120 x 40 layers 8 apart. */
function setup() {
  const ed = createEditor()
  editor = ed
  const frame = ed.graph.createNode('FRAME', ed.state.currentPageId, {
    x: 100,
    y: 100,
    width: 160,
    height: 128,
    layoutMode: 'VERTICAL',
    itemSpacing: 8,
    paddingTop: 20,
    paddingRight: 20,
    paddingBottom: 20,
    paddingLeft: 20
  })
  for (const y of [20, 68])
    ed.graph.createNode('RECTANGLE', frame.id, { x: 20, y, width: 120, height: 40 })
  ed.select([frame.id])
  return { ed, frame }
}

describe('dragging auto layout values on the canvas', () => {
  test('a gap follows the pointer along the flow, never below zero', () => {
    expect(autoLayoutDragValue({ start: 50, startValue: 8, direction: 1 }, 62.4)).toBe(20)
    expect(autoLayoutDragValue({ start: 50, startValue: 8, direction: 1 }, 20)).toBe(0)
    expect(autoLayoutDragValue({ start: 50, startValue: 8, direction: -1 }, 40)).toBe(18)
  })

  test('drags the gap of a column downwards and records one undo step', () => {
    const { ed, frame } = setup()
    const drag = tryStartAutoLayoutValueDrag(ed, 180, 164, false)
    if (!drag) throw new Error('No drag on the gap')
    expect(drag.fields).toEqual(['itemSpacing'])
    handleAutoLayoutValueMove(drag, 180, 170, ed)
    handleAutoLayoutValueMove(drag, 180, 176, ed)
    expect(ed.graph.getNode(frame.id)?.itemSpacing).toBe(20)
    commitAutoLayoutValueDrag(drag, ed)
    ed.undoAction()
    expect(ed.graph.getNode(frame.id)?.itemSpacing).toBe(8)
  })

  test('drags the bottom padding upwards, with its opposite under Option', () => {
    const { ed, frame } = setup()
    const drag = tryStartAutoLayoutValueDrag(ed, 180, 222, true)
    if (!drag) throw new Error('No drag on the padding')
    expect(drag.fields).toEqual(['paddingBottom', 'paddingTop'])
    handleAutoLayoutValueMove(drag, 180, 212, ed)
    const node = ed.graph.getNode(frame.id)
    expect([node?.paddingTop, node?.paddingBottom]).toEqual([30, 30])
    cancelAutoLayoutValueDrag(drag, ed)
    const restored = ed.graph.getNode(frame.id)
    expect([restored?.paddingTop, restored?.paddingBottom]).toEqual([20, 20])
  })

  test('does not start on a layer inside the frame', () => {
    const { ed } = setup()
    expect(tryStartAutoLayoutValueDrag(ed, 180, 140, false)).toBeNull()
  })
})
