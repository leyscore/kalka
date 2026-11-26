import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'
import { IDENTITY_GRADIENT_TRANSFORM } from '@kalka/scene-graph/gradient'

import { gradientLayer } from '#vue/canvas/svg-overlay/layers/gradient'
import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'

function setup(type: 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL') {
  const graph = new SceneGraph()
  const pageId = graph.getPages()[0].id
  const rect = graph.createNode('RECTANGLE', pageId, {
    x: 10,
    y: 20,
    width: 200,
    height: 100,
    fills: [
      {
        type,
        color: { r: 0, g: 0, b: 0, a: 1 },
        opacity: 1,
        visible: true,
        gradientTransform: IDENTITY_GRADIENT_TRANSFORM,
        gradientStops: [
          { color: { r: 1, g: 0, b: 0, a: 1 }, position: 0 },
          { color: { r: 0, g: 0, b: 1, a: 1 }, position: 1 }
        ]
      }
    ]
  })
  const context: OverlayContext = {
    graph,
    view: { panX: 0, panY: 0, zoom: 2 },
    overlays: {},
    selectedIds: new Set([rect.id]),
    measureText: (text, fontSize) => text.length * fontSize * 0.5
  }
  const open = () => {
    context.overlays = {
      gradientEdit: {
        nodeId: rect.id,
        paint: 'fills',
        index: 0,
        activeStop: 1,
        handle: null,
        dragging: false
      }
    }
  }
  return { context, open }
}

const swatches = (shapes: ReturnType<typeof gradientLayer>) =>
  shapes.flatMap((shape) =>
    shape.type === 'ellipse' && shape.stroke ? [[shape.cx, shape.cy, shape.fill]] : []
  )

describe('gradient handles overlay', () => {
  test('draws nothing until the gradient’s picker is open', () => {
    const { context } = setup('GRADIENT_LINEAR')
    expect(gradientLayer(context)).toEqual([])
  })

  test('draws the line of a linear gradient with its ends and stops, on screen', () => {
    const { context, open } = setup('GRADIENT_LINEAR')
    open()
    const shapes = gradientLayer(context)
    expect(shapes.some((shape) => shape.type === 'line')).toBe(true)
    expect(swatches(shapes)).toEqual([
      [20, 140, 'rgb(255, 255, 255)'],
      [420, 140, 'rgb(255, 255, 255)'],
      [20, 140, 'rgb(255, 0, 0)'],
      [420, 140, 'rgb(0, 0, 255)']
    ])
  })

  test('draws the ellipse and width handle of a radial gradient', () => {
    const { context, open } = setup('GRADIENT_RADIAL')
    open()
    const shapes = gradientLayer(context)
    expect(shapes.some((shape) => shape.type === 'path')).toBe(true)
    expect(swatches(shapes).slice(0, 3)).toEqual([
      [220, 140, 'rgb(255, 255, 255)'],
      [420, 140, 'rgb(255, 255, 255)'],
      [220, 240, 'rgb(255, 255, 255)']
    ])
  })
})
