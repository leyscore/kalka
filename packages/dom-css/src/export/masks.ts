import { compact } from 'es-toolkit/array'

import type { MaskType, SceneGraph, SceneNode } from '@kalka/scene-graph'
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
  const fill = '#fff'
  if (mask.type === 'ELLIPSE') {
    const rx = String(mask.width / 2)
    const ry = String(mask.height / 2)
    return {
      type: 'element',
      tagName: 'ellipse',
      attrs: { cx: rx, cy: ry, rx, ry, fill },
      children: []
    }
  }
  const radius = Math.min(mask.cornerRadius, mask.width / 2, mask.height / 2)
  return {
    type: 'element',
    tagName: 'rect',
    attrs: {
      width: String(mask.width),
      height: String(mask.height),
      ...(radius > 0 ? { rx: String(radius) } : {}),
      fill
    },
    children: []
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
