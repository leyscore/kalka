import { describe, expect, test } from 'bun:test'

import {
  patternSource,
  patternTileCopies,
  patternTileLayout,
  SceneGraph,
  type Fill
} from '@kalka/scene-graph'

function patternFill(fields: Partial<Fill>): Fill {
  return {
    type: 'PATTERN',
    color: { r: 0, g: 0, b: 0, a: 1 },
    opacity: 1,
    visible: true,
    ...fields
  }
}

describe('pattern tile layout', () => {
  test('uses scale, spacing, and alignment for rectangular tiles', () => {
    const layout = patternTileLayout(
      { width: 20, height: 10 },
      patternFill({
        scale: 2,
        patternSpacing: { x: 0.25, y: 0.5 },
        horizontalAlignment: 'CENTER',
        verticalAlignment: 'END'
      })
    )

    expect(layout).toEqual({
      rect: { x: 0, y: 0, width: 50, height: 30 },
      scale: 2,
      positions: [{ x: -5, y: -10 }]
    })
  })

  test('adds an offset source copy for hexagonal tiles', () => {
    const layout = patternTileLayout(
      { width: 20, height: 10 },
      patternFill({ patternTileType: 'HORIZONTAL_HEXAGONAL', patternSpacing: { x: 0, y: 0 } })
    )

    expect(layout.positions).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 5 }
    ])
  })

  test('wraps copies that cross the tile edge onto the opposite side', () => {
    const source = { width: 20, height: 10 }
    const layout = patternTileLayout(
      source,
      patternFill({ patternTileType: 'HORIZONTAL_HEXAGONAL', patternSpacing: { x: 0, y: 0 } })
    )

    expect(patternTileCopies(source, layout)).toEqual([
      { x: 0, y: 0 },
      { x: -10, y: -5 },
      { x: 10, y: -5 },
      { x: -10, y: 5 },
      { x: 10, y: 5 }
    ])
  })

  test('keeps a copy inside its tile once', () => {
    const source = { width: 10, height: 10 }
    const layout = patternTileLayout(source, patternFill({ patternSpacing: { x: 1, y: 1 } }))

    expect(patternTileCopies(source, layout)).toEqual([{ x: 0, y: 0 }])
  })
})

describe('pattern source', () => {
  test('finds the source by id or by the id it had in its file, never the layer itself', () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0].id
    const dot = graph.createNode('ELLIPSE', page, { width: 10, height: 10 })
    const filled = graph.createNode('RECTANGLE', page, { width: 100, height: 100 })
    dot.source.id = 'file:dot'

    expect(patternSource(graph, filled, patternFill({ sourceNodeId: dot.id }))?.id).toBe(dot.id)
    expect(patternSource(graph, filled, patternFill({ sourceNodeId: 'file:dot' }))?.id).toBe(
      dot.id
    )
    expect(patternSource(graph, filled, patternFill({ sourceNodeId: filled.id }))).toBeNull()
    expect(patternSource(graph, filled, patternFill({ sourceNodeId: 'missing' }))).toBeNull()
  })
})
