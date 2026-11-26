import type { Path } from 'canvaskit-wasm'
import { omit, pick } from 'es-toolkit/object'

import { PAINT_FIELDS, STROKE_FIELDS, type SceneNode } from '@kalka/scene-graph'
import { getWorldMatrix } from '@kalka/scene-graph/coordinate'
import Matrix from '@kalka/scene-graph/matrix'
import { parseSVGPath } from '@kalka/scene-graph/parse-path'
import type { Color } from '@kalka/scene-graph/primitives'

import type { SkiaRenderer } from '#core/canvas/renderer'
import {
  canBuildShapeFrom,
  pageShapeParts,
  shapeBuilderFaces,
  type ShapeBuilderFace,
  type ShapeBuilderPart
} from '#core/canvas/shape-builder'
import { getNodeEditCapability } from '#core/editor/capabilities'
import { captureDocumentChange, pushDocumentChange } from '#core/editor/history/document-change'
import type { EditorContext } from '#core/editor/types'

export type ShapeBuilderMode = 'merge' | 'remove'

/** What a drag over regions would make: the merged or removed area, and the merged shape's color. */
export interface ShapeBuilderPreview {
  /** SVG path data on the page. */
  d: string
  /** The first solid paint the merged shape takes; null when removing or not solid. */
  color: Color | null
}

export interface ShapeBuilderSession {
  /** The region under a page point, or null. */
  faceAt: (x: number, y: number) => number | null
  /** Each region's outline as SVG path data on the page. */
  outlines: () => string[]
  /**
   * Merges the regions into one shape, or removes them with `remove`: one undo step, after which
   * the regions are cut again from the shapes as they now are. Whether anything changed.
   */
  apply: (faces: readonly number[], mode: ShapeBuilderMode) => boolean
  /** The outcome of applying the regions, for the drag to show before it lets go. */
  preview: (faces: readonly number[], mode: ShapeBuilderMode) => ShapeBuilderPreview | null
  dispose: () => void
}

/**
 * Figma's Shape builder (Shift+M) over the selected shapes. Merging regions makes one new vector
 * with the paints of the top shape under the first region, and cuts it out of the shapes it came
 * from; removing cuts the regions out. A shape that changes becomes a vector with its paints. A
 * stroke is its own region: what is left of a stroked shape becomes a vector of its fill and one
 * of its stroke, as Outline stroke makes it, and a region of a stroke merges in the stroke's paint.
 */
export function createShapeBuilderActions(ctx: EditorContext) {
  function shapeIds(ids: Iterable<string>): string[] {
    return [...ids].filter((id) => {
      const node = ctx.graph.getNode(id)
      return (
        node !== undefined &&
        !node.locked &&
        canBuildShapeFrom(node, ctx.graph) &&
        getNodeEditCapability(ctx.graph, id).editable
      )
    })
  }

  /** The page path as vector fields of a layer in `parentId`. */
  function vectorFields(r: SkiaRenderer, path: Path, parentId: string): Partial<SceneNode> | null {
    const parent = ctx.graph.getNode(parentId)
    const inverse = parent ? Matrix.invert(getWorldMatrix(parent, ctx.graph)) : null
    if (!inverse) return null
    const local = new r.ck.PathBuilder()
    local.addPath(path, inverse)
    const bounds = local.getBounds()
    if (bounds[2] <= bounds[0] || bounds[3] <= bounds[1]) {
      local.delete()
      return null
    }
    local.transform(r.ck.Matrix.translated(-bounds[0], -bounds[1]))
    const placed = local.detachAndDelete()
    const vectorNetwork = parseSVGPath(placed.toSVGString())
    placed.delete()
    return {
      x: bounds[0],
      y: bounds[1],
      width: bounds[2] - bounds[0],
      height: bounds[3] - bounds[1],
      rotation: 0,
      flipX: false,
      flipY: false,
      vectorNetwork,
      fillGeometry: [],
      strokeGeometry: []
    }
  }

  /**
   * The paints a part of `source` keeps: a fill part its fills (and its strokes when they are not
   * a part of their own), a stroke part its strokes as fills.
   */
  function partPaints(
    source: SceneNode,
    stroke: boolean,
    strokeSplit: boolean
  ): Partial<SceneNode> {
    const paints = structuredClone(pick(source, [...PAINT_FIELDS, ...STROKE_FIELDS]))
    if (stroke) {
      const fills = source.strokes
        .filter((item) => item.visible)
        .map((item) =>
          omit(structuredClone(item), ['weight', 'align', 'cap', 'join', 'dashPattern'])
        )
      return { ...paints, fills, strokes: [] }
    }
    return strokeSplit ? { ...paints, strokes: [] } : paints
  }

  /** Puts a vector with a part of `source`'s paints and the path's shape at `index` in its parent. */
  function placeVector(
    r: SkiaRenderer,
    source: SceneNode,
    path: Path,
    index: number,
    paints: Partial<SceneNode>
  ): string | null {
    const parentId = source.parentId
    const fields = parentId ? vectorFields(r, path, parentId) : null
    if (!parentId || !fields) return null
    const vector = ctx.graph.createNode('VECTOR', parentId, {
      ...paints,
      ...fields,
      name: source.name
    })
    ctx.graph.insertChildAt(vector.id, parentId, index)
    return vector.id
  }

  function indexInParent(node: SceneNode): number {
    const parent = node.parentId ? ctx.graph.getNode(node.parentId) : undefined
    return parent ? parent.childIds.indexOf(node.id) : 0
  }

  function beginShapeBuilder(): ShapeBuilderSession | null {
    const r = ctx.getRenderer()
    let ids = shapeIds(ctx.state.selectedIds)
    if (!r || ids.length === 0) return null
    const renderer = r
    let shapes: ShapeBuilderPart[] = []
    let faces: ShapeBuilderFace[] = []

    function release() {
      for (const face of faces) face.path.delete()
      for (const shape of shapes) shape.path.delete()
      faces = []
      shapes = []
    }

    function rebuild() {
      release()
      shapes = ids.flatMap((id) => {
        const node = ctx.graph.getNode(id)
        return node ? pageShapeParts(renderer, ctx.graph, node) : []
      })
      // Bottom to top, so a region's last owner is the shape drawn over the others there; the
      // sort keeps a layer's fill under its stroke.
      shapes.sort((a, b) => stackOrder(a.id) - stackOrder(b.id))
      faces = shapeBuilderFaces(renderer, shapes)
    }

    function stackOrder(id: string): number {
      const node = ctx.graph.getNode(id)
      return node ? indexInParent(node) : 0
    }

    function pickedFaces(chosen: readonly number[]): ShapeBuilderFace[] {
      return [...new Set(chosen)].flatMap((i) => (faces[i] ? [faces[i]] : []))
    }

    /** The regions as one outline: they touch along shared edges. The caller deletes it. */
    function unite(picked: readonly ShapeBuilderFace[]): Path | null {
      let united: Path | null = picked.length > 0 ? picked[0].path.copy() : null
      for (const face of picked.slice(1)) {
        if (!united) break
        const next: Path | null = renderer.ck.Path.MakeFromOp(
          united,
          face.path,
          renderer.ck.PathOp.Union
        )
        united.delete()
        united = next
      }
      return united
    }

    function hasStrokePart(id: string): boolean {
      return shapes.some((shape) => shape.id === id && shape.stroke)
    }

    /** The node a merge takes its paints from, and whether from its stroke. */
    function mergeSource(face: ShapeBuilderFace) {
      const node = ctx.graph.getNode(face.owners[face.owners.length - 1])
      return node ? { node, stroke: face.topStroke } : null
    }

    function preview(
      chosen: readonly number[],
      mode: ShapeBuilderMode
    ): ShapeBuilderPreview | null {
      const picked = pickedFaces(chosen)
      const united = unite(picked)
      if (!united) return null
      const d = united.toSVGString()
      united.delete()
      const source = mode === 'merge' ? mergeSource(picked[0]) : null
      const paints = source ? (source.stroke ? source.node.strokes : source.node.fills) : []
      const solid = paints.find((paint) => paint.visible && paint.type === 'SOLID')
      return {
        d,
        color: solid ? { ...solid.color, a: solid.color.a * solid.opacity } : null
      }
    }

    function apply(chosen: readonly number[], mode: ShapeBuilderMode): boolean {
      const picked = pickedFaces(chosen)
      const united = unite(picked)
      if (!united) return false

      const before = new Set(ctx.state.selectedIds)
      const finish = captureDocumentChange(ctx.graph, ctx.state.currentPageId)
      const touched = new Set(picked.flatMap((face) => face.owners))
      const next = ids.filter((id) => !touched.has(id))
      const source = mode === 'merge' ? mergeSource(picked[0]) : null
      if (source) {
        const paints = partPaints(source.node, source.stroke, hasStrokePart(source.node.id))
        const index = indexInParent(source.node) + 1
        const merged = placeVector(renderer, source.node, united, index, paints)
        if (merged) next.push(merged)
      }
      for (const id of touched) {
        const node = ctx.graph.getNode(id)
        if (!node) continue
        const split = hasStrokePart(id)
        let index = indexInParent(node)
        for (const part of shapes.filter((shape) => shape.id === id)) {
          const op = renderer.ck.PathOp.Difference
          const left = renderer.ck.Path.MakeFromOp(part.path, united, op)
          if (left && !left.isEmpty()) {
            const paints = partPaints(node, part.stroke, split)
            const replaced = placeVector(renderer, node, left, index, paints)
            if (replaced) {
              next.push(replaced)
              index++
            }
          }
          left?.delete()
        }
        ctx.graph.deleteNode(id)
      }
      united.delete()

      const change = finish()
      ids = next
      const selected = new Set(ids)
      ctx.setSelectedIds(new Set(selected))
      pushDocumentChange(ctx, 'Shape builder', change, before, selected)
      rebuild()
      ctx.requestRender()
      return true
    }

    rebuild()
    return {
      faceAt(x, y) {
        // The last regions are the ones cut by the top shapes; the first hit from the top wins.
        for (let i = faces.length - 1; i >= 0; i--) if (faces[i].path.contains(x, y)) return i
        return null
      },
      outlines: () => faces.map((face) => face.path.toSVGString()),
      apply,
      preview,
      dispose: release
    }
  }

  return { beginShapeBuilder }
}
