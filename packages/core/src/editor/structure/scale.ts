import {
  canRescaleNode,
  collectScaleTree,
  rescaleNodeTreeFrom,
  type SceneNode
} from '@kalka/scene-graph'
import { getWorldMatrix } from '@kalka/scene-graph/coordinate'
import Matrix from '@kalka/scene-graph/matrix'
import type { Vector } from '@kalka/scene-graph/primitives'

import { getNodeEditCapability } from '#core/editor/capabilities'
import { captureDocumentChange, pushDocumentChange } from '#core/editor/history/document-change'
import type { EditorContext } from '#core/editor/types'

/** The smallest factor a drag can reach, as `rescale()` allows. */
const MIN_SCALE = 0.01

export interface ScaleSession {
  /** Scales the layers from how they were at the start by `scale` about the anchor. */
  update: (scale: number) => void
  /** Keeps the current scale as one undo step. */
  commit: () => void
  /** Puts the layers back as they were. */
  cancel: () => void
}

interface ScaledRoot {
  id: string
  originals: SceneNode[]
  /** The anchor in the layer's parent frame. */
  anchor: Vector
}

/**
 * Figma's Scale tool (K): a layer and everything in it, strokes, effects, text sizes, radii and
 * spacing included, grow or shrink together, the anchor staying put.
 */
export function createScaleActions(ctx: EditorContext) {
  function scalableIds(ids: Iterable<string>): string[] {
    return [...ids].filter((id) => {
      const node = ctx.graph.getNode(id)
      return (
        node !== undefined &&
        !node.locked &&
        canRescaleNode(node) &&
        getNodeEditCapability(ctx.graph, id).editable
      )
    })
  }

  /** Starts scaling the layers about `anchor`, a page point; null when none can be scaled. */
  function beginScale(nodeIds: Iterable<string>, anchor: Vector): ScaleSession | null {
    const ids = scalableIds(nodeIds)
    if (ids.length === 0) return null
    const roots: ScaledRoot[] = ids.flatMap((id) => {
      const node = ctx.graph.getNode(id)
      const parent = node?.parentId ? ctx.graph.getNode(node.parentId) : undefined
      if (!node || !parent) return []
      const inverse = Matrix.invert(getWorldMatrix(parent, ctx.graph))
      if (!inverse) return []
      return [
        {
          id,
          originals: collectScaleTree(ctx.graph, id).map((n) => structuredClone(n)),
          anchor: Matrix.mapPoint(inverse, anchor)
        }
      ]
    })
    if (roots.length === 0) return null
    const before = new Set(ctx.state.selectedIds)
    const finish = captureDocumentChange(ctx.graph, ctx.state.currentPageId)
    let current = 1
    let done = false

    function apply(scale: number) {
      for (const root of roots) {
        rescaleNodeTreeFrom(ctx.graph, root.originals, root.id, scale)
        const [original] = root.originals
        ctx.graph.updateNode(root.id, {
          x: root.anchor.x + (original.x - root.anchor.x) * scale,
          y: root.anchor.y + (original.y - root.anchor.y) * scale
        })
        if (original.parentId) ctx.runLayoutForNode(original.parentId)
      }
      ctx.requestRender()
    }

    return {
      update(scale) {
        if (done || !Number.isFinite(scale)) return
        current = Math.max(MIN_SCALE, scale)
        apply(current)
      },
      commit() {
        if (done) return
        done = true
        const change = finish()
        if (current === 1) return
        pushDocumentChange(ctx, 'Scale', change, before, new Set(ids))
      },
      cancel() {
        if (done) return
        done = true
        apply(1)
        finish()
      }
    }
  }

  return { beginScale }
}
