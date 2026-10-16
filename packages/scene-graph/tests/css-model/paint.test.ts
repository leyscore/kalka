import { describe, expect, test } from 'bun:test'

import type { Fill, Stroke } from '@kalka/scene-graph'
import {
  colorToFillFromCSS,
  fillLayerToCSS,
  fillToCSS,
  strokeColorToCSS
} from '@kalka/scene-graph/css-model'

const RED: Fill = {
  type: 'SOLID',
  color: { r: 1, g: 0.2, b: 0.2, a: 0.5 },
  opacity: 0.8,
  visible: true
}

/** The alpha a CSS color draws with, read back the way the canvas reads it. */
function drawnAlpha(css: string | undefined) {
  return colorToFillFromCSS(css).at(0)?.opacity
}

describe('translucent solid paints as CSS', () => {
  test('a fill draws with its color alpha and its opacity together', () => {
    expect(drawnAlpha(fillToCSS(RED))).toBeCloseTo(0.4)
  })

  test('a stroke draws with its color alpha and its opacity together', () => {
    const stroke: Stroke = { ...RED, weight: 1, align: 'INSIDE' }
    expect(drawnAlpha(strokeColorToCSS(stroke))).toBeCloseTo(0.4)
  })

  test('a stacked fill layer draws with its color alpha and its opacity together', () => {
    const layer = fillLayerToCSS(RED, 100, 100)
    const color = /^linear-gradient\((.+), \1\)$/.exec(layer ?? '')?.[1]
    expect(drawnAlpha(color)).toBeCloseTo(0.4)
  })
})
