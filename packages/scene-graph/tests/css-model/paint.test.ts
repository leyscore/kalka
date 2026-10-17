import { describe, expect, test } from 'bun:test'

import type { Effect, Fill, Stroke } from '@kalka/scene-graph'
import { parseCSSShadows } from '@kalka/scene-graph/css'
import {
  colorToFillFromCSS,
  fillLayerToCSS,
  fillToCSS,
  strokeColorToCSS,
  textShadowToCSS
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

describe('text shadows as CSS', () => {
  const shadow = (y: number, spread: number): Effect => ({
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0.5, a: 0.4 },
    offset: { x: 0, y },
    radius: 5,
    spread,
    visible: true,
    blendMode: 'NORMAL'
  })

  test('every drop shadow follows the letters, without the spread text-shadow rejects', () => {
    const css = textShadowToCSS([shadow(4, 2), shadow(1, 0)])
    const layers = css?.split(/,\s*(?![^(]*\))/) ?? []
    expect(layers).toHaveLength(2)
    // `text-shadow` takes an offset and a blur: a fourth length invalidates the declaration.
    for (const layer of layers) expect(layer.match(/-?[\d.]+px/g)).toHaveLength(3)
    expect(parseCSSShadows(css).map((read) => read.offset.y)).toEqual([4, 1])
  })

  test('a text layer without visible drop shadows writes none', () => {
    expect(textShadowToCSS([{ ...shadow(4, 0), visible: false }])).toBeUndefined()
  })
})
