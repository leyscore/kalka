import type { StrokeWidthPoint } from './types'

/** A width profile's points in order along the path, within the path. */
export function sortedWidthProfile(profile: readonly StrokeWidthPoint[]): StrokeWidthPoint[] {
  return profile
    .filter((point) => Number.isFinite(point.position))
    .map((point) => ({
      position: Math.max(0, Math.min(1, point.position)),
      ascent: Math.max(0, point.ascent),
      descent: Math.max(0, point.descent)
    }))
    .sort((a, b) => a.position - b.position)
}
