import { describe, expect, test } from 'bun:test'

import { LabelCache } from '@open-pencil/core/canvas'
import { SceneGraph } from '@open-pencil/scene-graph'

import { composeOverlay as compose, type ComposeInput } from '#vue/canvas/svg-overlay/compose'
import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import { css, type OverlayShape } from '#vue/canvas/svg-overlay/shapes'

const WHITE = css({ r: 1, g: 1, b: 1, a: 1 })

function context(graph: SceneGraph, patch: Partial<OverlayContext> = {}): ComposeInput {
  return {
    graph,
    view: { panX: 10, panY: 20, zoom: 2 },
    overlays: {},
    selectedIds: new Set(),
    measureText: (text) => text.length * 6,
    pageId: graph.getPages()[0].id,
    viewportSize: { width: 1000, height: 800 },
    dpr: 1,
    pageColor: { r: 1, g: 1, b: 1, a: 1 },
    labels: new LabelCache(),
    showRulers: false,
    obstacles: [],
    flashes: [],
    aiMarks: { active: [], done: [] },
    now: 0,
    ...patch
  }
}

/** The editing chrome only: labels are covered by their own tests. */
function composeOverlay(input: ComposeInput): OverlayShape[] {
  return compose(input).shapes
}

function flatten(shapes: OverlayShape[]): OverlayShape[] {
  return shapes.flatMap((shape) => (shape.type === 'group' ? flatten(shape.children) : [shape]))
}

function setup() {
  const graph = new SceneGraph()
  const page = graph.getPages()[0].id
  const frame = graph.createNode('FRAME', page, { x: 100, y: 50, width: 200, height: 120 })
  return { graph, frame }
}

describe('SVG overlay', () => {
  test('a single selection draws its box, eight handles, the rotation handle and its size', () => {
    const { graph, frame } = setup()
    const shapes = composeOverlay(context(graph, { selectedIds: new Set([frame.id]) }))
    const flat = flatten(shapes)
    const handles = flat.filter((shape) => shape.type === 'rect' && shape.fill === WHITE)
    expect(handles).toHaveLength(9)
    expect(flat.some((shape) => shape.type === 'text' && shape.text === '200 × 120')).toBe(true)
    // The box is placed by the layer's screen matrix: pan + zoom × position.
    const placed = shapes.find(
      (shape) =>
        shape.type === 'group' &&
        shape.children.some((child) => child.type === 'rect' && child.width === 200 && child.stroke)
    )
    expect(placed?.type === 'group' && placed.matrix?.slice(0, 6)).toEqual([2, 0, 210, 0, 2, 120])
  })

  test('handles stay six screen pixels wide at any zoom', () => {
    const { graph, frame } = setup()
    const shapes = composeOverlay(
      context(graph, { selectedIds: new Set([frame.id]), view: { panX: 0, panY: 0, zoom: 4 } })
    )
    const handle = flatten(shapes).find((shape) => shape.type === 'rect' && shape.fill === WHITE)
    expect(handle?.type === 'rect' && handle.width * 4).toBe(6)
  })

  test('hover follows the shape and turns purple inside a component', () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0].id
    const component = graph.createNode('COMPONENT', page, { width: 100, height: 100 })
    const dot = graph.createNode('ELLIPSE', component.id, { width: 10, height: 10 })
    const [hover] = flatten(composeOverlay(context(graph, { overlays: { hoveredNodeId: dot.id } })))
    expect(hover.type).toBe('ellipse')
    expect(hover.type === 'ellipse' && hover.stroke).toBe(css({ r: 0.592, g: 0.278, b: 1, a: 1 }))
  })

  test('marquee, snap lines and the insert indicator are in screen pixels', () => {
    const { graph } = setup()
    const shapes = composeOverlay(
      context(graph, {
        overlays: {
          marquee: { x: 0, y: 0, width: 10, height: 5 },
          snapGuides: [{ axis: 'x', position: 5, from: 0, to: 10 }],
          layoutInsertIndicator: { x: 0, y: 0, length: 10, direction: 'VERTICAL' }
        }
      })
    )
    expect(shapes.find((shape) => shape.type === 'rect')).toMatchObject({
      x: 10,
      y: 20,
      width: 20,
      height: 10
    })
    expect(shapes.filter((shape) => shape.type === 'line')).toEqual([
      expect.objectContaining({ x1: 20, y1: 20, x2: 20, y2: 40 }),
      expect.objectContaining({ x1: 10, y1: 20, x2: 10, y2: 40, strokeWidth: 2 })
    ])
  })

  test('a previewing canvas draws no chrome', () => {
    const { graph, frame } = setup()
    expect(
      composeOverlay(
        context(graph, { selectedIds: new Set([frame.id]), overlays: { playing: true } })
      )
    ).toEqual([])
  })
})
