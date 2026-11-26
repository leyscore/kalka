import { omit } from 'es-toolkit/object'

import type { SceneGraph, SceneNode } from '@kalka/scene-graph'
import { copyFill, copyFills, copyStrokes } from '@kalka/scene-graph/copy'
import { parseSVGPath } from '@kalka/scene-graph/parse-path'

import { baseShapePath, makeBooleanOperationPath, nodePathTransform } from './boolean'
import type { VectorFlattenProps } from './flatten'
import type { SkiaRenderer } from './renderer'

export type OffsetPathProps = VectorFlattenProps & Pick<SceneNode, 'strokes'>

export type OffsetPathJoin = 'MITER' | 'ROUND' | 'BEVEL'

export interface OffsetPathOptions {
  /** How far out the new path runs, in pixels; negative runs inside. */
  offset: number
  join: OffsetPathJoin
  /** How far a mitred corner may reach, as a multiple of the offset. */
  miterLimit?: number
}

/** Layers Offset path accepts: every shape and vector, not containers or text. */
export function canOffsetNode(node: SceneNode): boolean {
  return (
    node.type === 'VECTOR' ||
    node.type === 'RECTANGLE' ||
    node.type === 'ELLIPSE' ||
    node.type === 'POLYGON' ||
    node.type === 'STAR' ||
    node.type === 'LINE' ||
    node.type === 'BOOLEAN_OPERATION'
  )
}

/** Whether a layer's shape encloses an area, or is an open path that only has a stroke. */
function isClosedShape(node: SceneNode): boolean {
  if (node.type === 'VECTOR') return (node.vectorNetwork?.regions.length ?? 0) > 0
  return true
}

/**
 * Figma's Offset path: a new path that runs at a fixed distance outside the layer's shape, or
 * inside it for a negative offset, with its corners mitred, rounded or bevelled. An open path
 * becomes the closed outline that surrounds it. The result is in the layer's parent frame.
 */
export function offsetNodeToVectorProps(
  r: SkiaRenderer,
  graph: SceneGraph,
  node: SceneNode,
  options: OffsetPathOptions
): OffsetPathProps | null {
  if (!canOffsetNode(node) || options.offset === 0) return null
  const shape =
    node.type === 'BOOLEAN_OPERATION'
      ? makeBooleanOperationPath(r, node, graph)
      : baseShapePath(r, node)
  if (!shape) return null
  const join = {
    MITER: r.ck.StrokeJoin.Miter,
    ROUND: r.ck.StrokeJoin.Round,
    BEVEL: r.ck.StrokeJoin.Bevel
  }[options.join]
  const band = shape.makeStroked({
    width: Math.abs(options.offset) * 2,
    join,
    cap: r.ck.StrokeCap.Round,
    miter_limit: options.miterLimit ?? 4
  })
  if (!band) {
    shape.delete()
    return null
  }
  let result = band
  if (isClosedShape(node)) {
    const op = options.offset > 0 ? r.ck.PathOp.Union : r.ck.PathOp.Difference
    const combined = r.ck.Path.MakeFromOp(shape, band, op)
    band.delete()
    if (!combined) {
      shape.delete()
      return null
    }
    result = combined
  }
  shape.delete()

  const placed = new r.ck.PathBuilder()
  placed.addPath(result, nodePathTransform(r, node))
  result.delete()
  const bounds = placed.getBounds()
  if (bounds[2] <= bounds[0] || bounds[3] <= bounds[1]) {
    placed.delete()
    return null
  }
  placed.transform(r.ck.Matrix.translated(-bounds[0], -bounds[1]))
  const path = placed.detachAndDelete()
  const vectorNetwork = parseSVGPath(path.toSVGString())
  path.delete()
  return {
    name: node.name,
    x: bounds[0],
    y: bounds[1],
    width: bounds[2] - bounds[0],
    height: bounds[3] - bounds[1],
    // An open path's outline is filled with its stroke, as Outline stroke does.
    fills: isClosedShape(node) ? copyFills(node.fills) : strokesAsFills(node),
    vectorNetwork,
    strokes: isClosedShape(node) ? copyStrokes(node.strokes) : []
  }
}

function strokesAsFills(node: SceneNode): SceneNode['fills'] {
  return node.strokes
    .filter((stroke) => stroke.visible)
    .map((stroke) => copyFill(omit(stroke, ['weight', 'align', 'cap', 'join', 'dashPattern'])))
}
