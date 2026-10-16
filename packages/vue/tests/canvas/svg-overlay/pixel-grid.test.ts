import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import { pixelGridLayer, type PixelGridViewport } from '#vue/canvas/svg-overlay/layers/pixel-grid'
import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import { css } from '#vue/canvas/svg-overlay/shapes'

const LIGHT_PAGE = { r: 0.96, g: 0.96, b: 0.96, a: 1 }
const DARK_PAGE = { r: 0.118, g: 0.118, b: 0.118, a: 1 }

function context(zoom: number, panX = 0, panY = 0, showPixelGrid = true): OverlayContext {
  return {
    graph: new SceneGraph(),
    view: { panX, panY, zoom },
    overlays: { showPixelGrid },
    selectedIds: new Set(),
    measureText: () => 0
  }
}

const viewport = (patch: Partial<PixelGridViewport> = {}): PixelGridViewport => ({
  width: 40,
  height: 20,
  dpr: 1,
  pageColor: LIGHT_PAGE,
  ...patch
})

function grid(shapes: ReturnType<typeof pixelGridLayer>) {
  const [shape] = shapes
  if (shape?.type !== 'path') throw new Error('no grid')
  const columns = [...shape.d.matchAll(/M([\d.]+) 0V/g)].map((match) => Number(match[1]))
  const rows = [...shape.d.matchAll(/M0 ([\d.]+)H/g)].map((match) => Number(match[1]))
  return { shape, columns, rows }
}

describe('pixel grid', () => {
  test('shows from 800% at 1x, and from 400% at 2x', () => {
    expect(pixelGridLayer(context(7.9), viewport())).toEqual([])
    expect(pixelGridLayer(context(8), viewport())).toHaveLength(1)
    expect(pixelGridLayer(context(4), viewport({ dpr: 2 }))).toHaveLength(1)
  })

  test('hidden when the preference is off', () => {
    expect(pixelGridLayer(context(16, 0, 0, false), viewport())).toEqual([])
  })

  test('one device pixel wide line per document pixel, on the rounded device pixel', () => {
    const { shape, columns, rows } = grid(pixelGridLayer(context(10, 3.6), viewport()))
    // Lines at device pixels round(3.6 + 10k) = 4, 14, 24, 34; centred half a pixel in.
    expect(columns).toEqual([4.5, 14.5, 24.5, 34.5])
    expect(rows).toEqual([0.5, 10.5])
    expect(shape.strokeWidth).toBe(1)
    expect(shape.stroke).toBe(css({ r: 0, g: 0, b: 0, a: 0.053 }))
  })

  test('on a high density screen the lines are one device pixel', () => {
    const { shape, columns } = grid(pixelGridLayer(context(4), viewport({ dpr: 2, width: 10 })))
    expect(shape.strokeWidth).toBe(0.5)
    expect(columns).toEqual([0.25, 4.25, 8.25])
  })

  test('a light line over a dark page', () => {
    const { shape } = grid(pixelGridLayer(context(8), viewport({ pageColor: DARK_PAGE })))
    expect(shape.stroke).toBe(css({ r: 1, g: 1, b: 1, a: 0.142 }))
  })
})
