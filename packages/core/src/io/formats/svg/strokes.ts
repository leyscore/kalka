import type { SceneNode, Stroke } from '@kalka/scene-graph'
import {
  arrowLinesSegments,
  collectArrowEndpoints,
  equilateralArrowPoints,
  isArrowCap,
  lineArrowEndpoints,
  type ArrowEndpoint
} from '@kalka/scene-graph/arrow-caps'
import { strokeOverflow } from '@kalka/scene-graph/geometry'
import { isGradientFill } from '@kalka/scene-graph/gradient'

import {
  createGradientDef,
  formatColor,
  nextDefId,
  resolveFill,
  SVG_STROKE_CAP,
  SVG_STROKE_JOIN,
  type SVGExportContext
} from './defs'
import { svg, type SVGNode } from './node'
import { round } from './paths'

export type SVGAttrs = Record<string, string | number | undefined>

/**
 * A stroke's paint. A gradient is laid on the layer's box, as the canvas draws it, and reaches
 * as far as the stroke does, arrowheads included.
 */
function strokePaint(stroke: Stroke, node: SceneNode, ctx: SVGExportContext): string | null {
  if (stroke.type === 'SOLID') return formatColor(stroke.color, 1, ctx.colorSpace)
  if (!isGradientFill(stroke.type)) return resolveFill(stroke, node, ctx)
  const reach = strokeOverflow([stroke], node.strokeCap, node.vectorNetwork)
  const gradient = createGradientDef(stroke, node, ctx, 'layer', reach)
  if (!gradient) return null
  ctx.defs.push(gradient.node)
  return `url(#${gradient.id})`
}

/** The cap a stroke ends with: its own, or the layer's. */
function strokeCap(node: SceneNode, stroke: Stroke) {
  return stroke.cap ?? node.strokeCap
}

/** The presentation attributes of a layer's first visible stroke. */
export function buildSVGStrokeAttrs(
  node: SceneNode,
  visibleStrokes: Stroke[],
  ctx: SVGExportContext
): SVGAttrs {
  const stroke = visibleStrokes.at(0)
  if (!stroke) return {}
  const paint = strokePaint(stroke, node, ctx)
  if (!paint) return {}
  const attrs: SVGAttrs = { stroke: paint, 'stroke-width': round(stroke.weight) }
  if (stroke.opacity < 1) attrs['stroke-opacity'] = round(stroke.opacity)
  // An arrow is a head drawn of its own on a shaft that ends flat.
  const cap = strokeCap(node, stroke)
  if (cap !== 'NONE' && !isArrowCap(cap)) attrs['stroke-linecap'] = SVG_STROKE_CAP[cap]
  if (stroke.join && stroke.join !== 'MITER') {
    attrs['stroke-linejoin'] = SVG_STROKE_JOIN[stroke.join] ?? 'miter'
  }
  if (stroke.dashPattern && stroke.dashPattern.length > 0) {
    attrs['stroke-dasharray'] = stroke.dashPattern.map((n) => round(n)).join(' ')
  }
  return attrs
}

function arrowEndpoints(node: SceneNode, stroke: Stroke): ArrowEndpoint[] {
  const cap = strokeCap(node, stroke)
  if (node.type === 'LINE') return lineArrowEndpoints(node.width, node.height, cap)
  if (node.type === 'VECTOR' && node.vectorNetwork)
    return collectArrowEndpoints(node.vectorNetwork, cap)
  return []
}

/**
 * Arrowheads at a line's or an open path's ends, in the stroke's paint: a filled triangle, or two
 * wings stroked at the shaft's weight, as the canvas draws them.
 */
export function arrowHeadElements(
  node: SceneNode,
  stroke: Stroke | undefined,
  strokeAttrs: SVGAttrs
): SVGNode[] {
  const paint = strokeAttrs.stroke
  if (!stroke || paint === undefined || paint === 'none') return []
  const opacity = strokeAttrs['stroke-opacity']
  return arrowEndpoints(node, stroke).flatMap((end) => {
    if (end.cap === 'ARROW_EQUILATERAL') {
      const points = equilateralArrowPoints(end.x, end.y, end.angle, stroke.weight)
      return [
        svg('polygon', {
          points: points.map((point) => `${round(point.x)},${round(point.y)}`).join(' '),
          fill: paint,
          'fill-opacity': opacity
        })
      ]
    }
    return arrowLinesSegments(end.x, end.y, end.angle, stroke.weight).map((wing) =>
      svg('line', {
        x1: round(wing.from.x),
        y1: round(wing.from.y),
        x2: round(wing.to.x),
        y2: round(wing.to.y),
        stroke: paint,
        'stroke-width': round(stroke.weight),
        'stroke-opacity': opacity
      })
    )
  })
}

/** Layers whose shape closes, so a stroke can sit inside or outside its edge. */
const OPEN_OR_COMPOSITE = new Set<SceneNode['type']>([
  'LINE',
  'VECTOR',
  'TEXT',
  'GROUP',
  'BOOLEAN_OPERATION'
])

/** Whether the stroke sits inside or outside a closed shape, which SVG cannot say by itself. */
export function hasAlignedStroke(
  node: SceneNode,
  stroke: Stroke | undefined,
  strokeAttrs: SVGAttrs
): stroke is Stroke {
  return (
    stroke !== undefined &&
    strokeAttrs.stroke !== undefined &&
    stroke.align !== 'CENTER' &&
    !OPEN_OR_COMPOSITE.has(node.type)
  )
}

/**
 * A stroke inside or outside the edge: centred on it at twice the weight, then clipped to the
 * shape, or masked to what lies outside it. `shape` draws the layer's outline with the given
 * paint attributes.
 */
export function alignedStrokeElements(
  node: SceneNode,
  stroke: Stroke,
  strokeAttrs: SVGAttrs,
  shape: (attrs: SVGAttrs) => SVGNode[],
  ctx: SVGExportContext
): SVGNode[] {
  const stroked = shape({
    fill: 'none',
    ...strokeAttrs,
    'stroke-width': round(stroke.weight * 2)
  })
  if (stroke.align === 'INSIDE') {
    const id = nextDefId(ctx, 'clip')
    ctx.defs.push(svg('clipPath', { id }, ...shape({ fill: '#000000' })))
    return [svg('g', { 'clip-path': `url(#${id})` }, ...stroked)]
  }
  const id = nextDefId(ctx, 'mask')
  const margin = stroke.weight * 2
  const area = {
    x: round(-margin),
    y: round(-margin),
    width: round(node.width + margin * 2),
    height: round(node.height + margin * 2)
  }
  ctx.defs.push(
    svg(
      'mask',
      { id, maskUnits: 'userSpaceOnUse', ...area },
      svg('rect', { ...area, fill: '#FFFFFF' }),
      ...shape({ fill: '#000000' })
    )
  )
  return [svg('g', { mask: `url(#${id})` }, ...stroked)]
}
