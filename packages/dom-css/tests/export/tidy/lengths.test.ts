import { describe, expect, test } from 'bun:test'

import { layoutLength, tidyLengths } from '#dom-css/export/tidy/lengths'

/** Chromium lays a length out in sixty-fourths of a pixel, truncating the float it parsed. */
const laidOut = (value: number) => Math.trunc(Math.fround(value) * 64) + 0

const decimals = (value: number) => (String(value).split('.')[1] ?? '').length

describe('layout lengths', () => {
  test('measured lengths keep two decimals at most, where the browser lays them out the same', () => {
    expect(layoutLength(7482.765625)).toBe(7482.77)
    expect(layoutLength(109.0625)).toBe(109.07)
    expect(layoutLength(52.28125)).toBe(52.29)
    expect(layoutLength(-115.1875)).toBe(-115.2)
    expect(layoutLength(120.0001)).toBe(120)
    expect(layoutLength(0.01)).toBe(0)
    expect(layoutLength(28)).toBe(28)
  })

  test('every sixty-fourth of a pixel, and lengths between them, lay out where they did', () => {
    for (let step = -4000; step <= 4000; step += 3) {
      for (const value of [step / 64, step / 64 + 0.0071, step * 0.37]) {
        const tidy = layoutLength(value)
        expect(laidOut(tidy)).toBe(laidOut(value))
        expect(decimals(tidy)).toBeLessThanOrEqual(2)
      }
    }
  })

  test('only box lengths change; text and paint keep their exact value', () => {
    const style = tidyLengths({
      width: '109.0625px',
      padding: '8.015625px 16px',
      left: '0px',
      'font-size': '14.4375px',
      'border-radius': '374.3985px',
      'max-width': 'var(--size-max)'
    })
    expect(style).toEqual({
      width: '109.07px',
      padding: '8.02px 16px',
      left: '0',
      'font-size': '14.4375px',
      'border-radius': '374.3985px',
      'max-width': 'var(--size-max)'
    })
  })
})
