import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import {
  frameOutlinesLayer,
  hiddenLayerOutlinesLayer,
  maskOutlinesLayer
} from '#vue/canvas/svg-overlay/layers/view-outlines'
import type { OverlayShape } from '#vue/canvas/svg-overlay/shapes'

function context(graph: SceneGraph, patch: Partial<OverlayContext> = {}): OverlayContext {
  return {
    graph,
    view: { panX: 0, panY: 0, zoom: 1 },
    overlays: {},
    selectedIds: new Set(),
    measureText: (text) => text.length * 6,
    ...patch
  }
}

function setup() {
  const graph = new SceneGraph()
  const page = graph.getPages()[0].id
  const card = graph.createNode('FRAME', page, { x: 0, y: 0, width: 200, height: 100 })
  const inner = graph.createNode('FRAME', card.id, { x: 10, y: 10, width: 50, height: 50 })
  const mask = graph.createNode('ELLIPSE', card.id, {
    x: 0,
    y: 0,
    width: 40,
    height: 40,
    isMask: true
  })
  const hidden = graph.createNode('RECTANGLE', card.id, {
    x: 100,
    y: 10,
    width: 30,
    height: 30,
    visible: false
  })
  return { graph, page, card, inner, mask, hidden }
}

/** The shapes each group draws, keyed by nothing: what kinds of outlines came out. */
function drawn(shapes: OverlayShape[]): string[] {
  return shapes.flatMap((shape) =>
    shape.type === 'group' ? shape.children.map((child) => child.type) : [shape.type]
  )
}

describe('view outlines', () => {
  test('draw nothing until asked for', () => {
    const { graph, page } = setup()
    const ctx = context(graph)
    expect(frameOutlinesLayer(ctx, page)).toEqual([])
    expect(maskOutlinesLayer(ctx, page)).toEqual([])
    expect(hiddenLayerOutlinesLayer(ctx, page)).toEqual([])
  })

  test('frame outlines outline every shown frame, nested ones too', () => {
    const { graph, page } = setup()
    const shapes = frameOutlinesLayer(
      context(graph, { overlays: { showFrameOutlines: true } }),
      page
    )
    expect(drawn(shapes)).toEqual(['rect', 'rect'])
  })

  test('mask outlines draw the shape of each mask', () => {
    const { graph, page } = setup()
    const shapes = maskOutlinesLayer(context(graph, { overlays: { showMaskOutlines: true } }), page)
    expect(drawn(shapes)).toEqual(['ellipse'])
  })

  test('outline mode draws hidden layers only when asked, dashed', () => {
    const { graph, page, card, inner } = setup()
    const off = context(graph, { overlays: { outlines: { mode: 'all', hiddenLayers: false } } })
    expect(hiddenLayerOutlinesLayer(off, page)).toEqual([])
    const on = context(graph, { overlays: { outlines: { mode: 'all', hiddenLayers: true } } })
    const [group] = hiddenLayerOutlinesLayer(on, page)
    expect(group?.type === 'group' && group.children[0]).toMatchObject({ type: 'rect', width: 30 })
    // In selection-only mode, only what the selection holds.
    const selection = context(graph, {
      overlays: { outlines: { mode: 'selection', hiddenLayers: true } },
      selectedIds: new Set([inner.id])
    })
    expect(hiddenLayerOutlinesLayer(selection, page)).toEqual([])
    expect(
      hiddenLayerOutlinesLayer({ ...selection, selectedIds: new Set([card.id]) }, page)
    ).toHaveLength(1)
  })
})
