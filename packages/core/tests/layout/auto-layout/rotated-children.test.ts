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
    const turned = graph.createNode('FRAME', row.id, { width: 100, height: 200, rotation: 90 })
    const after = graph.createNode('FRAME', row.id, { width: 50, height: 50 })

    computeAllLayouts(graph)

    expect(row.width).toBe(200 + 10 + 50)
    expect(row.height).toBe(100)
    // The layer turns about its center, so its own box sits inside the box around it.
    expect(turned.x).toBeCloseTo(50, 3)
    expect(turned.y).toBeCloseTo(-50, 3)
    expect(after.x).toBeCloseTo(210, 3)
  })

  test('places a turned line by the box around it, from where it starts', () => {
    const graph = new SceneGraph()
    const row = graph.createNode('FRAME', graph.getPages()[0].id, {
      layoutMode: 'HORIZONTAL',
      primaryAxisSizing: 'HUG',
      counterAxisSizing: 'HUG',
      itemSpacing: 10
    })
    graph.createNode('FRAME', row.id, { width: 20, height: 20 })
    const line = graph.createNode('LINE', row.id, { width: 100, height: 0, rotation: 21.8 })
    const after = graph.createNode('FRAME', row.id, { width: 20, height: 20 })

    computeAllLayouts(graph)

    // The browser places boxes on a grid of 1/64 px.
    const across = 100 * Math.cos((21.8 * Math.PI) / 180)
    const down = 100 * Math.sin((21.8 * Math.PI) / 180)
    expect(line.x).toBeCloseTo(30, 2)
    expect(line.y).toBeCloseTo(0, 2)
    expect(after.x).toBeCloseTo(30 + across + 10, 1)
    // The hugging row holds the whole line, not the line's own zero height.
    expect(row.width).toBeCloseTo(20 + 10 + across + 10 + 20, 1)
    expect(row.height).toBeCloseTo(down, 1)
  })
})
