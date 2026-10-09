import { describe, expect, test } from 'bun:test'

import {
  PEN_CLOSE_RADIUS_BOOST,
  PEN_PATH_STROKE_WIDTH,
  PEN_VERTEX_RADIUS,
  SELECTION_COLOR
} from '@open-pencil/core/constants'
import { SceneGraph } from '@open-pencil/scene-graph'

import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import {
  handleVisibleVertices,
  nodeEditLayer,
  penLayer,
  vectorNetworkPathData
} from '#vue/canvas/svg-overlay/layers/vector-edit'
import { css } from '#vue/canvas/svg-overlay/shapes'

const WHITE = css({ r: 1, g: 1, b: 1, a: 1 })
const BLUE = css(SELECTION_COLOR)
const LIGHT_BLUE = css({ r: 0.42, g: 0.553, b: 0.949, a: 1 })
const ZERO = { x: 0, y: 0 }

function context(overlays: OverlayContext['overlays'], graph = new SceneGraph()): OverlayContext {
  return {
    graph,
    view: { panX: 10, panY: 20, zoom: 2 },
    overlays,
    selectedIds: new Set(),
    measureText: (text) => text.length * 6
  }
}

function editState(graph: SceneGraph) {
  const page = graph.getPages()[0].id
  const node = graph.createNode('VECTOR', page, { width: 100, height: 100 })
  return {
    nodeId: node.id,
    vertices: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 }
    ],
    segments: [
      { start: 0, end: 1, tangentStart: { x: 10, y: 0 }, tangentEnd: { x: -10, y: 0 } },
      { start: 1, end: 2, tangentStart: ZERO, tangentEnd: ZERO },
      { start: 2, end: 3, tangentStart: { x: 0, y: 5 }, tangentEnd: ZERO }
    ],
    regions: [],
    selectedVertexIndices: new Set<number>()
  }
}

describe('vector edit overlay', () => {
  test('outlines the network in screen pixels with cubic and line commands', () => {
    const graph = new SceneGraph()
    const state = editState(graph)
    const [outline] = nodeEditLayer(context({ nodeEditState: state }, graph))
    expect(outline).toMatchObject({ type: 'path', strokeWidth: 1 })
    expect(outline.type === 'path' && outline.d).toBe(
      'M10 20C30 20 190 20 210 20L210 220C210 230 10 220 10 220'
    )
  })

  test('closes region loops', () => {
    const graph = new SceneGraph()
    const state = editState(graph)
    const d = vectorNetworkPathData(
      { ...state, regions: [{ windingRule: 'NONZERO', loops: [[1]] }] },
      (x, y) => ({ x, y })
    )
    expect(d.startsWith('M100 0L100 100Z')).toBe(true)
  })

  test('shows handles only around selected vertices, styled by selection and hover', () => {
    const graph = new SceneGraph()
    const state = editState(graph)
    expect(handleVisibleVertices(new Set([0]), new Set(), state.segments)).toEqual(new Set([0, 1]))
    expect(
      nodeEditLayer(context({ nodeEditState: state }, graph)).filter((s) => s.type === 'line')
    ).toHaveLength(0)

    const shapes = nodeEditLayer(
      context(
        {
          nodeEditState: {
            ...state,
            selectedVertexIndices: new Set([0]),
            selectedHandles: new Set([0]),
            hoveredHandleInfo: { segmentIndex: 0, tangentField: 'tangentEnd' }
          }
        },
        graph
      )
    )
    const lines = shapes.filter((s) => s.type === 'line')
    expect(lines.map((l) => l.type === 'line' && l.stroke)).toEqual([BLUE, LIGHT_BLUE])
    expect(lines[0]).toMatchObject({ x1: 10, y1: 20, x2: 30, y2: 20 })
    const fills = shapes
      .filter((s) => s.type === 'polygon' && s.fill)
      .map((s) => s.type === 'polygon' && s.fill)
    expect(fills).toEqual([BLUE, LIGHT_BLUE])
    const vertices = shapes.filter((s) => s.type === 'ellipse')
    expect(vertices).toHaveLength(4)
    expect(vertices[0]).toMatchObject({
      cx: 10,
      cy: 20,
      rx: PEN_VERTEX_RADIUS,
      fill: BLUE,
      stroke: BLUE
    })
    expect(vertices[1]).toMatchObject({ fill: WHITE })
  })

  test('draws nothing without a node', () => {
    const graph = new SceneGraph()
    expect(
      nodeEditLayer(context({ nodeEditState: { ...editState(graph), nodeId: 'missing' } }, graph))
    ).toEqual([])
  })
})

describe('pen overlay', () => {
  const pen = {
    vertices: [
      { x: 0, y: 0 },
      { x: 50, y: 0 },
      { x: 50, y: 50 }
    ],
    segments: [
      { start: 0, end: 1, tangentStart: ZERO, tangentEnd: ZERO },
      { start: 1, end: 2, tangentStart: { x: 0, y: 10 }, tangentEnd: ZERO }
    ],
    dragTangent: null,
    closingToFirst: false,
    cursorX: 100,
    cursorY: 50
  }

  test('strokes committed segments, then the rubber band to the cursor', () => {
    const paths = penLayer(context({ penState: pen })).filter((s) => s.type === 'path')
    expect(paths).toHaveLength(3)
    expect(paths[0]).toMatchObject({
      strokeWidth: PEN_PATH_STROKE_WIDTH,
      stroke: css({ r: 0, g: 0, b: 0, a: 1 })
    })
    expect(paths[0].type === 'path' && paths[0].d).toBe(
      'M10 20L110 20M110 20C110 40 110 120 110 120'
    )
    expect(paths[2].type === 'path' && paths[2].d).toBe('M110 120L210 120')
  })

  test('closing previews back to the first vertex and enlarges it', () => {
    const shapes = penLayer(
      context({
        penState: { ...pen, pendingClose: true, closingToFirst: true, dragTangent: { x: 5, y: 0 } }
      })
    )
    const paths = shapes.filter((s) => s.type === 'path')
    expect(paths[2].type === 'path' && paths[2].d).toBe('M110 120C110 120 20 20 10 20')
    const first = shapes.filter((s) => s.type === 'ellipse').at(-3)
    expect(first).toMatchObject({ cx: 10, cy: 20, rx: PEN_VERTEX_RADIUS + PEN_CLOSE_RADIUS_BOOST })
    // Drag handles sit on the first vertex: the dragged one and its mirror.
    expect(shapes.filter((s) => s.type === 'line').slice(-2)).toEqual([
      expect.objectContaining({ x1: 10, y1: 20, x2: 20, y2: 20 }),
      expect.objectContaining({ x1: 10, y1: 20, x2: 0, y2: 20 })
    ])
  })

  test('draws nothing without vertices', () => {
    expect(penLayer(context({ penState: { ...pen, vertices: [], segments: [] } }))).toEqual([])
  })
})
