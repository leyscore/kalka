import type { selectionPath } from '@kalka/core/geometry'
import { pathTextSelectionBand, pointAtArc } from '@kalka/core/text'
import type { SceneNode } from '@kalka/scene-graph'
import type { Color } from '@kalka/scene-graph/primitives'

import { css, type OverlayShape } from '#vue/canvas/svg-overlay/shapes'

/** The curve, box, and samples of text set on a path, as selection draws and hit-tests them. */
export type TextPathSelection = NonNullable<ReturnType<typeof selectionPath>>

/** How finely the curve is drawn: one segment per unit of length, within these bounds. */
const MIN_CURVE_STEPS = 64
const MAX_CURVE_STEPS = 1024
/** The band's fill alpha: a tint over the lettering. */
const BAND_FILL_ALPHA = 0.16

interface TextPathPaint {
  /** The selection's color. */
  color: Color
  /** A handle at a point, a fixed size on screen. */
  handle: (x: number, y: number) => OverlayShape
  /** Half a handle's size, in the layer's units. */
  half: number
}

/**
 * Text set on a path, selected, in the layer's own coordinates: a band hugging the lettering
 * along the curve, the curve itself, a crosshair at the center of the box the lettering fits,
 * and a handle where the text starts on the curve.
 */
export function textPathSelectionShapes(
  node: SceneNode,
  { data, box, sampled }: TextPathSelection,
  { color, handle, half }: TextPathPaint
): OverlayShape[] {
  const stroke = css(color)
  const shapes: OverlayShape[] = []
  const bandPoints = pathTextSelectionBand(data, box, node.derivedTextGlyphs, sampled)
  if (bandPoints && bandPoints.length >= 6) {
    shapes.push({
      type: 'polygon',
      points: bandPoints,
      fill: css(color, BAND_FILL_ALPHA),
      stroke,
      strokeWidth: 1
    })
  }

  const steps = Math.max(MIN_CURVE_STEPS, Math.min(MAX_CURVE_STEPS, Math.ceil(sampled.length)))
  const commands: string[] = []
  for (let index = 0; index <= steps; index++) {
    const point = pointAtArc(sampled, (sampled.length * index) / steps)
    commands.push(`${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`)
  }
  if (sampled.closed) commands.push('Z')
  shapes.push({ type: 'path', d: commands.join(''), stroke, strokeWidth: 1 })

  const cx = box.x + box.width / 2
  const cy = box.y + box.height / 2
  const arm = half * 2
  shapes.push(
    { type: 'line', x1: cx - arm, y1: cy, x2: cx + arm, y2: cy, stroke, strokeWidth: 1 },
    { type: 'line', x1: cx, y1: cy - arm, x2: cx, y2: cy + arm, stroke, strokeWidth: 1 }
  )

  // Where the text starts along the curve, as a fraction of its length.
  const start = pointAtArc(sampled, Math.min(Math.max(data.tValue, 0), 1) * sampled.length)
  shapes.push(handle(start.x, start.y))
  return shapes
}
