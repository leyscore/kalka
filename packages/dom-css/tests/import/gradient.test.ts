import { describe, expect, test } from 'bun:test'

import { fillLayerToCSS } from '#dom-css/export/css'
import { linearGradientFill } from '#dom-css/import/gradient'

const PURPLE = 'rgb(139, 92, 246)'
const PINK = 'rgb(236, 72, 153)'

describe('CSS linear gradients as fills', () => {
  test('a left to right gradient runs across the box, its stops spread evenly', () => {
    const fill = linearGradientFill(`linear-gradient(90deg, ${PURPLE}, ${PINK})`, 200, 100)
    expect(fill?.type).toBe('GRADIENT_LINEAR')
    expect(fill?.gradientStops?.map((stop) => stop.position)).toEqual([0, 1])
    const t = fill?.gradientTransform
    expect(
      [t?.m00, t?.m02, t?.m10, t?.m12].map((value) => Math.round((value ?? NaN) * 1e6) / 1e6 + 0)
    ).toEqual([1, 0, 0, 0.5])
  })

  test('keywords, positions and a default direction read as CSS draws them', () => {
    const toBottom = linearGradientFill(
      `linear-gradient(${PURPLE}, ${PINK} 40%, ${PURPLE})`,
      100,
      100
    )
    expect(toBottom?.gradientStops?.map((stop) => stop.position)).toEqual([0, 0.4, 1])
    expect(toBottom?.gradientTransform?.m10).toBeCloseTo(1)
    const toLeft = linearGradientFill(`linear-gradient(to left, ${PURPLE}, ${PINK})`, 100, 100)
    expect(toLeft?.gradientTransform?.m00).toBeCloseTo(-1)
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
