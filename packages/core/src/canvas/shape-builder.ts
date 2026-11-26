import type { Path } from 'canvaskit-wasm'

import type { SceneGraph, SceneNode } from '@kalka/scene-graph'
import { getWorldMatrix } from '@kalka/scene-graph/coordinate'

import { canMakeBooleanSourceNode, makeBooleanSourcePath } from './boolean'
import type { SkiaRenderer } from './renderer'

/** Areas smaller than this, in square pixels of their bounds, are slivers left by the ops. */
const MIN_FACE_AREA = 0.5

/** Layers the Shape builder cuts into regions: filled shapes and vectors, not frames or text. */
export function canBuildShapeFrom(node: SceneNode, graph: SceneGraph): boolean {
  return (
    (node.type === 'RECTANGLE' ||
      node.type === 'ELLIPSE' ||
      node.type === 'POLYGON' ||
      node.type === 'STAR' ||
      node.type === 'VECTOR' ||
      node.type === 'BOOLEAN_OPERATION') &&
    canMakeBooleanSourceNode(node, graph)
  )
}

/** A layer's filled area on the page. */
export function pageShapePath(r: SkiaRenderer, graph: SceneGraph, node: SceneNode): Path | null {
  const local = makeBooleanSourcePath(r, node, graph)
  if (!local) return null
  const placed = new r.ck.PathBuilder()
  placed.addPath(local, getWorldMatrix(node, graph))
  local.delete()
  return placed.detachAndDelete()
}

function hasArea(path: Path): boolean {
  if (path.isEmpty()) return false
  const [left, top, right, bottom] = path.computeTightBounds()
  return (right - left) * (bottom - top) >= MIN_FACE_AREA
}

/** One region of the arrangement: where exactly the `owners` overlap, and nothing else. */
export interface ShapeBuilderFace {
  path: Path
  owners: string[]
}

/**
 * The regions overlapping shapes cut each other into, as Figma's Shape builder shows them: each
 * shape in turn splits every region so far into the part inside it and the part outside, and adds
 * what it covers alone. The caller deletes the paths.
 */
export function shapeBuilderFaces(
  r: SkiaRenderer,
  shapes: readonly { id: string; path: Path }[]
): ShapeBuilderFace[] {
  const { PathOp } = r.ck
  let faces: ShapeBuilderFace[] = []
  for (const shape of shapes) {
    const next: ShapeBuilderFace[] = []
    let rest: Path | null = shape.path.copy()
    for (const face of faces) {
      const inside = r.ck.Path.MakeFromOp(face.path, shape.path, PathOp.Intersect)
      const outside = r.ck.Path.MakeFromOp(face.path, shape.path, PathOp.Difference)
      if (inside && hasArea(inside)) next.push({ path: inside, owners: [...face.owners, shape.id] })
      else inside?.delete()
      if (outside && hasArea(outside)) next.push({ path: outside, owners: face.owners })
      else outside?.delete()
      if (rest) {
        const remaining = r.ck.Path.MakeFromOp(rest, face.path, PathOp.Difference)
        rest.delete()
        rest = remaining
      }
      face.path.delete()
    }
    if (rest && hasArea(rest)) next.push({ path: rest, owners: [shape.id] })
    else rest?.delete()
    faces = next
  }
  return faces
}
