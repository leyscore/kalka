import { describe, expect, test } from 'bun:test'

import { computeAllLayouts, SceneGraph } from '@kalka/core'

describe('auto spacing', () => {
  // Figma saves the spacing it last computed alongside Auto spacing, and ignores it.
  test('shares the free space whatever item spacing the frame keeps', () => {
    const graph = new SceneGraph()
    const column = graph.createNode('FRAME', graph.getPages()[0].id, {
      layoutMode: 'VERTICAL',
      width: 100,
      height: 300,
      primaryAxisSizing: 'FIXED',
      counterAxisSizing: 'FIXED',
      primaryAxisAlign: 'SPACE_BETWEEN',
      itemSpacing: 250
    })
    graph.createNode('FRAME', column.id, { width: 100, height: 100 })
    const last = graph.createNode('FRAME', column.id, { width: 100, height: 50 })

    computeAllLayouts(graph)

    expect(last.y).toBe(250)
    expect(column.height).toBe(300)
  })
})
