import type { Canvas } from 'canvaskit-wasm'

import type { SceneNode, Stroke } from '@kalka/scene-graph'
import type { Color } from '@kalka/scene-graph/primitives'

import { strokeOutlinePolygons } from '#core/vector/stroke-outline'

import type { SkiaRenderer } from './renderer'

/**
 * Draws a stroke a width profile or a brush shapes as its filled outline, in the stroke's paint,
 * from the same polygons the SVG export writes. False when the stroke is a plain one.
 */
export function drawStrokeOutline(
  r: SkiaRenderer,
  canvas: Canvas,
  node: SceneNode,
  stroke: Stroke,
  color: Color
): boolean {
  const polygons = strokeOutlinePolygons(node, stroke)
  if (!polygons) return false
  const builder = new r.ck.PathBuilder()
  for (const polygon of polygons) {
    if (polygon.length < 6) continue
    builder.moveTo(polygon[0], polygon[1])
    for (let index = 2; index < polygon.length; index += 2) {
      builder.lineTo(polygon[index], polygon[index + 1])
    }
    builder.close()
  }
  const path = builder.detachAndDelete()
  r.fillPaint.setColor(r.ck.Color4f(color.r, color.g, color.b, color.a))
  r.fillPaint.setAlphaf(stroke.opacity)
  canvas.drawPath(path, r.fillPaint)
  path.delete()
  return true
}
