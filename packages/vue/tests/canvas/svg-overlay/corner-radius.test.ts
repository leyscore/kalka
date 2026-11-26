import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import { cornerRadiusLayer } from '#vue/canvas/svg-overlay/layers/corner-radius'
import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'

function setup(overlays: OverlayContext['overlays'] = {}, zoom = 1) {
  const graph = new SceneGraph()
  const pageId = graph.getPages()[0].id
  const rect = graph.createNode('RECTANGLE', pageId, {
    x: 10,
    y: 20,
    width: 200,
    height: 100,
    cornerRadius: 24
  })
  const context: OverlayContext = {
    graph,
    view: { panX: 0, panY: 0, zoom },
    overlays,
    selectedIds: new Set([rect.id]),
    measureText: (text, fontSize) => text.length * fontSize * 0.5
  }
  return { rect, context }
}

describe('corner radius handles overlay', () => {
  test('draws a dot on each corner’s radius while the pointer is over the layer', () => {
    const { rect, context } = setup()
    expect(cornerRadiusLayer(context)).toEqual([])
    context.overlays = { cornerRadiusHandle: { nodeId: rect.id, corner: null, dragging: false } }
    const dots = cornerRadiusLayer(context).filter((shape) => shape.type === 'ellipse')
    expect(dots.map((dot) => dot.type === 'ellipse' && [dot.cx, dot.cy])).toEqual([
      [34, 44],
      [186, 44],
      [186, 96],
      [34, 96]
    ])
  })

  test('labels the radius of the dragged handle and fills it in', () => {
    const { rect, context } = setup()
    context.overlays = { cornerRadiusHandle: { nodeId: rect.id, corner: 'ne', dragging: true } }
    const shapes = cornerRadiusLayer(context)
    expect(shapes.find((shape) => shape.type === 'text')).toMatchObject({ text: '24' })
    const fills = shapes.flatMap((shape) => (shape.type === 'ellipse' ? [shape.fill] : []))
    expect(fills[1]).not.toBe(fills[0])
    expect(new Set([fills[0], fills[2], fills[3]]).size).toBe(1)
  })

  test('hides while the layer is small on screen or moves', () => {
    const small = setup({}, 0.3)
    small.context.overlays = {
      cornerRadiusHandle: { nodeId: small.rect.id, corner: null, dragging: false }
    }
    expect(cornerRadiusLayer(small.context)).toEqual([])
    const moving = setup()
    moving.context.overlays = {
      transforming: true,
      cornerRadiusHandle: { nodeId: moving.rect.id, corner: null, dragging: false }
    }
    expect(cornerRadiusLayer(moving.context)).toEqual([])
  })
})
