import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@open-pencil/scene-graph'

import { guideRedlineLayer, guidesLayer } from '#vue/canvas/svg-overlay/layers/guides'
import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import { css } from '#vue/canvas/svg-overlay/shapes'

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
  const page = graph.getPages()[0]
  graph.updateNode(page.id, { guides: [{ id: 'p', axis: 'x', position: 50 }] })
  const frame = graph.createNode('FRAME', page.id, {
    x: 100,
    y: 50,
    width: 200,
    height: 120,
    guides: [{ id: 'f', axis: 'y', position: 10 }]
  })
  return { graph, page, frame, size: { pageId: page.id, width: 800, height: 600 } }
}

describe('SVG guides', () => {
  test('a page guide is a one-pixel box across the view; a frame guide spans its frame', () => {
    const { graph, size } = setup()
    const shapes = guidesLayer(context(graph), size)
    expect(shapes).toEqual([
      {
        type: 'rect',
        x: 110,
        y: 0,
        width: 1,
        height: 600,
        stroke: css({ r: 0.85, g: 0.29, b: 0.2, a: 0.78 }),
        strokeWidth: 1
      },
      expect.objectContaining({ type: 'line', x1: 210, y1: 140, x2: 610, y2: 140 })
    ])
  })

  test('selected and hovered guides change color; a dragged frame guide extends dashed', () => {
    const { graph, frame, page, size } = setup()
    const blue = css({ r: 0.1, g: 0.45, b: 0.95, a: 1 })
    const hovered = guidesLayer(
      context(graph, {
        overlays: {
          guides: {
            preview: null,
            hovered: { ownerId: page.id, guideId: 'p' },
            selected: { ownerId: frame.id, guideId: 'f' },
            redline: null
          }
        }
      }),
      size
    )
    expect(hovered[0]).toMatchObject({ stroke: css({ r: 0.96, g: 0.4, b: 0.26, a: 1 }) })
    expect(hovered[1]).toMatchObject({ stroke: blue })

    const dragging = guidesLayer(
      context(graph, {
        overlays: {
          guides: {
            preview: {
              ownerId: frame.id,
              axis: 'y',
              position: 20,
              source: { ownerId: frame.id, guideId: 'f' }
            },
            hovered: null,
            selected: null,
            redline: null
          }
        }
      }),
      size
    )
    // The page guide, then the frame guide at its preview position and its dashed extension.
    expect(dragging).toHaveLength(3)
    expect(dragging[1]).toMatchObject({ type: 'line', y1: 160, y2: 160, stroke: blue })
    expect(dragging[2]).toMatchObject({ x1: 0, x2: 800, y1: 160, dash: [3, 4], stroke: blue })
  })

  test('the redline is a measured segment with its distance', () => {
    const { graph, frame } = setup()
    const shapes = guideRedlineLayer(
      context(graph, {
        overlays: {
          guides: {
            preview: null,
            hovered: null,
            selected: null,
            redline: {
              segment: { axis: 'x', from: 0, to: 100, cross: 50, value: 100 },
              targetId: frame.id
            }
          }
        }
      })
    )
    expect(shapes[0]).toMatchObject({ type: 'line', x1: 10, y1: 120, x2: 210, y2: 120 })
    expect(shapes.some((shape) => shape.type === 'text' && shape.text === '100')).toBe(true)
  })

  test('nothing without guides', () => {
    const graph = new SceneGraph()
    expect(guidesLayer(context(graph), { width: 10, height: 10 })).toEqual([])
    expect(guideRedlineLayer(context(graph))).toEqual([])
  })
})
