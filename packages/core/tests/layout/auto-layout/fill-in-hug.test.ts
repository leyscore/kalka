import { describe, expect, test } from 'bun:test'

import { computeAllLayouts, SceneGraph } from '@kalka/core'

/** A row that hugs its width: a 40px marker and a 300px frame set to fill the row. */
function hugRow(graph: SceneGraph, parentId: string, row: { layoutAlignSelf?: 'STRETCH' } = {}) {
  const frame = graph.createNode('FRAME', parentId, {
    layoutMode: 'HORIZONTAL',
    primaryAxisSizing: 'HUG',
    counterAxisSizing: 'HUG',
    itemSpacing: 10,
    ...row
  })
  graph.createNode('FRAME', frame.id, { width: 40, height: 40 })
  const fill = graph.createNode('FRAME', frame.id, { width: 300, height: 20, layoutGrow: 1 })
  return { frame, fill }
}

describe('a child that fills a row hugging its width', () => {
  test('keeps its own size', () => {
    const graph = new SceneGraph()
    const { frame, fill } = hugRow(graph, graph.getPages()[0].id)

    computeAllLayouts(graph)

    expect(fill.width).toBe(300)
    expect(frame.width).toBe(350)
  })

  // Figma lets the parent's stretch win over the row's hug, so the row is as wide as the column
  // and the filling child takes what the marker leaves.
  test('shrinks to the row a column stretches', () => {
    const graph = new SceneGraph()
    const column = graph.createNode('FRAME', graph.getPages()[0].id, {
      layoutMode: 'VERTICAL',
      width: 200,
      primaryAxisSizing: 'HUG',
      counterAxisSizing: 'FIXED'
    })
    const { frame, fill } = hugRow(graph, column.id, { layoutAlignSelf: 'STRETCH' })

    computeAllLayouts(graph)

    expect(frame.width).toBe(200)
    expect(fill.width).toBe(150)
  })
})
