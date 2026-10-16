import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import {
  measurementSegmentShapes,
  measurementsLayer
} from '#vue/canvas/svg-overlay/layers/measurement'
import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import { css } from '#vue/canvas/svg-overlay/shapes'

const ORANGE = css({ r: 0.949, g: 0.282, b: 0.133, a: 1 })

function context(graph: SceneGraph, patch: Partial<OverlayContext> = {}): OverlayContext {
  return {
    graph,
    view: { panX: 10, panY: 20, zoom: 2 },
    overlays: {},
    selectedIds: new Set(),
    measureText: (text) => text.length * 6,
    ...patch
  }
}

function setup() {
  const graph = new SceneGraph()
  const page = graph.getPages()[0].id
  const a = graph.createNode('RECTANGLE', page, { x: 0, y: 0, width: 50, height: 50 })
  const b = graph.createNode('RECTANGLE', page, { x: 80, y: 0, width: 20, height: 50 })
  return { graph, a, b }
}

describe('SVG measurements', () => {
  test('outlines the hovered layer and measures the gap to the selection', () => {
    const { graph, a, b } = setup()
    const shapes = measurementsLayer(
      context(graph, { selectedIds: new Set([a.id]), overlays: { hoveredNodeId: b.id } })
    )
    expect(shapes[0]).toEqual({
      type: 'polygon',
      points: [170, 20, 210, 20, 210, 120, 170, 120],
      stroke: ORANGE,
      strokeWidth: 1
    })
    expect(shapes[1]).toEqual({
      type: 'line',
      x1: 110,
      y1: 70,
      x2: 170,
      y2: 70,
      stroke: ORANGE,
      strokeWidth: 1
    })
    // A pill sized to "30" plus padding, centred on the line.
    expect(shapes[2]).toMatchObject({
      type: 'rect',
      x: 140 - 11,
      y: 61,
      width: 22,
      height: 18,
      rx: 3,
      fill: ORANGE
    })
    expect(shapes[3]).toMatchObject({ type: 'text', text: '30', x: 134, y: 74, fontSize: 10 })
  })

  test('nothing when the hovered layer is selected or nothing is selected', () => {
    const { graph, a, b } = setup()
    expect(measurementsLayer(context(graph, { overlays: { hoveredNodeId: b.id } }))).toEqual([])
    expect(
      measurementsLayer(
        context(graph, { selectedIds: new Set([a.id]), overlays: { hoveredNodeId: a.id } })
      )
    ).toEqual([])
  })

  test('vertical segments put the pill at the middle of the line', () => {
    const shapes = measurementSegmentShapes(
      { panX: 0, panY: 0, zoom: 1 },
      (text) => text.length * 6,
      { axis: 'y', from: 10, to: 30, cross: 5, value: 19.6 }
    )
    expect(shapes[0]).toMatchObject({ type: 'line', x1: 5, y1: 10, x2: 5, y2: 30 })
    expect(shapes[1]).toMatchObject({ type: 'rect', y: 11 })
    expect(shapes[2]).toMatchObject({ type: 'text', text: '20' })
  })
})
