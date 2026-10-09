import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@open-pencil/scene-graph'

import { layoutGridsLayer } from '#vue/canvas/svg-overlay/layers/layout-grids'
import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import type { OverlayShape } from '#vue/canvas/svg-overlay/shapes'

function context(graph: SceneGraph): OverlayContext {
  return {
    graph,
    view: { panX: 0, panY: 0, zoom: 1 },
    overlays: {},
    selectedIds: new Set(),
    measureText: (text, fontSize) => text.length * fontSize * 0.5
  }
}

function rects(shapes: OverlayShape[]) {
  return shapes.flatMap((shape) => (shape.type === 'group' ? shape.children : []))
}

describe('layout grids', () => {
  test('draw a frame’s columns over its content', () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0].id
    graph.createNode('FRAME', page, {
      width: 400,
      height: 300,
      layoutGrids: [
        {
          pattern: 'COLUMNS',
          alignment: 'STRETCH',
          count: 4,
          offset: 20,
          gutterSize: 20,
          sectionSize: 0,
          visible: true,
          color: { r: 1, g: 0, b: 0, a: 0.1 }
        }
      ]
    })
    const columns = rects(layoutGridsLayer(context(graph), page, 1))
    expect(columns).toHaveLength(4)
    expect(columns[0]).toMatchObject({ type: 'rect', x: 20, y: 0, height: 300 })
  })

  test('draw nothing for frames without grids', () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0].id
    graph.createNode('FRAME', page, { width: 400, height: 300 })
    expect(layoutGridsLayer(context(graph), page, 1)).toEqual([])
  })
})
