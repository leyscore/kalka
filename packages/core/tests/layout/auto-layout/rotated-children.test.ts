import { describe, expect, test } from 'bun:test'

import { computeAllLayouts, SceneGraph } from '@kalka/core'

describe('a turned layer in auto layout', () => {
  // Figma places a turned layer by the box around it as drawn, as html.to.design captures of
  // tilted cards rely on.
  test('takes the space of the box around it', () => {
    const graph = new SceneGraph()
    const row = graph.createNode('FRAME', graph.getPages()[0].id, {
      layoutMode: 'HORIZONTAL',
      primaryAxisSizing: 'HUG',
      counterAxisSizing: 'HUG',
      itemSpacing: 10
    })
    graph.createNode('FRAME', row.id, { width: 100, height: 200, rotation: 90 })
    graph.createNode('FRAME', row.id, { width: 50, height: 50 })

    computeAllLayouts(graph)

    expect(row.width).toBe(200 + 10 + 50)
    expect(row.height).toBe(100)
  })
})
