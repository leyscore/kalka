import type { DesignStyleDeclaration } from '../../types'

/** Browsers lay boxes out in sixty-fourths of a pixel. */
const LAYOUT_UNITS_PER_PX = 64

/** How close to the next sixty-fourth a length may come, for float rounding to leave it alone. */
const UNIT_MARGIN = 1e-3

/** Box lengths, which a browser lays out in sixty-fourths of a pixel. */
const BOX_LENGTH_PROPERTIES: ReadonlySet<string> = new Set([
  'width',
  'height',
  'min-width',
  'min-height',
  'max-width',
  'max-height',
  'left',
  'top',
  'right',
  'bottom',
  'gap',
  'row-gap',
  'column-gap',
  'flex-basis',
  'padding',
  'padding-block',
  'padding-inline',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left'
])

/** One or more plain pixel lengths, such as `12.5px` or `8px 16px`. */
const PIXEL_LIST = /^-?\d*\.?\d+(?:e[+-]?\d+)?px(?:\s+-?\d*\.?\d+(?:e[+-]?\d+)?px)*$/i

/**
 * The sixty-fourths of a pixel a length lays out at: Chromium reads it as a 32-bit float and
 * truncates toward zero, so `52.28px` lays out as 52.265625.
 */
function layoutUnits(value: number): number {
  return Math.trunc(Math.fround(Math.fround(value) * LAYOUT_UNITS_PER_PX))
}

/** Whether a length lays out at `units` without sitting on the edge of the next one. */
function laysOutAt(value: number, units: number): boolean {
  const scaled = Math.abs(Math.fround(value) * LAYOUT_UNITS_PER_PX)
  const fraction = scaled - Math.floor(scaled)
  const onUnit = fraction === 0
  return (
    layoutUnits(value) === units &&
    (onUnit || (fraction > UNIT_MARGIN && 1 - fraction > UNIT_MARGIN))
  )
}

/**
 * The shortest number, at most two decimals, that a browser lays out exactly as `value`: an
 * integer where one does, so `7482.765625` becomes `7482.77` and `120.0001` becomes `120`.
 */
export function layoutLength(value: number): number {
  if (!Number.isFinite(value)) return value
  const units = layoutUnits(value)
  for (const digits of [0, 1, 2]) {
    const scale = 10 ** digits
    const nearest = Math.round(value * scale)
    const candidates = [nearest, nearest - 1, nearest + 1]
      .map((step) => step / scale)
      .sort((a, b) => Math.abs(a - value) - Math.abs(b - value))
    const fit = candidates.find((candidate) => laysOutAt(candidate, units))
    if (fit !== undefined) return Object.is(fit, -0) ? 0 : fit
  }
  return value
}

/** A length as written by hand: `0` without a unit, otherwise its pixels. */
function pixels(value: number): string {
  return value === 0 ? '0' : `${value}px`
}

function tidyPixelList(value: string): string {
  if (!PIXEL_LIST.test(value.trim())) return value
  return value
    .trim()
    .split(/\s+/)
    .map((length) => pixels(layoutLength(Number.parseFloat(length))))
    .join(' ')
}

/** A plain pixel length's number, `0` included, or null for anything else. */
export function pixelValue(value: string | undefined): number | null {
  const trimmed = value?.trim()
  if (trimmed === '0') return 0
  if (trimmed === undefined || !PIXEL_LIST.test(trimmed) || /\s/.test(trimmed)) return null
  return Number.parseFloat(trimmed)
}

/**
 * Lengths written as a developer would write them, laying out exactly as before: box lengths
 * keep only the decimals the browser's layout resolves. Text and paint lengths, such as a
 * corner radius or a font size, draw at their exact value and stay as they are.
 */
export function tidyLengths(style: DesignStyleDeclaration): DesignStyleDeclaration {
  const tidy: DesignStyleDeclaration = {}
  for (const [name, value] of Object.entries(style))
    tidy[name] = BOX_LENGTH_PROPERTIES.has(name) ? tidyPixelList(value) : value
  return tidy
}
