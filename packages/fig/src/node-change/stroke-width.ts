import * as v from 'valibot'

import type { NodeChange } from '@kalka/kiwi/fig/codec'
import type { SceneNode, StrokeWidthPoint } from '@kalka/scene-graph'

const VariableWidthPointSchema = v.object({
  position: v.optional(v.pipe(v.number(), v.finite()), 0),
  ascent: v.optional(v.pipe(v.number(), v.finite()), 0.5),
  descent: v.optional(v.pipe(v.number(), v.finite()), 0.5)
})

/**
 * Figma's `variableWidthPoints` as a layer's width profile: each point's position along the path
 * and how far the stroke reaches on each side, as fractions of the weight. Points that do not
 * read are left out.
 */
export function importStrokeWidthProfile(nc: NodeChange): StrokeWidthPoint[] {
  const points = nc.variableWidthPoints
  if (!Array.isArray(points)) return []
  return points.flatMap((point) => {
    const parsed = v.safeParse(VariableWidthPointSchema, point)
    if (!parsed.success) return []
    const { position, ascent, descent } = parsed.output
    return [{ position, ascent, descent }]
  })
}

/** A layer's width profile as Figma's `variableWidthPoints`, when it has one. */
export function exportStrokeWidthProfile(node: SceneNode, nc: NodeChange): void {
  if (node.strokeWidthProfile.length === 0) return
  nc.variableWidthPoints = node.strokeWidthProfile.map((point) => ({
    position: point.position,
    ascent: point.ascent,
    descent: point.descent
  }))
}
