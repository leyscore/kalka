import { afterEach, describe, expect, test } from 'bun:test'

import { createEditor, type Editor } from '@kalka/core/editor'

import {
  cancelSmartSelection,
  commitSmartSelection,
  handleSmartSelectionMove,
  hoverSmartSelection,
  tryStartSmartSelection
} from '#vue/shared/input/smart-selection'

let editor: Editor | null = null

afterEach(() => {
  editor?.dispose()
  editor = null
})

/** Three selected 40 × 40 squares in a row, 20 apart, from (0, 0). */
function setup(xs = [0, 60, 120]) {
  const ed = createEditor()
  editor = ed
  const ids = xs.map(
    (x) =>
      ed.graph.createNode('RECTANGLE', ed.state.currentPageId, { x, y: 0, width: 40, height: 40 })
        .id
  )
  ed.select(ids)
  const xsOf = () => ids.map((id) => ed.graph.getNode(id)?.x)
  return { ed, ids, xsOf }
}

describe('smart selection handles', () => {
  test('a gap handle drags every gap along the row in one undo step', () => {
    const { ed, xsOf } = setup()
    expect(hoverSmartSelection(ed, 50, 20)).toBe('ew-resize')
    const drag = tryStartSmartSelection(ed, 50, 20)
    if (!drag || drag === 'tidied') throw new Error('No drag on the gap')
    expect(drag.type).toBe('smart-gap')
    handleSmartSelectionMove(drag, 54, 20, ed)
    expect(xsOf()).toEqual([0, 64, 128])
    commitSmartSelection(drag, ed)
    ed.undoAction()
    expect(xsOf()).toEqual([0, 60, 120])
  })

  test('a layer dragged by its centre takes its new place and the others close up', () => {
    const { ed, xsOf } = setup()
    expect(hoverSmartSelection(ed, 20, 20)).toBe('grab')
    const drag = tryStartSmartSelection(ed, 20, 20)
    if (!drag || drag === 'tidied') throw new Error('No drag on the centre')
    handleSmartSelectionMove(drag, 150, 22, ed)
    // The grabbed layer follows the pointer while the others close up.
    expect(xsOf()).toEqual([130, 0, 60])
    commitSmartSelection(drag, ed)
    expect(xsOf()).toEqual([120, 0, 60])
    ed.undoAction()
    expect(xsOf()).toEqual([0, 60, 120])
  })

  test('Escape puts the layers back', () => {
    const { ed, xsOf } = setup()
    const drag = tryStartSmartSelection(ed, 50, 20)
    if (!drag || drag === 'tidied') throw new Error('No drag on the gap')
    handleSmartSelectionMove(drag, 90, 20, ed)
    cancelSmartSelection(drag, ed)
    expect(xsOf()).toEqual([0, 60, 120])
  })

  test('an uneven selection shows the Tidy up button, which tidies it', () => {
    const { ed, xsOf } = setup([0, 50, 130])
    expect(hoverSmartSelection(ed, 50, 20)).toBeNull()
    // The button sits 8px out of the selection's bottom right corner at 100% zoom.
    expect(hoverSmartSelection(ed, 180, 58)).toBe('pointer')
    expect(tryStartSmartSelection(ed, 180, 58)).toBe('tidied')
    expect(xsOf()).toEqual([0, 65, 130])
  })

  test('layers in auto layout show no handles', () => {
    const ed = createEditor()
    editor = ed
    const frame = ed.graph.createNode('FRAME', ed.state.currentPageId, {
      width: 200,
      height: 40,
      layoutMode: 'HORIZONTAL',
      itemSpacing: 20
    })
    const ids = [0, 60, 120].map(
      (x) => ed.graph.createNode('RECTANGLE', frame.id, { x, y: 0, width: 40, height: 40 }).id
    )
    ed.select(ids)
    expect(hoverSmartSelection(ed, 50, 20)).toBeNull()
    expect(tryStartSmartSelection(ed, 50, 20)).toBeNull()
  })
})
