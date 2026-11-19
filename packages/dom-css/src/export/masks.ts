import { compact } from 'es-toolkit/array'

import type { Fill, MaskType, SceneGraph, SceneNode } from '@kalka/scene-graph'
import { colorToHex } from '@kalka/scene-graph/color'
import { invertGradientTransform, isIdentityGradientTransform } from '@kalka/scene-graph/gradient'
import Matrix, { type Mat3 } from '@kalka/scene-graph/matrix'

import type { DesignElement, DesignNode, DesignStyleDeclaration } from '../types'
import { serializeNode } from './html'
import type { VectorElementRenderer } from './projection'

const SVG_NS = 'http://www.w3.org/2000/svg'

/** A mask applies while it is shown; a hidden one masks nothing, as on the canvas. */
function maskTypeOf(node: SceneNode | undefined): MaskType | null {
  return node?.visible && node.isMask ? node.maskType : null
}

/**
 * The masks a layer is drawn through: the run of masks nearest below it among its siblings.
 * A mask clips every sibling above it up to the next mask; consecutive masks add up.
 */
export function masksOf(graph: SceneGraph, node: SceneNode): SceneNode[] {
  const parent = node.parentId ? graph.getNode(node.parentId) : undefined
  if (!parent || maskTypeOf(node)) return []
  const index = parent.childIds.indexOf(node.id)
  const masks: SceneNode[] = []
  for (let at = index - 1; at >= 0; at--) {
    const sibling = graph.getNode(parent.childIds[at])
    if (sibling && maskTypeOf(sibling)) masks.unshift(sibling)
    else if (masks.length > 0) break
  }
  return masks
}

/** Where CSS draws a layer's box in its parent: placed at its position, turned about its center. */
function boxMatrix(node: SceneNode): Mat3 {
  const placed = Matrix.translated(node.x, node.y)
  if (!node.rotation) return placed
  const turn = Matrix.rotated((node.rotation * Math.PI) / 180, node.width / 2, node.height / 2)
  return Matrix.multiply(placed, turn)
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000
}

/** The mask's own drawing, in its box: the SVG export's, or its box as a plain shape. */
function maskShape(
  graph: SceneGraph,
  mask: SceneNode,
  vectorElement: VectorElementRenderer | undefined
): DesignNode {
  const drawn = vectorElement?.(graph, mask)
  if (drawn?.tagName === 'svg') return drawn
  if (mask.type === 'GROUP') return groupMaskShape(graph, mask, vectorElement)
  const paint = maskPaint(mask)
  const shape = (tagName: string, attrs: Record<string, string>): DesignElement => ({
    type: 'element',
    tagName,
    attrs: { ...attrs, ...paint.attrs },
    children: []
  })
  let outline: DesignElement
  if (mask.type === 'ELLIPSE') {
    const rx = String(mask.width / 2)
    const ry = String(mask.height / 2)
    outline = shape('ellipse', { cx: rx, cy: ry, rx, ry })
  } else {
    const radius = Math.min(mask.cornerRadius, mask.width / 2, mask.height / 2)
    const corners: Record<string, string> = radius > 0 ? { rx: String(radius) } : {}
    outline = shape('rect', { width: String(mask.width), height: String(mask.height), ...corners })
  }
  if (!paint.defs) return outline
  return { type: 'element', tagName: 'g', attrs: {}, children: [paint.defs, outline] }
}

const MASK_GRADIENT_ID = 'kalka-mask-paint'

function svgColor(color: Fill['color'], luminance: boolean): string {
  return luminance ? colorToHex({ ...color, a: 1 }) : '#fff'
}

const GRADIENT_ELEMENTS: Partial<Record<Fill['type'], string>> = {
  GRADIENT_LINEAR: 'linearGradient',
  GRADIENT_RADIAL: 'radialGradient'
}

/**
 * How a shape mask is filled: with its own top paint, as Figma masks with it. An alpha mask
 * takes the paint's opacity, a gradient's included; a luminance mask takes its colours too. A
 * mask with no shown paint, or one SVG cannot draw, masks with its whole shape.
 */
function maskPaint(mask: SceneNode): { attrs: Record<string, string>; defs?: DesignElement } {
  const fill = mask.fills.findLast((paint) => paint.visible)
  const luminance = mask.maskType === 'LUMINANCE'
  if (!fill) return { attrs: { fill: '#fff' } }
  if (fill.type === 'SOLID') {
    const alpha = fill.color.a * fill.opacity
    const attrs: Record<string, string> = { fill: svgColor(fill.color, luminance) }
    if (alpha < 1) attrs['fill-opacity'] = String(round(alpha))
    return { attrs }
  }
  const stops = fill.gradientStops
  const transform = fill.gradientTransform
  const kind = GRADIENT_ELEMENTS[fill.type]
  if (!kind || !stops || !transform) return { attrs: { fill: '#fff' } }
  const toLayer = invertGradientTransform(transform)
  const units: Record<string, string> = { gradientUnits: 'objectBoundingBox' }
  if (!isIdentityGradientTransform(toLayer)) {
    const m = [toLayer.m00, toLayer.m10, toLayer.m01, toLayer.m11, toLayer.m02, toLayer.m12]
    units.gradientTransform = `matrix(${m.map(round).join(' ')})`
  }
  const geometry: Record<string, string> =
    kind === 'linearGradient'
      ? { x1: '0', y1: '0.5', x2: '1', y2: '0.5' }
      : { cx: '0.5', cy: '0.5', r: '0.5' }
  const gradient: DesignElement = {
    type: 'element',
    tagName: kind,
    attrs: { id: MASK_GRADIENT_ID, ...geometry, ...units },
    children: stops.map((stop): DesignElement => ({
      type: 'element',
      tagName: 'stop',
      attrs: {
        offset: String(round(stop.position)),
        'stop-color': svgColor(stop.color, luminance),
        'stop-opacity': String(round(stop.color.a * fill.opacity))
      },
      children: []
    }))
  }
  return {
    attrs: { fill: `url(#${MASK_GRADIENT_ID})` },
    defs: { type: 'element', tagName: 'defs', attrs: {}, children: [gradient] }
  }
}

/**
 * A group used as a mask masks with what its layers draw, as in Figma, where an SVG clip path
 * becomes such a group: each shown layer's drawing placed in the group's box.
 */
function groupMaskShape(
  graph: SceneGraph,
  group: SceneNode,
  vectorElement: VectorElementRenderer | undefined
): DesignElement {
  const children = graph
    .getChildren(group.id)
    .filter((child) => child.visible)
    .map((child): DesignNode => {
      const m = boxMatrix(child)
      const transform = [m[0], m[3], m[1], m[4], m[2], m[5]].map(round)
      return {
        type: 'element',
        tagName: 'g',
        attrs: { transform: `matrix(${transform.join(' ')})` },
        children: [maskShape(graph, child, vectorElement)]
      }
    })
  return { type: 'element', tagName: 'g', attrs: {}, children }
}

interface MaskLayer {
  image: string
  position: string
  size: string
  mode: string
}

/**
 * One mask as a CSS mask layer of `target`: its drawing as an SVG image placed in the target's
 * own box, so the target's rotation and position carry the mask with them unchanged.
 */
function maskLayer(
  graph: SceneGraph,
  mask: SceneNode,
  target: SceneNode,
  vectorElement: VectorElementRenderer | undefined
): MaskLayer | null {
  const inverse = Matrix.invert(boxMatrix(target))
  if (!inverse) return null
  const local = Matrix.multiply(inverse, boxMatrix(mask))
  const { width: w, height: h } = mask
  const corners = Matrix.mapPoints(local, [0, 0, w, 0, w, h, 0, h])
  const xs = corners.filter((_, at) => at % 2 === 0)
  const ys = corners.filter((_, at) => at % 2 === 1)
  const left = Math.floor(Math.min(...xs))
  const top = Math.floor(Math.min(...ys))
  const width = Math.max(1, Math.ceil(Math.max(...xs)) - left)
  const height = Math.max(1, Math.ceil(Math.max(...ys)) - top)
  const transform = [local[0], local[3], local[1], local[4], local[2], local[5]].map(round)
  const svg: DesignElement = {
    type: 'element',
    tagName: 'svg',
    attrs: {
      xmlns: SVG_NS,
      width: String(width),
      height: String(height),
      viewBox: `${left} ${top} ${width} ${height}`
    },
    children: [
      {
        type: 'element',
        tagName: 'g',
        attrs: { transform: `matrix(${transform.join(' ')})` },
        children: [maskShape(graph, mask, vectorElement)]
      }
    ]
  }
  return {
    image: `url("data:image/svg+xml,${encodeURIComponent(serializeNode(svg))}")`,
    position: `${left}px ${top}px`,
    size: `${width}px ${height}px`,
    mode: mask.maskType === 'LUMINANCE' ? 'luminance' : 'alpha'
  }
}

/**
 * The CSS that draws a layer as masks make it: a mask itself is hidden but keeps its place,
 * and a layer above masks shows only where they cover, each mask an image in `mask-image`.
 * Empty for a layer no mask touches.
 */
export function maskStyle(
  graph: SceneGraph,
  node: SceneNode,
  vectorElement: VectorElementRenderer | undefined
): DesignStyleDeclaration {
  if (maskTypeOf(node)) return { visibility: 'hidden' }
  const layers = compact(
    masksOf(graph, node).map((mask) => maskLayer(graph, mask, node, vectorElement))
  )
  if (layers.length === 0) return {}
  return {
    'mask-image': layers.map((layer) => layer.image).join(', '),
    'mask-mode': layers.map((layer) => layer.mode).join(', '),
    'mask-position': layers.map((layer) => layer.position).join(', '),
    'mask-size': layers.map((layer) => layer.size).join(', '),
    'mask-repeat': 'no-repeat',
    // What the layer draws past its box, such as its children or shadow, is masked, not cut.
    'mask-clip': 'no-clip'
  }
}
