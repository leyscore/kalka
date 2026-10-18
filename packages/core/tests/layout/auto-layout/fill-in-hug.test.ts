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

// A frame whose every child fills across it has nothing to hug: Figma keeps its width, as it
// turns such a frame Fixed, where CSS would shrink it to children that place their own content.
describe('a column hugging its width whose every child fills it', () => {
  test('keeps its width', () => {
    const graph = new SceneGraph()
    const column = graph.createNode('FRAME', graph.getPages()[0].id, {
      layoutMode: 'VERTICAL',
      width: 400,
      height: 100,
      primaryAxisSizing: 'HUG',
      counterAxisSizing: 'HUG'
    })
    const free = graph.createNode('FRAME', column.id, {
      width: 400,
      height: 100,
      layoutAlignSelf: 'STRETCH'
    })
    graph.createNode('FRAME', free.id, { x: 10, y: 10, width: 120, height: 80 })

    computeAllLayouts(graph)

    expect(column.width).toBe(400)
    expect(free.width).toBe(400)
  })

  test('still hugs a child that does not fill', () => {
    const graph = new SceneGraph()
    const column = graph.createNode('FRAME', graph.getPages()[0].id, {
      layoutMode: 'VERTICAL',
      width: 400,
      primaryAxisSizing: 'HUG',
      counterAxisSizing: 'HUG'
    })
    graph.createNode('FRAME', column.id, { width: 400, height: 20, layoutAlignSelf: 'STRETCH' })
    graph.createNode('FRAME', column.id, { width: 150, height: 20 })

    computeAllLayouts(graph)

    expect(column.width).toBe(150)
  })
})
