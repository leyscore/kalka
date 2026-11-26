import type { Path } from 'canvaskit-wasm'

import type { SceneGraph, SceneNode } from '@kalka/scene-graph'
import { getWorldMatrix } from '@kalka/scene-graph/coordinate'

import { drawsStrokeOutline } from '#core/vector/stroke-outline'

import {
  baseShapePath,
  canMakeBooleanSourceNode,
  makeBooleanSourcePath,
  makeStrokeOutlinePath,
  nodeHasVisibleStroke
} from './boolean'
import type { SkiaRenderer } from './renderer'
import { strokeOutlinePath } from './stroke-outline'

/** Areas smaller than this, in square pixels of their bounds, are slivers left by the ops. */
const MIN_FACE_AREA = 0.5

/** Layers the Shape builder cuts into regions: shapes, paths and lines, not frames or text. */
export function canBuildShapeFrom(node: SceneNode, graph: SceneGraph): boolean {
  return (
    (node.type === 'RECTANGLE' ||
      node.type === 'LINE' ||
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
  return local ? placeOnPage(r, graph, node, local) : null
}

function placeOnPage(r: SkiaRenderer, graph: SceneGraph, node: SceneNode, local: Path): Path {
  const placed = new r.ck.PathBuilder()
  placed.addPath(local, getWorldMatrix(node, graph))
  local.delete()
  return placed.detachAndDelete()
}

/** One part of a layer the Shape builder cuts: its fill, or its stroke as an area of its own. */
export interface ShapeBuilderPart {
  id: string
  stroke: boolean
  path: Path
}

function strokeArea(r: SkiaRenderer, graph: SceneGraph, node: SceneNode): Path | null {
  const stroke = node.strokes.find((item) => item.visible && item.weight > 0)
  if (stroke && drawsStrokeOutline(node)) return strokeOutlinePath(r, node, stroke)
  return makeStrokeOutlinePath(r, node, graph)
}

/**
 * A layer's parts on the page, fill first. As in Figma Draw, a stroke is a region of its own the
 * fill stops at, so a line or an open path cuts the shapes it crosses; a layer without a stroke is
 * one part, its filled area.
 */
export function pageShapeParts(
  r: SkiaRenderer,
  graph: SceneGraph,
  node: SceneNode
): ShapeBuilderPart[] {
  if (node.type === 'BOOLEAN_OPERATION' || !nodeHasVisibleStroke(node)) {
    const path = pageShapePath(r, graph, node)
    return path ? [{ id: node.id, stroke: false, path }] : []
  }
  const parts: ShapeBuilderPart[] = []
  if (node.type !== 'LINE' && node.fills.some((fill) => fill.visible)) {
    const fill = baseShapePath(r, node)
    if (fill) parts.push({ id: node.id, stroke: false, path: placeOnPage(r, graph, node, fill) })
  }
  const stroke = strokeArea(r, graph, node)
  if (stroke) parts.push({ id: node.id, stroke: true, path: placeOnPage(r, graph, node, stroke) })
  return parts
}

function hasArea(path: Path): boolean {
  if (path.isEmpty()) return false
  const [left, top, right, bottom] = path.computeTightBounds()
  return (right - left) * (bottom - top) >= MIN_FACE_AREA
}

/** How many numbers follow each path verb in `toCmds`; -1 for a verb this does not know. */
function verbArguments(r: SkiaRenderer, verb: number): number {
  const { ck } = r
  if (verb === ck.MOVE_VERB || verb === ck.LINE_VERB) return 2
  if (verb === ck.QUAD_VERB) return 4
  if (verb === ck.CONIC_VERB) return 5
  if (verb === ck.CUBIC_VERB) return 6
  if (verb === ck.CLOSE_VERB) return 0
  return -1
}

/** A path's contours, each as the commands that draw it. */
function contourCommands(r: SkiaRenderer, path: Path): number[][] {
  const cmds = path.toCmds()
  const contours: number[][] = []
  let index = 0
  while (index < cmds.length) {
    const verb = cmds[index]
    const count = verbArguments(r, verb)
    if (count < 0) return []
    if (verb === r.ck.MOVE_VERB || contours.length === 0) contours.push([])
    contours[contours.length - 1].push(...cmds.subarray(index, index + 1 + count))
    index += 1 + count
  }
  return contours
}

/**
 * A region's separate pieces, each an outer contour with the holes in it, as a line across a
 * square leaves two halves Figma's Shape builder picks one at a time. The caller deletes them.
 */
function separatePieces(r: SkiaRenderer, path: Path): Path[] {
  const loops = contourCommands(r, path).flatMap((cmds) => {
    const loop = r.ck.Path.MakeFromCmds(cmds)
    return loop ? [{ cmds, loop }] : []
  })
  if (loops.length <= 1) {
    for (const { loop } of loops) loop.delete()
    return [path.copy()]
  }
  // A contour inside an odd number of others is a hole, in the deepest one around it.
  const containers = loops.map(({ loop }, index) => {
    const [x, y] = loop.getPoint(0)
    return loops.flatMap((other, at) => (at !== index && other.loop.contains(x, y) ? [at] : []))
  })
  const pieces = new Map<number, number[]>()
  containers.forEach((around, index) => {
    const outer =
      around.length % 2 === 0
        ? index
        : around.reduce((best, at) => (containers[at].length > containers[best].length ? at : best))
    pieces.set(outer, [...(pieces.get(outer) ?? []), ...loops[index].cmds])
  })
  for (const { loop } of loops) loop.delete()
  return [...pieces.values()].flatMap((cmds) => {
    const piece = r.ck.Path.MakeFromCmds(cmds)
    if (!piece) return []
    piece.setFillType(path.getFillType())
    return [piece]
  })
}

/**
 * One region of the arrangement: where exactly the `owners` overlap, and nothing else, bottom to
 * top. `topStroke` is whether the top one covers it with its stroke rather than its fill.
 */
export interface ShapeBuilderFace {
  path: Path
  owners: string[]
  topStroke: boolean
}

/**
 * The regions overlapping shapes cut each other into, as Figma's Shape builder shows them: each
 * shape in turn splits every region so far into the part inside it and the part outside, and adds
 * what it covers alone. The caller deletes the paths.
 */
export function shapeBuilderFaces(
  r: SkiaRenderer,
  shapes: readonly { id: string; path: Path; stroke?: boolean }[]
): ShapeBuilderFace[] {
  const { PathOp } = r.ck
  let faces: ShapeBuilderFace[] = []
  for (const shape of shapes) {
    const next: ShapeBuilderFace[] = []
    let rest: Path | null = shape.path.copy()
    for (const face of faces) {
      const inside = r.ck.Path.MakeFromOp(face.path, shape.path, PathOp.Intersect)
      const outside = r.ck.Path.MakeFromOp(face.path, shape.path, PathOp.Difference)
      if (inside && hasArea(inside)) {
        next.push({
          path: inside,
          owners: [...face.owners, shape.id],
          topStroke: shape.stroke ?? false
        })
      } else inside?.delete()
      if (outside && hasArea(outside)) {
        next.push({ path: outside, owners: face.owners, topStroke: face.topStroke })
      } else outside?.delete()
      if (rest) {
        const remaining = r.ck.Path.MakeFromOp(rest, face.path, PathOp.Difference)
        rest.delete()
        rest = remaining
      }
      face.path.delete()
    }
    if (rest && hasArea(rest)) {
      next.push({ path: rest, owners: [shape.id], topStroke: shape.stroke ?? false })
    } else rest?.delete()
    faces = next
  }
  return faces.flatMap((face) => {
    const pieces = separatePieces(r, face.path)
    face.path.delete()
    return pieces.flatMap((path) => {
      if (hasArea(path)) return [{ ...face, path }]
      path.delete()
      return []
    })
  })
}
