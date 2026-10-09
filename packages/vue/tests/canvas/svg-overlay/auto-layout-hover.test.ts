import { describe, expect, test } from 'bun:test'

import type { RenderOverlays } from '@open-pencil/core/canvas'
import {
  AUTO_LAYOUT_HOVER_BLUE,
  AUTO_LAYOUT_HOVER_BLUE_FILL,
  AUTO_LAYOUT_HOVER_MAGENTA,
  AUTO_LAYOUT_HOVER_MAGENTA_FILL,
  SELECTION_COLOR
} from '@open-pencil/core/constants'
import { SceneGraph } from '@open-pencil/scene-graph'

import {
  autoLayoutHoverLayer,
  stripeSegments
} from '#vue/canvas/svg-overlay/layers/auto-layout-hover'
import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import { css, type OverlayShape } from '#vue/canvas/svg-overlay/shapes'

function context(
  graph: SceneGraph,
  autoLayoutHover: RenderOverlays['autoLayoutHover'],
  patch: Partial<RenderOverlays> = {}
): OverlayContext {
  return {
    graph,
    view: { panX: 10, panY: 20, zoom: 2 },
    overlays: { autoLayoutHover, ...patch },
    selectedIds: new Set(),
    measureText: (text) => text.length * 6
  }
}

/** A row frame at (100, 50), 200×100, padding 10/20/30/40, two 40px children 12 apart. */
function setup(layoutMode: 'HORIZONTAL' | 'VERTICAL' | 'NONE' = 'HORIZONTAL') {
  const graph = new SceneGraph()
  const page = graph.getPages()[0].id
  const frame = graph.createNode('FRAME', page, {
    x: 100,
    y: 50,
    width: 200,
    height: 100,
    layoutMode,
    itemSpacing: 12,
    paddingTop: 10,
    paddingRight: 20,
    paddingBottom: 30,
    paddingLeft: 40
  })
  graph.createNode('RECTANGLE', frame.id, { x: 40, y: 10, width: 40, height: 60 })
  graph.createNode('RECTANGLE', frame.id, { x: 92, y: 10, width: 40, height: 60 })
  return { graph, frame }
}

const lines = (shapes: OverlayShape[], color: Parameters<typeof css>[0], width: number) =>
  shapes.filter(
    (shape) => shape.type === 'line' && shape.stroke === css(color) && shape.strokeWidth === width
  )

describe('auto layout hover overlay', () => {
  test('nothing without a hover, for a non-flow frame, or while transforming', () => {
    const { graph, frame } = setup()
    expect(autoLayoutHoverLayer(context(graph, null))).toEqual([])
    const plain = setup('NONE')
    expect(
      autoLayoutHoverLayer(context(plain.graph, { nodeId: plain.frame.id, kind: 'frame' }))
    ).toEqual([])
    expect(
      autoLayoutHoverLayer(
        context(graph, { nodeId: frame.id, kind: 'spacing' }, { transforming: true })
      )
    ).toEqual([])
  })

  test('frame hover draws only the baseline ticks: blue per padded side, magenta per gap', () => {
    const { graph, frame } = setup()
    const shapes = autoLayoutHoverLayer(context(graph, { nodeId: frame.id, kind: 'frame' }))
    expect(shapes).toHaveLength(5)
    const blue = lines(shapes, AUTO_LAYOUT_HOVER_BLUE, 1.5)
    expect(blue).toHaveLength(4)
    // Top tick: centered on the frame, mid top padding, 12px either side.
    expect(blue[0]).toMatchObject({ x1: 398, y1: 130, x2: 422, y2: 130 })
    const [gap] = lines(shapes, AUTO_LAYOUT_HOVER_MAGENTA, 1.5)
    // Gap from x 80 to 92 in the frame → screen x (100 + 86) × 2 + 10, vertical at the center.
    expect(gap).toMatchObject({ x1: 382, y1: 208, x2: 382, y2: 232 })
  })

  test('spacing hover hatches each gap in magenta, clipped to the gap', () => {
    const { graph, frame } = setup()
    const shapes = autoLayoutHoverLayer(context(graph, { nodeId: frame.id, kind: 'spacing' }))
    const fill = shapes.find((shape) => shape.type === 'rect')
    // Gap x 180..192, content y 60..120 → screen 370..394, 140..260.
    expect(fill).toMatchObject({
      x: 370,
      y: 140,
      width: 24,
      height: 120,
      fill: css(AUTO_LAYOUT_HOVER_MAGENTA_FILL)
    })
    const stripes = lines(shapes, AUTO_LAYOUT_HOVER_MAGENTA, 1)
    expect(stripes.length).toBeGreaterThan(0)
    for (const stripe of stripes) {
      if (stripe.type !== 'line') continue
      for (const x of [stripe.x1, stripe.x2]) expect(x).toBeGreaterThanOrEqual(370 - 1e-9)
      for (const x of [stripe.x1, stripe.x2]) expect(x).toBeLessThanOrEqual(394 + 1e-9)
      for (const y of [stripe.y1, stripe.y2]) expect(y).toBeGreaterThanOrEqual(140 - 1e-9)
      for (const y of [stripe.y1, stripe.y2]) expect(y).toBeLessThanOrEqual(260 + 1e-9)
    }
    expect(shapes.some((shape) => shape.type === 'text')).toBe(false)
  })

  test('spacing value shows the spacing in a pill up and right of the gap center', () => {
    const { graph, frame } = setup()
    const shapes = autoLayoutHoverLayer(context(graph, { nodeId: frame.id, kind: 'spacing-value' }))
    const text = shapes.find((shape) => shape.type === 'text')
    expect(text).toMatchObject({ text: '12', x: 400, y: 187, anchor: 'middle' })
    const pill = shapes.find((shape) => shape.type === 'rect' && shape.rx !== undefined)
    // Measured 12px + 5px padding each side, raised to the 24px minimum.
    expect(pill).toMatchObject({
      x: 388,
      y: 171,
      width: 24,
      height: 22,
      fill: css(SELECTION_COLOR)
    })
  })

  test('padding value hatches that side in blue and labels its size', () => {
    const { graph, frame } = setup()
    const shapes = autoLayoutHoverLayer(
      context(graph, { nodeId: frame.id, kind: 'padding-value', side: 'left' })
    )
    expect(shapes.find((shape) => shape.type === 'rect')).toMatchObject({
      x: 210,
      y: 120,
      width: 80,
      height: 200,
      fill: css(AUTO_LAYOUT_HOVER_BLUE_FILL)
    })
    expect(lines(shapes, AUTO_LAYOUT_HOVER_BLUE, 1).length).toBeGreaterThan(0)
    expect(shapes.find((shape) => shape.type === 'text')).toMatchObject({ text: '40' })
  })

  test('children hover outlines each child with a dotted line', () => {
    const { graph, frame } = setup()
    const shapes = autoLayoutHoverLayer(context(graph, { nodeId: frame.id, kind: 'children' }))
    const groups = shapes.filter((shape) => shape.type === 'group')
    expect(groups).toHaveLength(2)
    const [first] = groups
    expect(first.type === 'group' && first.matrix?.slice(0, 6)).toEqual([2, 0, 290, 0, 2, 140])
    expect(first.type === 'group' && first.children[0]).toMatchObject({ dash: [1.75, 1.25] })
  })
})

describe('stripeSegments', () => {
  test('45° stripes every gap pixels, each kept inside the rectangle', () => {
    const segments = stripeSegments(0, 0, 20, 10, 8)
    // Stripes start at −10, −2, 6, 14 along the bottom edge; the first only touches a corner.
    expect(segments).toEqual([
      [0, 8, 8, 0],
      [6, 10, 16, 0],
      [14, 10, 20, 4]
    ])
  })

  test('an empty rectangle has no stripes', () => {
    expect(stripeSegments(0, 0, 0, 10)).toEqual([])
    expect(stripeSegments(0, 5, 10, 5)).toEqual([])
  })
})
