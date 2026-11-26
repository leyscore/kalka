import { describe, expect, test } from 'bun:test'

import { createEditor } from '@kalka/core/editor'

import {
  isArranged,
  smartGapPositions,
  smartGaps,
  smartGrid,
  smartReorder,
  smartSlotAt
} from '#core/editor/alignment/smart-selection'

function card(id: string, x: number, y: number, width = 40, height = 40) {
  return { id, x, y, width, height }
}

const ids = (rows: { id: string }[][]) => rows.map((row) => row.map((item) => item.id))

describe('smart selection', () => {
  test('finds an evenly spaced row, even with layers of different heights', () => {
    const grid = smartGrid([card('c', 120, 0), card('a', 0, 10, 40, 20), card('b', 60, 0)])
    expect(grid?.kind).toBe('row')
    expect(grid?.columnGap).toBe(20)
    expect(grid && ids(grid.rows)).toEqual([['a', 'b', 'c']])
  })

  test('finds an evenly spaced column', () => {
    const grid = smartGrid([card('a', 0, 0), card('b', 5, 50), card('c', 0, 100)])
    expect(grid?.kind).toBe('column')
    expect(grid?.rowGap).toBe(10)
  })

  test('finds a tidy grid and its two spacings', () => {
    const grid = smartGrid([card('a', 0, 0), card('b', 50, 0), card('c', 0, 60), card('d', 50, 60)])
    expect(grid?.kind).toBe('grid')
    expect(grid?.columnGap).toBe(10)
    expect(grid?.rowGap).toBe(20)
    expect(grid && smartGaps(grid).map((gap) => gap.axis)).toEqual(['x', 'x', 'y'])
  })

  test('is not a smart selection with uneven gaps or fewer than three layers', () => {
    expect(smartGrid([card('a', 0, 0), card('b', 50, 0), card('c', 130, 0)])).toBeNull()
    expect(smartGrid([card('a', 0, 0), card('b', 50, 0)])).toBeNull()
    expect(isArranged([card('a', 0, 0), card('b', 50, 0), card('c', 130, 0)])).toBe(false)
    expect(isArranged([card('a', 0, 0), card('b', 50, 0), card('c', 100, 0)])).toBe(true)
  })

  test('sets every gap along an axis from the first layer', () => {
    const grid = smartGrid([card('a', 0, 0), card('b', 50, 5), card('c', 100, 0)])
    if (!grid) throw new Error('expected a row')
    const positions = smartGapPositions(grid, 'x', 24)
    expect(Object.fromEntries(positions)).toEqual({
      a: { x: 0, y: 0 },
      b: { x: 64, y: 5 },
      c: { x: 128, y: 0 }
    })
  })

  test('reorders a layer along a row and closes the others up', () => {
    const grid = smartGrid([card('a', 0, 0), card('b', 50, 0), card('c', 100, 0)])
    if (!grid) throw new Error('expected a row')
    const slot = smartSlotAt(grid, 'a', { x: 125, y: 20 })
    expect(slot).toBe(2)
    const { order, positions } = smartReorder(grid, 'a', slot)
    expect(order).toEqual(['b', 'c', 'a'])
    expect(positions.get('b')).toEqual({ x: 0, y: 0 })
    expect(positions.get('a')).toEqual({ x: 100, y: 0 })
  })

  test('moves a layer to the nearest cell of a grid', () => {
    const grid = smartGrid([card('a', 0, 0), card('b', 50, 0), card('c', 0, 50), card('d', 50, 50)])
    if (!grid) throw new Error('expected a grid')
    const slot = smartSlotAt(grid, 'a', { x: 72, y: 68 })
    expect(slot).toBe(3)
    expect(smartReorder(grid, 'a', slot).order).toEqual(['b', 'c', 'd', 'a'])
  })

  test('changes the gap of selected layers on the canvas in one undo step', () => {
    const editor = createEditor()
    const pageId = editor.state.currentPageId
    const nodes = [0, 60, 120].map((x) =>
      editor.graph.createNode('RECTANGLE', pageId, { x, y: 0, width: 40, height: 40 })
    )
    const nodeIds = nodes.map((node) => node.id)
    const grid = editor.smartSelection(nodeIds)
    if (!grid) throw new Error('expected a smart selection')
    expect(editor.canTidyUpSelection(nodeIds)).toBe(false)
    const originals = new Map(nodes.map((node) => [node.id, { x: node.x, y: node.y }]))
    editor.arrangeNodes(smartGapPositions(grid, 'x', 0))
    editor.commitArrangement(originals, 'Update spacing')
    expect(nodeIds.map((id) => editor.graph.getNode(id)?.x)).toEqual([0, 40, 80])
    editor.undoAction()
    expect(nodeIds.map((id) => editor.graph.getNode(id)?.x)).toEqual([0, 60, 120])
  })

  test('offers Tidy up only for layers that are not arranged', () => {
    const editor = createEditor()
    const pageId = editor.state.currentPageId
    const nodeIds = [
      [0, 0],
      [70, 6],
      [130, -4]
    ].map(
      ([x, y]) => editor.graph.createNode('RECTANGLE', pageId, { x, y, width: 50, height: 50 }).id
    )
    expect(editor.smartSelection(nodeIds)).toBeNull()
    expect(editor.canTidyUpSelection(nodeIds)).toBe(true)
    editor.tidyNodes(nodeIds)
    expect(editor.canTidyUpSelection(nodeIds)).toBe(false)
  })
})
