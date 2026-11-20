import type { LayoutMode, SceneNode } from '@kalka/scene-graph'
import { getAxisAlignedBoundsInParent } from '@kalka/scene-graph/coordinate'

import { canvasWrapIndex, wrapParentId } from '#core/editor/structure/container-wrap'
import type { EditorContext } from '#core/editor/types'
import { computeLayout } from '#core/layout'

/** Wrap sibling layers in a new auto layout frame; returns the frame, or null if they are not siblings. */
export function wrapInAutoLayout(ctx: EditorContext, selectedNodes: SceneNode[]): string | null {
  const parentId = wrapParentId(ctx, selectedNodes)
  const parent = parentId ? ctx.graph.getNode(parentId) : undefined
  if (!parentId || !parent) return null

  const prevSelection = new Set(ctx.state.selectedIds)
  // Lowest in the stack first, so undo puts each back while the places below it are filled.
  const origPositions = selectedNodes
    .map((n) => ({ id: n.id, x: n.x, y: n.y, index: parent.childIds.indexOf(n.id) }))
    .toSorted((a, b) => a.index - b.index)
  // The frame takes the place of the topmost wrapped layer, as Figma's does.
  const index = canvasWrapIndex(parent, selectedNodes)

  const bounds = getAxisAlignedBoundsInParent(selectedNodes, parentId, ctx.graph)

  const direction: LayoutMode =
    selectedNodes.length <= 1 || bounds.height > bounds.width ? 'VERTICAL' : 'HORIZONTAL'

  const frame = ctx.graph.createNode('FRAME', parentId, {
    name: 'Frame',
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    layoutMode: direction,
    primaryAxisSizing: 'HUG',
    counterAxisSizing: 'HUG',
    primaryAxisAlign: 'MIN',
    counterAxisAlign: 'MIN',
    fills: []
  })
  const frameId = frame.id

  const sortedIds = selectedNodes
    .map((n) => ({ id: n.id, pos: ctx.graph.getAbsolutePosition(n.id) }))
    .sort((a, b) => a.pos.y - b.pos.y || a.pos.x - b.pos.x)
    .map((n) => n.id)

  for (const id of sortedIds) {
    ctx.graph.reparentNode(id, frameId)
  }
  ctx.graph.insertChildAt(frameId, parentId, index)

  computeLayout(ctx.graph, frameId)
  ctx.runLayoutForNode(frameId)
  ctx.setSelectedIds(new Set([frameId]))

  ctx.undo.push({
    label: 'Wrap in auto layout',
    forward: () => {
      const f = ctx.graph.createNode('FRAME', parentId, { ...frame, id: frameId })
      for (const id of sortedIds) ctx.graph.reparentNode(id, f.id)
      ctx.graph.insertChildAt(f.id, parentId, index)
      computeLayout(ctx.graph, f.id)
      ctx.runLayoutForNode(f.id)
      ctx.setSelectedIds(new Set([f.id]))
    },
    inverse: () => {
      for (const orig of origPositions) {
        ctx.graph.reparentNode(orig.id, parentId)
        ctx.graph.updateNode(orig.id, { x: orig.x, y: orig.y })
      }
      ctx.graph.deleteNode(frameId)
      for (const orig of origPositions) ctx.graph.insertChildAt(orig.id, parentId, orig.index)
      ctx.setSelectedIds(prevSelection)
    }
  })
  return frameId
}
