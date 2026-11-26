import type { ImageFilters } from './types'

/** Figma's image adjustments, in the order its panel lists them. */
export const IMAGE_FILTER_KEYS = [
  'exposure',
  'contrast',
  'saturation',
  'temperature',
  'tint',
  'highlights',
  'shadows'
] as const satisfies readonly (keyof ImageFilters)[]

export type ImageFilterKey = (typeof IMAGE_FILTER_KEYS)[number]

/** An adjustment as drawn: within -1 to 1, 0 when unset or not a number. */
export function imageFilterValue(filters: ImageFilters | undefined, key: ImageFilterKey): number {
  const value = filters?.[key] ?? 0
  return Number.isFinite(value) ? Math.max(-1, Math.min(1, value)) : 0
}

/** Whether the adjustments change the image at all. */
export function hasImageFilters(filters: ImageFilters | undefined): boolean {
  return IMAGE_FILTER_KEYS.some((key) => imageFilterValue(filters, key) !== 0)
}

/** A 5×5 color matrix, row-major, acting on (r, g, b, a, 1). */
type Matrix5 = number[]

const IDENTITY: Matrix5 = [
  1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1
]

/** `outer` applied after `inner`. */
function compose(outer: Matrix5, inner: Matrix5): Matrix5 {
  const out = Array.from({ length: 25 }, () => 0)
  for (let row = 0; row < 5; row++)
    for (let col = 0; col < 5; col++)
      for (let k = 0; k < 5; k++) out[row * 5 + col] += outer[row * 5 + k] * inner[k * 5 + col]
  return out
}

/** Each color channel scaled by its factor and moved by `offset`; alpha untouched. */
function channels(scale: [number, number, number], offset = 0): Matrix5 {
  const m = [...IDENTITY]
  for (let channel = 0; channel < 3; channel++) {
    m[channel * 6] = scale[channel]
    m[channel * 5 + 4] = offset
  }
  return m
}

// Rec. 709 luma, which `saturate()` and `feColorMatrix type="saturate"` use.
const LUMA = [0.2126, 0.7152, 0.0722]

function saturation(amount: number): Matrix5 {
  const m = [...IDENTITY]
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 3; col++)
      m[row * 5 + col] = LUMA[col] * (1 - amount) + (row === col ? amount : 0)
  return m
}

/**
 * The adjustments as one color matrix: 20 numbers, four rows of (r, g, b, a, offset) with
 * channels and offsets from 0 to 1, as SVG's `feColorMatrix` and Skia's matrix color filter take
 * them, so the canvas, exports and raster renders draw the same image. Exposure scales light in
 * stops, temperature and tint shift the channel balance, shadows lift or deepen the darks,
 * highlights the lights, then contrast spreads values from the middle grey and saturation from
 * each pixel's luma. Figma's exact curves are not public; these follow their direction and range.
 */
export function imageFilterMatrix(filters: ImageFilters | undefined): number[] {
  const value = (key: ImageFilterKey) => imageFilterValue(filters, key)
  const exposure = 2 ** value('exposure')
  const temperature = value('temperature') * 0.2
  const tint = value('tint') * 0.2
  const shadows = value('shadows') * 0.25
  const highlights = value('highlights') * 0.25
  const contrast = 1 + value('contrast')
  const steps: Matrix5[] = [
    channels([exposure, exposure, exposure]),
    channels([1 + temperature + tint / 4, 1 - tint, 1 - temperature + tint / 4]),
    // Lifting shadows moves black up and leaves white; deepening them pulls black down.
    channels([1 - shadows, 1 - shadows, 1 - shadows], shadows),
    channels([1 + highlights, 1 + highlights, 1 + highlights]),
    channels([contrast, contrast, contrast], 0.5 * (1 - contrast)),
    saturation(1 + value('saturation'))
  ]
  const matrix = steps.reduce((total, step) => compose(step, total), IDENTITY)
  return matrix.slice(0, 20).map((entry) => Math.round(entry * 10_000) / 10_000)
}
