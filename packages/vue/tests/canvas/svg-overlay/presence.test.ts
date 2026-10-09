import { describe, expect, test } from 'bun:test'

import type { PresenceCursor } from '@open-pencil/core/canvas'
import { SceneGraph } from '@open-pencil/scene-graph'

import { fitLabel, presenceLayer } from '#vue/canvas/svg-overlay/layers/presence'
import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import { css } from '#vue/canvas/svg-overlay/shapes'

const RED = { r: 1, g: 0, b: 0, a: 1 }
const WHITE = css({ r: 1, g: 1, b: 1, a: 1 })
const measureText = (text: string) => Array.from(text).length * 6

function context(graph: SceneGraph, cursors: PresenceCursor[]): OverlayContext {
  return {
    graph,
    view: { panX: 10, panY: 20, zoom: 2 },
    overlays: { presenceCursors: cursors },
    selectedIds: new Set(),
    measureText
  }
}

describe('presence overlay', () => {
  test('a person gets an outlined arrow and a filled pill sized to the name', () => {
    const graph = new SceneGraph()
    const shapes = presenceLayer(
      context(graph, [{ kind: 'person', name: 'Ada', color: RED, x: 5, y: 5 }])
    )
    const [outline, fill, pill, text] = shapes
    expect(outline.type === 'polygon' && [outline.points[0], outline.points[1]]).toEqual([20, 30])
    expect(outline.type === 'polygon' && outline.stroke).toBe(WHITE)
    expect(fill.type === 'polygon' && fill.fill).toBe(css(RED))
    expect(pill.type === 'rect' && [pill.x, pill.y, pill.width, pill.height]).toEqual([
      28, 40, 26, 14
    ])
    expect(text.type === 'text' && [text.text, text.fill]).toEqual(['Ada', WHITE])
  })

  test('an agent pill is outlined with a sparkle; peers outline their selection', () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0].id
    const frame = graph.createNode('FRAME', page, { x: 0, y: 0, width: 10, height: 10 })
    const shapes = presenceLayer(
      context(graph, [
        {
          kind: 'agent',
          name: 'Bot',
          color: RED,
          x: 0,
          y: 0,
          selection: [frame.id],
          outline: [{ x: 1, y: 1, width: 2, height: 2 }]
        }
      ])
    )
    const [streamed, selected] = shapes
    expect(streamed.type === 'rect' && [streamed.x, streamed.y, streamed.width]).toEqual([
      12, 22, 4
    ])
    expect(selected.type === 'polygon' && selected.points).toEqual([10, 20, 30, 20, 30, 40, 10, 40])
    const pill = shapes.find((shape) => shape.type === 'rect' && shape.rx === 4)
    expect(pill?.type === 'rect' && [pill.fill, pill.stroke]).toEqual([WHITE, css(RED)])
    // Name + sparkle badge (11) + padding.
    expect(pill?.type === 'rect' && pill.width).toBe(18 + 11 + 8)
    const text = shapes.find((shape) => shape.type === 'text')
    expect(text?.type === 'text' && text.fill).toBe(css(RED))
  })

  test('long names end with an ellipsis within the maximum width', () => {
    const fitted = fitLabel(measureText, 'x'.repeat(40), 10, 160)
    expect(fitted.text.endsWith('…')).toBe(true)
    expect(fitted.width).toBeLessThanOrEqual(160)
    expect(fitLabel(measureText, 'short', 10, 160)).toEqual({ text: 'short', width: 30 })
  })
})
