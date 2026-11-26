import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import { smartSelectionLayer } from '#vue/canvas/svg-overlay/layers/smart-selection'

function setup(xs: number[], overlays: OverlayContext['overlays'] = { smartSelection: true }) {
  const graph = new SceneGraph()
  const pageId = graph.getPages()[0].id
  const ids = xs.map(
    (x) => graph.createNode('RECTANGLE', pageId, { x, y: 0, width: 40, height: 40 }).id
  )
  const context: OverlayContext = {
    graph,
    view: { panX: 0, panY: 0, zoom: 1 },
    overlays,
    selectedIds: new Set(ids),
    measureText: (text, fontSize) => text.length * fontSize * 0.5
  }
  return { ids, context }
}

describe('smart selection overlay', () => {
  test('draws a handle in each gap and a dot at each layer centre', () => {
    const { context } = setup([0, 60, 120])
    const shapes = smartSelectionLayer(context)
    const bars = shapes.filter((shape) => shape.type === 'line')
    expect(bars.map((bar) => bar.type === 'line' && bar.x1)).toEqual([50, 110])
    const dots = shapes.filter((shape) => shape.type === 'ellipse')
    expect(dots.map((dot) => dot.type === 'ellipse' && dot.cx)).toEqual([20, 80, 140])
  })

  test('shows the spacing while a gap is dragged', () => {
    const { context } = setup([0, 60, 120], {
      smartSelection: true,
      smartSelectionHandle: { kind: 'gap', axis: 'x', dragging: true }
    })
    expect(smartSelectionLayer(context).find((shape) => shape.type === 'text')).toMatchObject({
      text: '20'
    })
  })

  test('shows only the Tidy up button for an uneven selection', () => {
    const { context } = setup([0, 50, 130])
    const shapes = smartSelectionLayer(context)
    expect(shapes.some((shape) => shape.type === 'ellipse')).toBe(false)
    expect(shapes[0]).toMatchObject({ type: 'rect', x: 178, y: 48, width: 20, height: 20 })
  })

  test('draws nothing outside the Select tool or while layers move', () => {
    expect(smartSelectionLayer(setup([0, 60, 120], {}).context)).toEqual([])
    const moving = setup([0, 60, 120], { smartSelection: true, transforming: true })
    expect(smartSelectionLayer(moving.context)).toEqual([])
  })
})
