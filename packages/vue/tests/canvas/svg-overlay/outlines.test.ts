import { describe, expect, test } from 'bun:test'

import { COMPONENT_COLOR, SELECTION_COLOR, SLOT_COLOR } from '@open-pencil/core/constants'
import { SceneGraph } from '@open-pencil/scene-graph'

import {
  codeFocusLayer,
  componentSetBordersLayer,
  layoutOutlinesLayer,
  slotOutlinesLayer
} from '#vue/canvas/svg-overlay/layers/outlines'
import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import { css, type OverlayShape } from '#vue/canvas/svg-overlay/shapes'

const BLUE = css(SELECTION_COLOR)
const PURPLE = css(COMPONENT_COLOR)

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

function flatten(shapes: OverlayShape[]): OverlayShape[] {
  return shapes.flatMap((shape) => (shape.type === 'group' ? flatten(shape.children) : [shape]))
}

function setup() {
  const graph = new SceneGraph()
  const page = graph.getPages()[0].id
  const stack = graph.createNode('FRAME', page, {
    x: 100,
    y: 50,
    width: 200,
    height: 120,
    layoutMode: 'HORIZONTAL'
  })
  const a = graph.createNode('RECTANGLE', stack.id, { width: 20, height: 20 })
  const b = graph.createNode('RECTANGLE', stack.id, { x: 30, width: 20, height: 20 })
  const hidden = graph.createNode('RECTANGLE', stack.id, {
    x: 60,
    width: 20,
    height: 20,
    visible: false
  })
  return { graph, page, stack, a, b, hidden }
}

describe('layout outlines', () => {
  test('hovering a flow layout frame outlines its visible children, dotted', () => {
    const { graph, stack } = setup()
    const shapes = layoutOutlinesLayer(context(graph), stack.id)
    expect(shapes).toHaveLength(2)
    const [outline] = flatten(shapes)
    expect(outline).toMatchObject({
      type: 'rect',
      width: 20,
      height: 20,
      stroke: BLUE,
      strokeWidth: 1,
      dash: [1.75, 1.25]
    })
  })

  test('a single selected child outlines its flow layout parent', () => {
    const { graph, a } = setup()
    const shapes = layoutOutlinesLayer(context(graph, { selectedIds: new Set([a.id]) }), null)
    expect(flatten(shapes)).toEqual([expect.objectContaining({ width: 200, height: 120 })])
    // Placed by the parent's screen matrix: pan + zoom × position.
    expect(shapes[0].type === 'group' && shapes[0].matrix?.slice(0, 6)).toEqual([
      2, 0, 210, 0, 2, 120
    ])
  })

  test('nothing while transforming or dragging a marquee', () => {
    const { graph, stack } = setup()
    expect(
      layoutOutlinesLayer(context(graph, { overlays: { transforming: true } }), stack.id)
    ).toEqual([])
    expect(
      layoutOutlinesLayer(
        context(graph, { overlays: { marquee: { x: 0, y: 0, width: 1, height: 1 } } }),
        stack.id
      )
    ).toEqual([])
  })

  test('a plain frame shows none', () => {
    const graph = new SceneGraph()
    const frame = graph.createNode('FRAME', graph.getPages()[0].id, { width: 10, height: 10 })
    graph.createNode('RECTANGLE', frame.id, { width: 5, height: 5 })
    expect(layoutOutlinesLayer(context(graph), frame.id)).toEqual([])
  })
})

describe('component set borders', () => {
  test('a set without a stroke gets a dashed purple border, rounded in its own units', () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0].id
    const section = graph.createNode('SECTION', page, { width: 500, height: 500 })
    graph.createNode('COMPONENT_SET', section.id, { width: 100, height: 60 })
    const [border] = flatten(componentSetBordersLayer(context(graph), page))
    expect(border).toMatchObject({
      type: 'rect',
      width: 100,
      height: 60,
      rx: 5,
      stroke: PURPLE,
      strokeWidth: 1.5,
      dash: [6, 4]
    })
  })

  test('a set with a visible stroke or hidden draws none', () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0].id
    graph.createNode('COMPONENT_SET', page, {
      width: 100,
      height: 60,
      strokes: [
        { color: { r: 0, g: 0, b: 0, a: 1 }, weight: 1, opacity: 1, visible: true, align: 'INSIDE' }
      ]
    })
    graph.createNode('COMPONENT_SET', page, { width: 100, height: 60, visible: false })
    expect(componentSetBordersLayer(context(graph), page)).toEqual([])
  })
})

describe('code focus', () => {
  test('tints and outlines the focused layer, purple for components', () => {
    const { graph, a } = setup()
    const [shape] = flatten(codeFocusLayer(context(graph, { overlays: { codeFocusNodeId: a.id } })))
    expect(shape).toMatchObject({
      type: 'rect',
      stroke: BLUE,
      strokeWidth: 1,
      fill: css(SELECTION_COLOR, 0.1)
    })
    const component = graph.createNode('COMPONENT', graph.getPages()[0].id, {
      width: 10,
      height: 10
    })
    const [focus] = flatten(
      codeFocusLayer(context(graph, { overlays: { codeFocusNodeId: component.id } }))
    )
    expect(focus).toMatchObject({ stroke: PURPLE })
  })

  test('nothing without a focused layer', () => {
    const { graph } = setup()
    expect(codeFocusLayer(context(graph))).toEqual([])
  })
})

describe('slot outlines', () => {
  function slots() {
    const graph = new SceneGraph()
    const page = graph.getPages()[0].id
    const component = graph.createNode('COMPONENT', page, { width: 100, height: 100 })
    const reference = { field: 'SLOT_CONTENT' as const, propertyId: 'slot' }
    const empty = graph.createNode('FRAME', component.id, {
      width: 40,
      height: 40,
      componentPropertyReferences: [reference]
    })
    const full = graph.createNode('FRAME', component.id, {
      y: 50,
      width: 40,
      height: 40,
      componentPropertyReferences: [{ ...reference, propertyId: 'other' }]
    })
    const content = graph.createNode('RECTANGLE', full.id, { width: 10, height: 10 })
    return { graph, component, empty, full, content }
  }

  test('a selected component outlines its slots, dashed pink, tinting the empty ones', () => {
    const { graph, component } = slots()
    const shapes = slotOutlinesLayer(context(graph, { selectedIds: new Set([component.id]) }), null)
    expect(shapes).toHaveLength(2)
    const flat = flatten(shapes)
    expect(flat.filter((shape) => shape.type === 'rect' && shape.dash)).toEqual([
      expect.objectContaining({ stroke: css(SLOT_COLOR), strokeWidth: 1, dash: [4, 4] }),
      expect.objectContaining({ stroke: css(SLOT_COLOR), strokeWidth: 1, dash: [4, 4] })
    ])
    // Only the empty slot is tinted.
    expect(flat.filter((shape) => shape.type === 'rect' && shape.fill)).toEqual([
      expect.objectContaining({ fill: css(SLOT_COLOR, 0.08), y: 0, height: 40 })
    ])
  })

  test('hovered content outlines the slot it sits in, but not a slot that is itself hovered', () => {
    const { graph, full, content } = slots()
    expect(flatten(slotOutlinesLayer(context(graph), content.id))).toEqual([
      expect.objectContaining({ dash: [4, 4], height: 40 })
    ])
    expect(slotOutlinesLayer(context(graph), full.id)).toEqual([])
  })
})
