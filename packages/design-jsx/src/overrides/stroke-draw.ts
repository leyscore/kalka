import * as v from 'valibot'

import type { SceneNode, StrokeBrush, StrokeWidthPoint } from '@kalka/scene-graph'

/**
 * Figma Draw's stroke settings as props: `strokeWidthProfile` is the stroke's width along its
 * path as points `{ position, ascent, descent }` (or `{ position, width }` for both sides alike),
 * in stroke weights; `strokeBrush` is a brush `{ type, id }` with any of its settings.
 */

const finite = v.pipe(v.number(), v.finite())

const WidthPoint = v.union([
  v.object({ position: finite, ascent: finite, descent: finite }),
  v.pipe(
    v.object({ position: finite, width: finite }),
    v.transform(({ position, width }) => ({ position, ascent: width / 2, descent: width / 2 }))
  )
])

const Brush = v.object({
  type: v.picklist(['STRETCH', 'SCATTER']),
  id: v.string(),
  gap: v.optional(finite),
  wiggle: v.optional(finite),
  sizeJitter: v.optional(finite),
  angularJitter: v.optional(finite),
  rotation: v.optional(finite),
  reverse: v.optional(v.boolean()),
  seed: v.optional(finite)
})

/** A brush's settings where the props leave them out, as a new brush starts. */
function brushDefaults(type: StrokeBrush['type']): Omit<StrokeBrush, 'type' | 'id'> {
  return {
    gap: type === 'SCATTER' ? 1.5 : 0,
    wiggle: 0,
    sizeJitter: 0,
    angularJitter: 0,
    rotation: 0,
    reverse: false,
    seed: 1
  }
}

function widthProfile(value: unknown): StrokeWidthPoint[] | null {
  const parsed = v.safeParse(v.array(WidthPoint), value)
  if (!parsed.success) return null
  return parsed.output
    .map((point) => ({
      position: Math.max(0, Math.min(1, point.position)),
      ascent: Math.max(0, point.ascent),
      descent: Math.max(0, point.descent)
    }))
    .sort((a, b) => a.position - b.position)
}

function brush(value: unknown): StrokeBrush | null | undefined {
  if (value === null || value === 'none') return null
  const parsed = v.safeParse(Brush, value)
  if (!parsed.success) return undefined
  return { ...brushDefaults(parsed.output.type), ...parsed.output }
}

export function applyStrokeDrawOverrides(
  props: Record<string, unknown>,
  o: Partial<SceneNode>
): void {
  const profile = widthProfile(props.strokeWidthProfile)
  if (profile) o.strokeWidthProfile = profile
  if (props.strokeBrush !== undefined) {
    const value = brush(props.strokeBrush)
    if (value !== undefined) o.strokeBrush = value
  }
}
