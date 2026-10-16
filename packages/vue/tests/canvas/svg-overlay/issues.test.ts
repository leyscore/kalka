import { describe, expect, test } from 'bun:test'

import { hitTestIssueMarkers, type RenderOverlays } from '@kalka/core/canvas'
import { ISSUE_ERROR_COLOR, ISSUE_WARNING_COLOR } from '@kalka/core/constants'
import { SceneGraph } from '@kalka/scene-graph'

import {
  issueHighlightLayer,
  issueLayer,
  issueMarkersLayout
} from '#vue/canvas/svg-overlay/layers/issues'
import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import { css, type OverlayShape } from '#vue/canvas/svg-overlay/shapes'

function setup() {
  const graph = new SceneGraph()
  const pageId = graph.getPages()[0].id
  const frame = graph.createNode('FRAME', pageId, { x: 100, y: 50, width: 200, height: 120 })
  return { graph, pageId, frame }
}

function context(graph: SceneGraph, overlays: RenderOverlays): OverlayContext {
  return {
    graph,
    view: { panX: 0, panY: 0, zoom: 1 },
    overlays,
    selectedIds: new Set(),
    measureText: (text) => text.length * 6
  }
}

function flatten(shapes: OverlayShape[]): OverlayShape[] {
  return shapes.flatMap((shape) => (shape.type === 'group' ? flatten(shape.children) : [shape]))
}

const VIEWPORT = { width: 800, height: 600 }

describe('issue overlay', () => {
  test('a marker sits at the top-right corner of its layer and hit tests where drawn', () => {
    const { graph, pageId, frame } = setup()
    const ctx = context(graph, {
      designIssues: {
        markers: [{ nodeId: frame.id, severity: 'error', count: 3 }],
        highlight: null,
        hoveredMarkerKey: null
      }
    })
    const markers = issueMarkersLayout(ctx, { pageId, ...VIEWPORT })
    expect(markers).toHaveLength(1)
    const [marker] = markers
    expect(marker.rect.x).toBe(304)
    expect(marker.rect.y).toBe(30)
    expect(hitTestIssueMarkers(markers, marker.rect.x + 2, marker.rect.y + 2)?.key).toBe(frame.id)

    const shapes = issueLayer(ctx, markers, null)
    const body = shapes.find(
      (shape) => shape.type === 'rect' && shape.fill === css(ISSUE_ERROR_COLOR)
    )
    expect(body?.type === 'rect' && [body.x, body.y, body.width]).toEqual([
      marker.rect.x,
      marker.rect.y,
      marker.rect.width
    ])
    const label = shapes.find((shape) => shape.type === 'text')
    expect(label?.type === 'text' && label.text).toBe('3')
    expect(label?.type === 'text' && label.anchor).toBe('middle')
  })

  test('hover adds a halo; nothing is laid out while drawing a path or for the edited layer', () => {
    const { graph, pageId, frame } = setup()
    const designIssues = {
      markers: [{ nodeId: frame.id, severity: 'warning' as const, count: 1 }],
      highlight: null,
      hoveredMarkerKey: null
    }
    const ctx = context(graph, { designIssues })
    const markers = issueMarkersLayout(ctx, { pageId, ...VIEWPORT })
    const halo = css(ISSUE_WARNING_COLOR, 0.28)
    const has = (shapes: OverlayShape[]) =>
      shapes.some((shape) => shape.type === 'rect' && shape.fill === halo)
    expect(has(issueLayer(ctx, markers, null))).toBe(false)
    expect(has(issueLayer(ctx, markers, frame.id))).toBe(true)

    expect(
      issueMarkersLayout(context(graph, { designIssues, editingTextId: frame.id }), {
        pageId,
        ...VIEWPORT
      })
    ).toEqual([])
  })

  test('an off-screen issue is pinned to the edge with a chevron, clear of the ruler', () => {
    const { graph, pageId } = setup()
    const far = graph.createNode('FRAME', pageId, { x: 5000, y: 200, width: 50, height: 50 })
    const ctx = context(graph, {
      designIssues: {
        markers: [{ nodeId: far.id, severity: 'error', count: 1 }],
        highlight: null,
        hoveredMarkerKey: null
      }
    })
    const [pin] = issueMarkersLayout(ctx, { pageId, ...VIEWPORT }, [], { top: 20, left: 20 })
    expect(pin.direction).toBeDefined()
    expect(pin.rect.x + pin.rect.width).toBeLessThanOrEqual(VIEWPORT.width)
    expect(pin.rect.y).toBeGreaterThanOrEqual(20)
    const triangles = issueLayer(ctx, [pin], null).filter((shape) => shape.type === 'polygon')
    expect(triangles).toHaveLength(2)
  })

  test('the highlight tints and outlines the layer and draws its minimum size', () => {
    const { graph } = setup()
    const page = graph.getPages()[0].id
    const button = graph.createNode('FRAME', page, { x: 10, y: 10, width: 20, height: 20 })
    const ctx = context(graph, {
      designIssues: {
        markers: [],
        highlight: { nodeId: button.id, severity: 'error', minSize: { width: 44, height: 44 } },
        hoveredMarkerKey: null
      }
    })
    const shapes = issueHighlightLayer(ctx)
    expect(shapes).toHaveLength(1)
    const flat = flatten(shapes)
    expect(flat).toHaveLength(3)
    const target = flat.find((shape) => shape.type === 'rect' && shape.dash)
    expect(target?.type === 'rect' && [target.x, target.y, target.width]).toEqual([-12, -12, 44])
    expect(issueHighlightLayer(context(graph, {}))).toEqual([])
  })
})
