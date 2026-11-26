import type { Path } from 'canvaskit-wasm'
import { pick } from 'es-toolkit/object'

import { PAINT_FIELDS, STROKE_FIELDS, type SceneNode } from '@kalka/scene-graph'
import { getWorldMatrix } from '@kalka/scene-graph/coordinate'
import Matrix from '@kalka/scene-graph/matrix'
import { parseSVGPath } from '@kalka/scene-graph/parse-path'

import type { SkiaRenderer } from '#core/canvas/renderer'
import {
  canBuildShapeFrom,
  pageShapePath,
  shapeBuilderFaces,
  type ShapeBuilderFace
} from '#core/canvas/shape-builder'
import { getNodeEditCapability } from '#core/editor/capabilities'
import { captureDocumentChange, restoreDocumentChange } from '#core/editor/history/document-change'
import type { EditorContext } from '#core/editor/types'

export type ShapeBuilderMode = 'merge' | 'remove'

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
  dispose: () => void
}

/**
 * Figma's Shape builder (Shift+M) over the selected shapes. Merging regions makes one new vector
 * with the paints of the top shape under the first region, and cuts it out of the shapes it came
 * from; removing cuts the regions out. A shape that changes becomes a vector with its paints.
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

  /** Puts a vector with `source`'s paints and the path's shape at `index` in its parent. */
  function placeVector(
    r: SkiaRenderer,
    source: SceneNode,
    path: Path,
    index: number,
    name = source.name
  ): string | null {
    const parentId = source.parentId
    const fields = parentId ? vectorFields(r, path, parentId) : null
    if (!parentId || !fields) return null
    const vector = ctx.graph.createNode('VECTOR', parentId, {
      ...structuredClone(pick(source, [...PAINT_FIELDS, ...STROKE_FIELDS])),
      ...fields,
      name
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
    let shapes: { id: string; path: Path }[] = []
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
        const path = node ? pageShapePath(renderer, ctx.graph, node) : null
        return path ? [{ id, path }] : []
      })
      // Bottom to top, so a region's last owner is the shape drawn over the others there.
      shapes.sort((a, b) => stackOrder(a.id) - stackOrder(b.id))
      faces = shapeBuilderFaces(renderer, shapes)
    }

    function stackOrder(id: string): number {
      const node = ctx.graph.getNode(id)
      return node ? indexInParent(node) : 0
    }

    function apply(chosen: readonly number[], mode: ShapeBuilderMode): boolean {
      const picked = [...new Set(chosen)].flatMap((i) => (faces[i] ? [faces[i]] : []))
      if (picked.length === 0) return false
      // The regions touch along shared edges; a union makes them one outline.
      let united: Path | null = picked[0].path.copy()
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
      if (!united) return false

      const before = new Set(ctx.state.selectedIds)
      const finish = captureDocumentChange(ctx.graph, ctx.state.currentPageId)
      const touched = new Set(picked.flatMap((face) => face.owners))
      const next = ids.filter((id) => !touched.has(id))
      const topOwner = ctx.graph.getNode(picked[0].owners[picked[0].owners.length - 1])
      if (mode === 'merge' && topOwner) {
        const merged = placeVector(renderer, topOwner, united, indexInParent(topOwner) + 1)
        if (merged) next.push(merged)
      }
      for (const shape of shapes) {
        if (!touched.has(shape.id)) continue
        const node = ctx.graph.getNode(shape.id)
        const left = renderer.ck.Path.MakeFromOp(shape.path, united, renderer.ck.PathOp.Difference)
        if (node && left && !left.isEmpty()) {
          const replaced = placeVector(renderer, node, left, indexInParent(node))
          if (replaced) next.push(replaced)
        }
        left?.delete()
        ctx.graph.deleteNode(shape.id)
      }
      united.delete()

      const change = finish()
      ids = next
      const selected = new Set(ids)
      ctx.setSelectedIds(new Set(selected))
      ctx.undo.push({
        label: 'Shape builder',
        forward: () => {
          restoreDocumentChange(ctx, change, 'after')
          ctx.setSelectedIds(new Set(selected))
        },
        inverse: () => {
          restoreDocumentChange(ctx, change, 'before')
          ctx.setSelectedIds(new Set(before))
        }
      })
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
      dispose: release
    }
  }

  return { beginShapeBuilder }
}
