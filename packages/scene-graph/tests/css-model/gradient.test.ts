import { describe, expect, test } from 'bun:test'

import type { Fill, GradientTransform } from '@kalka/scene-graph'
import { fillLayerToCSS, linearGradientFill } from '@kalka/scene-graph/css-model'
import {
  DEFAULT_GRADIENT_TRANSFORM,
  IDENTITY_GRADIENT_TRANSFORM,
  gradientPoint,
  linearGradientTransform
} from '@kalka/scene-graph/gradient'

const PURPLE = 'rgb(139, 92, 246)'
const PINK = 'rgb(236, 72, 153)'

describe('CSS linear gradients as fills', () => {
  test('a left to right gradient runs across the box, its stops spread evenly', () => {
    const fill = linearGradientFill(`linear-gradient(90deg, ${PURPLE}, ${PINK})`, 200, 100)
    expect(fill?.type).toBe('GRADIENT_LINEAR')
    expect(fill?.gradientStops?.map((stop) => stop.position)).toEqual([0, 1])
    const t = fill?.gradientTransform ?? IDENTITY_GRADIENT_TRANSFORM
    const start = gradientPoint(t, { x: 0, y: 0.5 })
    const end = gradientPoint(t, { x: 1, y: 0.5 })
    expect([start.x, start.y, end.x, end.y].map((value) => +value.toFixed(6) + 0)).toEqual([
      0, 0.5, 1, 0.5
    ])
  })

  test('keywords, positions and a default direction read as CSS draws them', () => {
    const toBottom = linearGradientFill(
      `linear-gradient(${PURPLE}, ${PINK} 40%, ${PURPLE})`,
      100,
      100
    )
    expect(toBottom?.gradientStops?.map((stop) => stop.position)).toEqual([0, 0.4, 1])
    const down = gradientPoint(toBottom?.gradientTransform ?? IDENTITY_GRADIENT_TRANSFORM, {
      x: 0,
      y: 0.5
    })
    expect(down.x).toBeCloseTo(0.5)
    expect(down.y).toBeCloseTo(0)
    const toLeft = linearGradientFill(`linear-gradient(to left, ${PURPLE}, ${PINK})`, 100, 100)
    expect(gradientPoint(toLeft?.gradientTransform ?? IDENTITY_GRADIENT_TRANSFORM, { x: 0, y: 0.5 }).x).toBeCloseTo(1)
  })

  test('the export writes an imported gradient back as it was', () => {
    for (const angle of [0, 45, 90, 135, 200]) {
      const css = `linear-gradient(${angle}deg, ${PURPLE} 0%, ${PINK} 100%)`
      const fill = linearGradientFill(css, 320, 120)
      expect(fill && fillLayerToCSS(fill, 320, 120)).toBe(
        `linear-gradient(${angle}deg, #8B5CF6 0%, #EC4899 100%)`
      )
    }
  })

  test('anything but a linear gradient is not a fill', () => {
    expect(linearGradientFill('none', 100, 100)).toBeNull()
    expect(linearGradientFill(`radial-gradient(${PURPLE}, ${PINK})`, 100, 100)).toBeNull()
    expect(linearGradientFill(`linear-gradient(90deg, ${PURPLE}, ${PINK})`, 0, 100)).toBeNull()
  })
})

const RED = { r: 1, g: 0, b: 0, a: 1 }
const BLUE = { r: 0, g: 0, b: 1, a: 1 }

function figmaGradient(type: Fill['type'], gradientTransform: GradientTransform): Fill {
  return {
    type,
    color: RED,
    opacity: 1,
    visible: true,
    gradientStops: [
      { color: RED, position: 0 },
      { color: BLUE, position: 1 }
    ],
    gradientTransform
  }
}

// Figma's gradientTransform maps the layer's unit square onto gradient space, where a linear
// gradient runs from (0, 0.5) to (1, 0.5) and the others are centred on (0.5, 0.5).
describe("gradients in Figma's transform convention as CSS", () => {
  test("Figma's default linear gradient starts at the top", () => {
    const fill = figmaGradient('GRADIENT_LINEAR', DEFAULT_GRADIENT_TRANSFORM)
    expect(fillLayerToCSS(fill, 200, 100)).toBe('linear-gradient(180deg, #FF0000 0%, #0000FF 100%)')
  })

  test('an asymmetric linear gradient keeps its stops where Figma draws them', () => {
    // From a quarter to three quarters of the width: x' = 2x - 0.5.
    const fill = figmaGradient('GRADIENT_LINEAR', { ...IDENTITY_GRADIENT_TRANSFORM, m00: 2, m02: -0.5 })
    expect(fillLayerToCSS(fill, 200, 100)).toBe('linear-gradient(90deg, #FF0000 25%, #0000FF 75%)')
  })

  test('a rotated linear gradient runs from its start corner', () => {
    const fill = figmaGradient(
      'GRADIENT_LINEAR',
      linearGradientTransform({ x: 1, y: 1 }, { x: 0, y: 0 })
    )
    expect(fillLayerToCSS(fill, 100, 100)).toBe('linear-gradient(315deg, #FF0000 0%, #0000FF 100%)')
  })

  test('an off-centre radial gradient is centred where Figma centres it', () => {
    // Centred on (0.25, 0.5), a quarter of the width and half the height across.
    const fill = figmaGradient('GRADIENT_RADIAL', { ...IDENTITY_GRADIENT_TRANSFORM, m00: 2 })
    expect(fillLayerToCSS(fill, 200, 100)).toBe(
      'radial-gradient(25% 50% at 25% 50%, #FF0000 0%, #0000FF 100%)'
    )
  })

  test('diamond gradients draw as the radial one they are closest to', () => {
    const fill = figmaGradient('GRADIENT_DIAMOND', IDENTITY_GRADIENT_TRANSFORM)
    expect(fillLayerToCSS(fill, 200, 100)).toBe(
      'radial-gradient(50% 50% at 50% 50%, #FF0000 0%, #0000FF 100%)'
    )
  })

  test('an angular gradient starts along its x axis', () => {
    expect(fillLayerToCSS(figmaGradient('GRADIENT_ANGULAR', IDENTITY_GRADIENT_TRANSFORM), 200, 100)).toBe(
      'conic-gradient(from 90deg at 50% 50%, #FF0000 0%, #0000FF 100%)'
    )
    expect(fillLayerToCSS(figmaGradient('GRADIENT_ANGULAR', DEFAULT_GRADIENT_TRANSFORM), 200, 100)).toBe(
      'conic-gradient(from 180deg at 50% 50%, #FF0000 0%, #0000FF 100%)'
    )
  })

  test('a Figma gradient read back from its CSS keeps its direction', () => {
    const fill = figmaGradient('GRADIENT_LINEAR', DEFAULT_GRADIENT_TRANSFORM)
    const back = linearGradientFill(fillLayerToCSS(fill, 200, 100), 200, 100)
    const t = back?.gradientTransform ?? IDENTITY_GRADIENT_TRANSFORM
    const start = gradientPoint(t, { x: 0, y: 0.5 })
    const end = gradientPoint(t, { x: 1, y: 0.5 })
    expect([start.x, start.y, end.x, end.y].map((value) => +value.toFixed(6) + 0)).toEqual([
      0.5, 0, 0.5, 1
    ])
  })
})
