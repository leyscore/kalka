import { fromUint8Array } from 'js-base64'

import {
  patternSource,
  patternTileCopies,
  patternTileLayout,
  type Effect,
  type Fill,
  type GradientStop,
  type GradientTransform,
  type SceneGraph,
  type SceneNode
} from '@kalka/scene-graph'
import {
  colorToHex8,
  colorToDisplayCSS,
  getDefaultRenderColorSpace,
  type RenderColorSpace
} from '@kalka/scene-graph/color'
import { CSS_BLEND_MODES } from '@kalka/scene-graph/css'
import {
  applyGradientTransform,
  gradientColorAt,
  IDENTITY_GRADIENT_TRANSFORM,
  invertGradientTransform,
  isIdentityGradientTransform
} from '@kalka/scene-graph/gradient'
import { imageTileSize } from '@kalka/scene-graph/images'
import type { Color } from '@kalka/scene-graph/primitives'

import { svg, type SVGNode } from './node'
import { round } from './paths'

export interface SVGExportContext {
  defs: SVGNode[]
  defIdCounter: number
  graph: SceneGraph
  colorSpace: RenderColorSpace
  /** Starts every def id, so SVGs inlined on one page cannot reference each other's defs. */
  idPrefix?: string
  /** Paints drawn in `currentColor`, such as an icon's tinted paths, so CSS `color` sets them. */
  tint?: (node: SceneNode) => readonly ('fill' | 'stroke')[]
  /**
   * The outline a boolean operation draws in its own coordinates, which only path operations can
   * compute; null when they are unavailable, so the layer's saved geometry draws instead.
   */
  booleanPath?: BooleanPathResolver
  /** Outlines already resolved, by layer id, so a boolean's path operations run once. */
  booleanOutlines?: Map<string, SVGPathOutline | null>
  /** Draws a layer, such as the source a pattern fill repeats, at its own origin. */
  drawLayer?: (node: SceneNode) => SVGNode | null
  /** The pattern sources being drawn, so a pattern that repeats itself stops. */
  patternSources?: Set<string>
}

/** A closed outline as SVG path data and the fill rule that fills it. */
export interface SVGPathOutline {
  d: string
  evenOdd: boolean
}

export type BooleanPathResolver = (graph: SceneGraph, node: SceneNode) => SVGPathOutline | null

export function nextDefId(ctx: SVGExportContext, prefix: string): string {
  return `${ctx.idPrefix ?? ''}${prefix}${ctx.defIdCounter++}`
}

export function formatColor(
  color: Color,
  opacity = 1,
  colorSpace: RenderColorSpace = getDefaultRenderColorSpace()
): string {
  const alphaColor = { ...color, a: color.a * opacity }
  if (colorSpace === 'display-p3') {
    return colorToDisplayCSS(alphaColor, { colorSpace })
  }
  // The paint's opacity stays in the color; a six-digit hex would draw it opaque.
  return colorToHex8(alphaColor)
}

/** Where a gradient's unit square lands: the shape's bounding box, or the layer's own box. */
export type GradientSpace = 'bbox' | 'layer'

function svgMatrix(t: GradientTransform): string {
  return `matrix(${[t.m00, t.m10, t.m01, t.m11, t.m02, t.m12].map((v) => round(v, 6)).join(' ')})`
}

/**
 * Gradient space mapped onto the layer's pixels. A line has no height, and an SVG paint in
 * bounding-box units does not draw on a shape without area, so its box is at least a pixel.
 */
function gradientToLayerPixels(node: SceneNode, toLayer: GradientTransform) {
  const width = Math.max(1, node.width)
  const height = Math.max(1, node.height)
  return {
    m00: toLayer.m00 * width,
    m01: toLayer.m01 * width,
    m02: toLayer.m02 * width,
    m10: toLayer.m10 * height,
    m11: toLayer.m11 * height,
    m12: toLayer.m12 * height
  } satisfies GradientTransform
}

/**
 * How far from the centre of gradient space a paint must reach to cover the layer and `margin`
 * pixels around it, measured along gradient space's axes.
 */
function gradientReach(fill: Fill, node: SceneNode, margin: number): number {
  const t = fill.gradientTransform ?? IDENTITY_GRADIENT_TRANSFORM
  const width = Math.max(1, node.width)
  const height = Math.max(1, node.height)
  let reach = 0.5
  for (const x of [-margin, node.width + margin]) {
    for (const y of [-margin, node.height + margin]) {
      const point = applyGradientTransform(t, { x: x / width, y: y / height })
      reach = Math.max(reach, Math.abs(point.x - 0.5), Math.abs(point.y - 0.5))
    }
  }
  return reach * 1.05
}

/** How many wedges an angular gradient is drawn with: enough that no band shows. */
const ANGULAR_WEDGES = 256

/**
 * An angular gradient as wedges of color around the centre of gradient space, starting along +x
 * and turning clockwise. SVG has no conic gradient; the wedges overlap their next neighbour a
 * little so no seam shows between them.
 */
function angularWedges(stops: readonly GradientStop[], reach: number, ctx: SVGExportContext) {
  const radius = reach * Math.SQRT2
  const step = (2 * Math.PI) / ANGULAR_WEDGES
  const point = (angle: number) =>
    `${round(0.5 + radius * Math.cos(angle), 6)} ${round(0.5 + radius * Math.sin(angle), 6)}`
  return Array.from({ length: ANGULAR_WEDGES }, (_, index) => {
    const start = index * step
    const end = index === ANGULAR_WEDGES - 1 ? 2 * Math.PI : start + step * 1.5
    return svg('path', {
      d: `M0.5 0.5L${point(start)}L${point(end)}Z`,
      fill: formatColor(gradientColorAt(stops, (index + 0.5) / ANGULAR_WEDGES), 1, ctx.colorSpace)
    })
  })
}

/**
 * A diamond gradient as four quadrants of gradient space, each a linear gradient running from
 * the centre to its corner: the distance a diamond measures is linear inside each quadrant.
 */
function diamondQuadrants(
  stopNodes: SVGNode[],
  reach: number,
  idBase: string
): { defs: SVGNode[]; shapes: SVGNode[] } {
  const defs: SVGNode[] = []
  const shapes: SVGNode[] = []
  for (const [index, [sx, sy]] of [
    [1, 1],
    [-1, 1],
    [-1, -1],
    [1, -1]
  ].entries()) {
    const id = `${idBase}q${index}`
    defs.push(
      svg(
        'linearGradient',
        {
          id,
          x1: 0.5,
          y1: 0.5,
          x2: 0.5 + sx * 0.25,
          y2: 0.5 + sy * 0.25,
          gradientUnits: 'userSpaceOnUse'
        },
        ...stopNodes
      )
    )
    const corner = (dx: number, dy: number) =>
      `${round(0.5 + dx * reach, 6)} ${round(0.5 + dy * reach, 6)}`
    shapes.push(
      svg('path', {
        d: `M0.5 0.5L${corner(sx, 0)}L${corner(sx, sy)}L${corner(0, sy)}Z`,
        fill: `url(#${id})`
      })
    )
  }
  return { defs, shapes }
}

/**
 * Angular and diamond gradients, which SVG has no gradient for, as a pattern drawn in gradient
 * space and mapped onto the layer, so fills and strokes both paint with it.
 */
function createGradientPattern(
  fill: Fill,
  node: SceneNode,
  ctx: SVGExportContext,
  stopNodes: SVGNode[],
  margin: number
): { id: string; node: SVGNode } | null {
  const stops = fill.gradientStops
  const t = fill.gradientTransform
  if (!stops?.length || !t) return null
  const id = nextDefId(ctx, 'grad')
  // The tile covers the layer and the margin in its pixels; its drawing is in gradient space.
  const pad = margin + 1
  const reach = gradientReach(fill, node, pad)
  const toPixels = gradientToLayerPixels(node, invertGradientTransform(t))
  const tile = {
    x: round(-pad),
    y: round(-pad),
    width: round(Math.max(1, node.width) + pad * 2),
    height: round(Math.max(1, node.height) + pad * 2)
  }
  let content: SVGNode[]
  if (fill.type === 'GRADIENT_ANGULAR') content = angularWedges(stops, reach, ctx)
  else {
    const quadrants = diamondQuadrants(stopNodes, reach, id)
    content = [svg('defs', {}, ...quadrants.defs), ...quadrants.shapes]
  }
  return {
    id,
    node: svg(
      'pattern',
      { id, patternUnits: 'userSpaceOnUse', ...tile },
      // A pattern draws from its tile's corner, so the drawing moves back by as much.
      svg(
        'g',
        { transform: `translate(${round(pad)} ${round(pad)}) ${svgMatrix(toPixels)}` },
        ...content
      )
    )
  }
}

/**
 * A gradient paint server. `space` places its unit square: on the shape's bounding box, as fills
 * have always exported, or on the layer's box, which a stroke needs because a line's bounding
 * box has no area. `margin` is how far past the layer the paint must reach, such as a stroke's.
 */
export function createGradientDef(
  fill: Fill,
  node: SceneNode,
  ctx: SVGExportContext,
  space: GradientSpace = 'bbox',
  margin = 0
): { id: string; node: SVGNode } | null {
  const stops = fill.gradientStops
  const t = fill.gradientTransform
  if (!stops || !t) return null

  const stopNodes = stops.map((s) =>
    svg('stop', {
      offset: `${round(s.position * 100)}%`,
      'stop-color': formatColor(s.color, 1, ctx.colorSpace),
      'stop-opacity': s.color.a < 1 ? round(s.color.a) : undefined
    })
  )

  if (fill.type === 'GRADIENT_ANGULAR' || fill.type === 'GRADIENT_DIAMOND')
    return createGradientPattern(fill, node, ctx, stopNodes, margin)

  const id = nextDefId(ctx, 'grad')

  // Gradient space in bounding-box units, mapped onto the layer as the canvas draws it.
  const toLayer = invertGradientTransform(t)
  let units: Record<string, string>
  if (space === 'layer') {
    units = {
      gradientUnits: 'userSpaceOnUse',
      gradientTransform: svgMatrix(gradientToLayerPixels(node, toLayer))
    }
  } else {
    units = { gradientUnits: 'objectBoundingBox' }
    if (!isIdentityGradientTransform(toLayer)) units.gradientTransform = svgMatrix(toLayer)
  }

  if (fill.type === 'GRADIENT_LINEAR') {
    return {
      id,
      node: svg('linearGradient', { id, x1: 0, y1: 0.5, x2: 1, y2: 0.5, ...units }, ...stopNodes)
    }
  }

  if (fill.type === 'GRADIENT_RADIAL') {
    return {
      id,
      node: svg('radialGradient', { id, cx: 0.5, cy: 0.5, r: 0.5, ...units }, ...stopNodes)
    }
  }

  return null
}

function createImagePattern(
  fill: Fill,
  node: SceneNode,
  ctx: SVGExportContext
): { id: string; node: SVGNode } | null {
  if (!fill.imageHash) return null
  const data = ctx.graph.images.get(fill.imageHash)
  if (!data) return null

  const id = nextDefId(ctx, 'img')
  const base64 = fromUint8Array(data)
  const mime = detectImageMime(data)
  const tile = fill.imageScaleMode === 'TILE' ? imageTileSize(fill, data) : null
  if (tile) {
    const width = round(tile.width)
    const height = round(tile.height)
    return {
      id,
      node: svg(
        'pattern',
        { id, patternUnits: 'userSpaceOnUse', width, height },
        svg('image', { href: `data:${mime};base64,${base64}`, width, height })
      )
    }
  }

  return {
    id,
    node: svg(
      'pattern',
      {
        id,
        patternUnits: 'objectBoundingBox',
        width: 1,
        height: 1
      },
      svg('image', {
        href: `data:${mime};base64,${base64}`,
        width: node.width,
        height: node.height,
        preserveAspectRatio: fill.imageScaleMode === 'FIT' ? 'xMidYMid meet' : 'xMidYMid slice'
      })
    )
  }
}

function detectImageMime(data: Uint8Array): string {
  if (data[0] === 0x89 && data[1] === 0x50) return 'image/png'
  if (data[0] === 0xff && data[1] === 0xd8) return 'image/jpeg'
  if (data[0] === 0x52 && data[1] === 0x49) return 'image/webp'
  return 'image/png'
}

export function createFilterDef(
  effects: Effect[],
  ctx: SVGExportContext
): { id: string; node: SVGNode } | null {
  const visible = effects.filter((e) => e.visible)
  if (visible.length === 0) return null

  const id = nextDefId(ctx, 'fx')
  const primitives: SVGNode[] = []

  for (const effect of visible) {
    if (effect.type === 'DROP_SHADOW') {
      const stdDev = round(effect.radius / 2)
      primitives.push(
        svg('feDropShadow', {
          dx: round(effect.offset.x),
          dy: round(effect.offset.y),
          stdDeviation: stdDev,
          'flood-color': formatColor(effect.color, 1, ctx.colorSpace),
          'flood-opacity': round(effect.color.a)
        })
      )
    } else if (effect.type === 'INNER_SHADOW') {
      const sid = `${id}_is`
      const stdDev = round(effect.radius / 2)
      primitives.push(
        svg('feGaussianBlur', { in: 'SourceAlpha', stdDeviation: stdDev, result: `${sid}_blur` }),
        svg('feOffset', {
          dx: round(effect.offset.x),
          dy: round(effect.offset.y),
          result: `${sid}_off`
        }),
        svg('feComposite', {
          in: 'SourceAlpha',
          in2: `${sid}_off`,
          operator: 'out',
          result: `${sid}_inv`
        }),
        svg('feFlood', {
          'flood-color': formatColor(effect.color, 1, ctx.colorSpace),
          'flood-opacity': round(effect.color.a)
        }),
        svg('feComposite', { in2: `${sid}_inv`, operator: 'in', result: `${sid}_shadow` }),
        svg('feComposite', {
          in: `${sid}_shadow`,
          in2: 'SourceGraphic',
          operator: 'over'
        })
      )
    } else {
      const stdDev = round(effect.radius / 2)
      primitives.push(svg('feGaussianBlur', { stdDeviation: stdDev }))
    }
  }

  if (primitives.length === 0) return null

  return {
    id,
    node: svg('filter', { id }, ...primitives)
  }
}

export function resolveFill(fill: Fill, node: SceneNode, ctx: SVGExportContext): string | null {
  if (!fill.visible) return null

  if (fill.type === 'SOLID') {
    return formatColor(fill.color, fill.opacity, ctx.colorSpace)
  }

  if (fill.type.startsWith('GRADIENT')) {
    const grad = createGradientDef(fill, node, ctx)
    if (grad) {
      ctx.defs.push(grad.node)
      return `url(#${grad.id})`
    }
  }

  if (fill.type === 'IMAGE') {
    const pattern = createImagePattern(fill, node, ctx)
    if (pattern) {
      ctx.defs.push(pattern.node)
      return `url(#${pattern.id})`
    }
  }

  if (fill.type === 'PATTERN') {
    const pattern = createSourcePattern(fill, node, ctx)
    if (pattern) {
      ctx.defs.push(pattern.node)
      return `url(#${pattern.id})`
    }
  }

  return null
}

/**
 * A pattern fill as an SVG pattern: one tile drawing its source layer at each copy, repeated
 * from the layer's origin as the canvas repeats it.
 */
function createSourcePattern(
  fill: Fill,
  node: SceneNode,
  ctx: SVGExportContext
): { id: string; node: SVGNode } | null {
  const source = patternSource(ctx.graph, node, fill)
  const sources = (ctx.patternSources ??= new Set())
  if (!source || !ctx.drawLayer || sources.has(source.id)) return null
  sources.add(source.id)
  let drawn: SVGNode | null
  try {
    // The source draws wherever a pattern repeats it, hidden or not.
    drawn = ctx.drawLayer({
      ...source,
      x: 0,
      y: 0,
      rotation: 0,
      flipX: false,
      flipY: false,
      opacity: 1,
      visible: true
    })
  } finally {
    sources.delete(source.id)
  }
  if (!drawn) return null
  const layout = patternTileLayout(source, fill)
  const id = nextDefId(ctx, 'pat')
  const copies = patternTileCopies(source, layout).map((position) =>
    svg(
      'g',
      {
        transform: `translate(${round(position.x)} ${round(position.y)}) scale(${round(layout.scale)})`
      },
      drawn
    )
  )
  return {
    id,
    node: svg(
      'pattern',
      {
        id,
        patternUnits: 'userSpaceOnUse',
        width: round(layout.rect.width),
        height: round(layout.rect.height)
      },
      svg('g', fill.opacity < 1 ? { opacity: round(fill.opacity) } : {}, ...copies)
    )
  }
}

export const SVG_STROKE_CAP: Record<string, string> = {
  NONE: 'butt',
  ROUND: 'round',
  SQUARE: 'square'
}

export const SVG_STROKE_JOIN: Record<string, string> = {
  MITER: 'miter',
  ROUND: 'round',
  BEVEL: 'bevel'
}

export const SVG_BLEND_MODE: Record<string, string> = { NORMAL: 'normal', ...CSS_BLEND_MODES }
