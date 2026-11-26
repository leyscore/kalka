import { sortedWidthProfile, type StrokeWidthPoint } from '@kalka/scene-graph'

/** How far a stroke reaches on each side of its path, in pixels. */
export interface SideWidths {
  ascent: number
  descent: number
}

/** Figma Draw's width profile presets, each as widths (multiples of the weight) along the path. */
export const STROKE_WIDTH_PRESETS = {
  uniform: [],
  wedge: [
    [0, 0.05],
    [1, 1]
  ],
  taper: [
    [0, 1],
    [0.55, 0.85],
    [1, 0.05]
  ],
  eye: [
    [0, 0.05],
    [0.5, 1],
    [1, 0.05]
  ],
  rounded: [
    [0, 0.3],
    [0.12, 0.85],
    [0.5, 1],
    [0.88, 0.85],
    [1, 0.3]
  ],
  pinch: [
    [0, 1],
    [0.5, 0.2],
    [1, 1]
  ]
} as const satisfies Record<string, ReadonlyArray<readonly [number, number]>>

export type StrokeWidthPreset = keyof typeof STROKE_WIDTH_PRESETS

export const STROKE_WIDTH_PRESET_IDS = Object.keys(STROKE_WIDTH_PRESETS) as StrokeWidthPreset[]

/** A preset as the points a layer keeps: the same width on both sides of the path. */
export function strokeWidthPreset(preset: StrokeWidthPreset): StrokeWidthPoint[] {
  return STROKE_WIDTH_PRESETS[preset].map(([position, width]) => ({
    position,
    ascent: width / 2,
    descent: width / 2
  }))
}

const SAME = 1e-4

/** The preset a profile is, if it is one. */
export function matchStrokeWidthPreset(
  profile: readonly StrokeWidthPoint[]
): StrokeWidthPreset | null {
  if (profile.length === 0) return 'uniform'
  return (
    STROKE_WIDTH_PRESET_IDS.find((preset) => {
      const points = strokeWidthPreset(preset)
      return (
        points.length === profile.length &&
        points.every(
          (point, index) =>
            Math.abs(point.position - profile[index].position) < SAME &&
            Math.abs(point.ascent - profile[index].ascent) < SAME &&
            Math.abs(point.descent - profile[index].descent) < SAME
        )
      )
    }) ?? null
  )
}

/**
 * Slopes for a monotone cubic through the points (Fritsch–Carlson), so widths change smoothly
 * between points without overshooting them, and points in a straight line stay on it.
 */
function monotoneSlopes(xs: number[], ys: number[]): number[] {
  const n = xs.length
  const deltas: number[] = []
  for (let index = 0; index < n - 1; index++) {
    const dx = xs[index + 1] - xs[index]
    deltas.push(dx > 0 ? (ys[index + 1] - ys[index]) / dx : 0)
  }
  const slopes = xs.map((_, index) => {
    if (index === 0) return deltas[0] ?? 0
    if (index === n - 1) return deltas[n - 2] ?? 0
    const before = deltas[index - 1]
    const after = deltas[index]
    return before * after <= 0 ? 0 : (before + after) / 2
  })
  for (let index = 0; index < n - 1; index++) {
    const delta = deltas[index]
    if (delta === 0) {
      slopes[index] = 0
      slopes[index + 1] = 0
      continue
    }
    const a = slopes[index] / delta
    const b = slopes[index + 1] / delta
    const sum = a * a + b * b
    if (sum > 9) {
      const tau = 3 / Math.sqrt(sum)
      slopes[index] = tau * a * delta
      slopes[index + 1] = tau * b * delta
    }
  }
  return slopes
}

function interpolate(xs: number[], ys: number[], slopes: number[], x: number): number {
  if (x <= xs[0]) return ys[0]
  const last = xs.length - 1
  if (x >= xs[last]) return ys[last]
  let index = 0
  while (index < last - 1 && x > xs[index + 1]) index++
  const h = xs[index + 1] - xs[index]
  if (h <= 0) return ys[index + 1]
  const t = (x - xs[index]) / h
  const t2 = t * t
  const t3 = t2 * t
  return (
    (2 * t3 - 3 * t2 + 1) * ys[index] +
    (t3 - 2 * t2 + t) * h * slopes[index] +
    (-2 * t3 + 3 * t2) * ys[index + 1] +
    (t3 - t2) * h * slopes[index + 1]
  )
}

/**
 * A function giving how far the stroke reaches on each side at `t` (0–1 along the path), in
 * multiples of the weight. Without points, half the weight on each side.
 */
export function widthProfileFunction(
  profile: readonly StrokeWidthPoint[]
): (t: number) => SideWidths {
  const points = sortedWidthProfile(profile)
  if (points.length === 0) return () => ({ ascent: 0.5, descent: 0.5 })
  if (points.length === 1) return () => ({ ascent: points[0].ascent, descent: points[0].descent })
  const xs = points.map((point) => point.position)
  const ascents = points.map((point) => point.ascent)
  const descents = points.map((point) => point.descent)
  const ascentSlopes = monotoneSlopes(xs, ascents)
  const descentSlopes = monotoneSlopes(xs, descents)
  return (t) => ({
    ascent: Math.max(0, interpolate(xs, ascents, ascentSlopes, t)),
    descent: Math.max(0, interpolate(xs, descents, descentSlopes, t))
  })
}

/** Whether a profile draws the stroke any differently from its weight. */
export function hasWidthProfile(profile: readonly StrokeWidthPoint[]): boolean {
  return profile.some(
    (point) => Math.abs(point.ascent - 0.5) > SAME || Math.abs(point.descent - 0.5) > SAME
  )
}
