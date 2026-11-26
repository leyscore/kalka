import { describe, expect, test } from 'bun:test'

import { SceneGraph, childIdsTopFirst } from '@kalka/scene-graph'
import { layerCSS } from '@kalka/scene-graph/css-model'

import { pageId } from './helpers'

/** Two overlapping cards in an auto layout row: a negative gap puts the second over the first. */
function overlappingRow(itemReverseZIndex: boolean) {
  const graph = new SceneGraph()
  const row = graph.createNode('FRAME', pageId(graph), {
    x: 0,
    y: 0,
    width: 100,
    height: 50,
    layoutMode: 'HORIZONTAL',
    itemSpacing: -20,
    itemReverseZIndex
  })
  const card = (name: string, x: number) =>
    graph.createNode('RECTANGLE', row.id, { name, x, y: 0, width: 60, height: 50 })
  return { graph, row, first: card('First', 0), second: card('Second', 40) }
}

describe("auto layout's canvas stacking", () => {
  test('draws the last child on top by default, with no z-index', () => {
    const { graph, row, first, second } = overlappingRow(false)
    expect(childIdsTopFirst(row)).toEqual([second.id, first.id])
    expect(graph.hitTest(50, 25, pageId(graph))?.id).toBe(second.id)
    expect(layerCSS(first, row)['z-index']).toBeUndefined()
  })

  test('First on top draws and hits the first child over the next', () => {
    const { graph, row, first, second } = overlappingRow(true)
    expect(childIdsTopFirst(row)).toEqual([first.id, second.id])
    expect(graph.hitTest(50, 25, pageId(graph))?.id).toBe(first.id)
    expect(layerCSS(first, row)['z-index']).toBe('2')
    expect(layerCSS(second, row)['z-index']).toBe('1')
  })

  test('a frame without auto layout keeps the last child on top', () => {
    const { graph, row, first, second } = overlappingRow(true)
    graph.updateNode(row.id, { layoutMode: 'NONE' })
    const plain = graph.getNode(row.id)
    expect(plain && childIdsTopFirst(plain)).toEqual([second.id, first.id])
    expect(plain && layerCSS(first, plain)['z-index']).toBeUndefined()
  })
})
