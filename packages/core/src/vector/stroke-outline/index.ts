import type { SceneNode, Stroke } from '@kalka/scene-graph'

import { brushPolygons } from './brushes'
import { strokeCenterlines } from './centerline'
import { outlineCenterline, polygonsToSVGPath, type OutlinePolygon } from './outline'
import { hasWidthProfile, widthProfileFunction } from './width'

export { defaultStrokeBrush, seededRandom, STROKE_BRUSHES, brushPolygons } from './brushes'
export {
  nearestOnCenterline,
  pointAtLength,
  strokeCenterlines,
  type Centerline,
  type CenterlinePoint
} from './centerline'
export { outlineCenterline, polygonsToSVGPath, type OutlinePolygon } from './outline'
export {
  hasWidthProfile,
  matchStrokeWidthPreset,
  STROKE_WIDTH_PRESET_IDS,
  strokeWidthPreset,
  widthProfileFunction,
  type SideWidths,
  type StrokeWidthPreset
} from './width'

/** Layers whose stroke follows a path a width profile or a brush can run along. */
const PATH_TYPES = new Set<SceneNode['type']>(['VECTOR', 'LINE'])

/** Whether a layer's stroke is drawn as a filled outline: with a width profile or a brush. */
export function drawsStrokeOutline(node: SceneNode): boolean {
  if (!PATH_TYPES.has(node.type)) return false
  return node.strokeBrush !== null || hasWidthProfile(node.strokeWidthProfile)
}

/**
 * A layer's stroke as filled polygons in its own coordinates, when a width profile or a brush
 * draws it; null when it is a plain stroke. Canvas, SVG and every export draw these, so the
 * stroke looks the same everywhere.
 */
export function strokeOutlinePolygons(node: SceneNode, stroke: Stroke): OutlinePolygon[] | null {
  if (!drawsStrokeOutline(node) || !(stroke.weight > 0)) return null
  const profile = widthProfileFunction(node.strokeWidthProfile)
  const weight = stroke.weight
  const polygons: OutlinePolygon[] = []
  for (const line of strokeCenterlines(node)) {
    const sides = (at: number) => {
      const widths = profile(at / line.length)
      return { ascent: widths.ascent * weight, descent: widths.descent * weight }
    }
    if (node.strokeBrush) {
      polygons.push(
        ...brushPolygons(line, node.strokeBrush, (at) => {
          const widths = sides(at)
          return widths.ascent + widths.descent
        })
      )
      continue
    }
    polygons.push(
      ...outlineCenterline(line, sides, {
        cap: stroke.cap ?? node.strokeCap,
        join: stroke.join ?? node.strokeJoin,
        miterLimit: node.strokeMiterLimit
      })
    )
  }
  return polygons
}

/** The same outline as SVG path data. */
export function strokeOutlineSVGPath(node: SceneNode, stroke: Stroke): string | null {
  const polygons = strokeOutlinePolygons(node, stroke)
  return polygons ? polygonsToSVGPath(polygons) : null
}
