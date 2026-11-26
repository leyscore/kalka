import { describe, expect, test } from 'bun:test'

import { createEditor } from '@kalka/core/editor'

import { tidyPositions, tidyRows } from '#core/editor/alignment/tidy'

function card(id: string, x: number, y: number, width = 40, height = 40) {
  return { id, x, y, width, height }
}

describe('tidy up', () => {
  test('groups layers into the rows they roughly stand in, left to right', () => {
    const rows = tidyRows([card('b', 60, 4), card('d', 58, 62), card('a', 0, 0), card('c', 3, 55)])
    expect(rows.map((row) => row.map((item) => item.id))).toEqual([
      ['a', 'b'],
      ['c', 'd']
    ])
  })

  test('lays a rough grid out with the average gaps from its top left corner', () => {
    const positions = tidyPositions([
      card('a', 0, 0),
      card('b', 62, 4),
      card('c', 3, 58),
      card('d', 58, 62)
    ])
    // Gaps of 22 and 15 across average 19 (rounded); rows 58 - 44 = 14 apart.
    expect(Object.fromEntries(positions)).toEqual({
      a: { x: 0, y: 0 },
      b: { x: 59, y: 0 },
      c: { x: 0, y: 54 },
      d: { x: 59, y: 54 }
    })
  })

  test('never overlaps layers that overlapped', () => {
    const positions = tidyPositions([card('a', 0, 0), card('b', 30, 0)])
    expect(positions.get('b')).toEqual({ x: 40, y: 0 })
  })

  test('moves the layers in one undo step', () => {
    const editor = createEditor()
    const pageId = editor.state.currentPageId
    const ids = [
      [0, 0],
      [70, 6],
      [140, -4]
    ].map(
      ([x, y]) => editor.graph.createNode('RECTANGLE', pageId, { x, y, width: 50, height: 50 }).id
    )
    expect(editor.canTidyNodes(ids)).toBe(true)
    editor.tidyNodes(ids)
    expect(ids.map((id) => editor.graph.getNode(id)?.y)).toEqual([-4, -4, -4])
    expect(ids.map((id) => editor.graph.getNode(id)?.x)).toEqual([0, 70, 140])
    editor.undoAction()
    expect(ids.map((id) => editor.graph.getNode(id)?.y)).toEqual([0, 6, -4])
  })
})
