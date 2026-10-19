import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import { createGridFrames, layoutGridsLayer } from '#vue/canvas/svg-overlay/layers/layout-grids'
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
    const columns = rects(layoutGridsLayer(context(graph), page, createGridFrames()))
    expect(columns).toHaveLength(4)
    expect(columns[0]).toMatchObject({ type: 'rect', x: 20, y: 0, height: 300 })
  })

  test('draw nothing for frames without grids', () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0].id
    graph.createNode('FRAME', page, { width: 400, height: 300 })
    expect(layoutGridsLayer(context(graph), page, createGridFrames())).toEqual([])
  })

  test('follow grids added to a frame and the frame’s visibility', () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0].id
    const frame = graph.createNode('FRAME', page, { width: 400, height: 300 })
    const frames = createGridFrames()
    expect(layoutGridsLayer(context(graph), page, frames)).toEqual([])
    graph.updateNode(frame.id, {
      layoutGrids: [
        {
          pattern: 'ROWS',
          alignment: 'STRETCH',
          count: 3,
          offset: 0,
          gutterSize: 10,
          sectionSize: 0,
          visible: true,
          color: { r: 0, g: 0, b: 1, a: 0.1 }
        }
      ]
    })
    expect(rects(layoutGridsLayer(context(graph), page, frames))).toHaveLength(3)
    graph.updateNode(frame.id, { visible: false })
    expect(layoutGridsLayer(context(graph), page, frames)).toEqual([])
    frames.dispose()
  })
})
