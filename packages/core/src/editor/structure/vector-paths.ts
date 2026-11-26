import type { SceneNode, VectorNetwork } from '@kalka/scene-graph'
import { getNodeLocalMatrix } from '@kalka/scene-graph/coordinate'
import Matrix from '@kalka/scene-graph/matrix'

import { canOffsetNode, offsetNodeToVectorProps, type OffsetPathOptions } from '#core/canvas/offset'
import { getNodeEditCapability } from '#core/editor/capabilities'
import { captureDocumentChange, restoreDocumentChange } from '#core/editor/history/document-change'
import type { EditorContext } from '#core/editor/types'
import {
  computeAccurateBounds,
  regenerateFillGeometry,
  reversePathDirection,
  simplifyVectorNetwork
} from '#core/vector'

/**
 * The changes that give a vector a new path in its own frame: the box follows the path and the
 * layer's rotation and flips stay, so the path does not move on the page.
 */
export function vectorNetworkChanges(node: SceneNode, network: VectorNetwork): Partial<SceneNode> {
  const bounds = computeAccurateBounds(network)
  const vectorNetwork: VectorNetwork = {
    vertices: network.vertices.map((v) => ({ ...v, x: v.x - bounds.x, y: v.y - bounds.y })),
    segments: network.segments,
    regions: network.regions
  }
  const center = Matrix.mapPoint(getNodeLocalMatrix(node), {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2
  })
  return {
    x: center.x - bounds.width / 2,
    y: center.y - bounds.height / 2,
    width: bounds.width,
    height: bounds.height,
    vectorNetwork,
    fillGeometry: regenerateFillGeometry(vectorNetwork, node.fillGeometry),
    strokeGeometry: []
  }
}

/**
 * Figma's Vector menu commands on whole layers: Simplify vector, Reverse path direction and
 * Offset path. Each is one undo step over the selection.
 */
export function createVectorPathActions(ctx: EditorContext) {
  function selection(): SceneNode[] {
    return [...ctx.state.selectedIds]
      .map((id) => ctx.graph.getNode(id))
      .filter(
        (node): node is SceneNode =>
          node !== undefined && getNodeEditCapability(ctx.graph, node.id).editable
      )
  }

  function selectedVectors(): SceneNode[] {
    return selection().filter((node) => node.type === 'VECTOR' && node.vectorNetwork)
  }

  function record(label: string, edit: () => Set<string> | null): boolean {
    const before = new Set(ctx.state.selectedIds)
    const finish = captureDocumentChange(ctx.graph, ctx.state.currentPageId)
    let after: Set<string> | null = null
    try {
      after = edit()
    } finally {
      const change = finish()
      if (after) {
        const selected = after
        ctx.setSelectedIds(new Set(selected))
        ctx.undo.push({
          label,
          forward: () => {
            restoreDocumentChange(ctx, change, 'after')
            ctx.setSelectedIds(new Set(selected))
          },
          inverse: () => {
            restoreDocumentChange(ctx, change, 'before')
            ctx.setSelectedIds(new Set(before))
          }
        })
        ctx.requestRender()
      }
    }
    return after !== null
  }

  function rewritePaths(label: string, rewrite: (network: VectorNetwork) => VectorNetwork) {
    const vectors = selectedVectors()
    if (vectors.length === 0) return false
    return record(label, () => {
      let changed = false
      for (const node of vectors) {
        if (!node.vectorNetwork) continue
        const next = rewrite(node.vectorNetwork)
        if (next === node.vectorNetwork) continue
        ctx.graph.updateNode(node.id, vectorNetworkChanges(node, next))
        changed = true
      }
      return changed ? new Set(ctx.state.selectedIds) : null
    })
  }

  /** Refits each selected vector with fewer points; `tolerance` is in pixels. */
  function simplifyVectorSelected(tolerance?: number): boolean {
    return rewritePaths('Simplify vector', (network) => simplifyVectorNetwork(network, tolerance))
  }

  function reversePathSelected(): boolean {
    return rewritePaths('Reverse path direction', reversePathDirection)
  }

  function canOffsetPathSelected(): boolean {
    return selection().some(canOffsetNode)
  }

  /**
   * Draws each selected shape's offset path as a new vector just above it and selects the new
   * paths; the shapes stay as they were. Needs CanvasKit for the outlines.
   */
  function offsetPathSelected(options: OffsetPathOptions): boolean {
    const renderer = ctx.getRenderer()
    const nodes = selection().filter(canOffsetNode)
    if (!renderer || nodes.length === 0 || options.offset === 0) return false
    return record('Offset path', () => {
      const created = new Set<string>()
      for (const node of nodes) {
        const parent = node.parentId ? ctx.graph.getNode(node.parentId) : undefined
        if (!parent) continue
        const props = offsetNodeToVectorProps(renderer, ctx.graph, node, options)
        if (!props) continue
        const vector = ctx.graph.createNode('VECTOR', parent.id, props)
        ctx.graph.insertChildAt(vector.id, parent.id, parent.childIds.indexOf(node.id) + 1)
        created.add(vector.id)
      }
      return created.size > 0 ? created : null
    })
  }

  return {
    simplifyVectorSelected,
    reversePathSelected,
    canOffsetPathSelected,
    offsetPathSelected,
    canEditPathsSelected: () => selectedVectors().length > 0
  }
}
