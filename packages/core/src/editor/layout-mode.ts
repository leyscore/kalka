import { pick } from 'es-toolkit/object'

import type { LayoutMode, SceneNode } from '@kalka/scene-graph'
import { getAxisAlignedBoundsInParent } from '@kalka/scene-graph/coordinate'

import { computeLayout } from '#core/layout'

import { flowOrder, inferredCounterAlign, inferredFlow, inferredSpacing } from './layout-inference'
import type { EditorContext } from './types'

export function createLayoutModeActions(ctx: EditorContext) {
  function setLayoutMode(id: string, mode: LayoutMode) {
    const node = ctx.graph.getNode(id)
    if (!node) return

    const previous = captureLayoutState(node)
    const updates = layoutModeUpdates(ctx, node, id, mode)

    ctx.graph.updateNode(id, updates)
    if (mode !== 'NONE') computeLayout(ctx.graph, id)
    ctx.runLayoutForNode(id)

    const updated = ctx.graph.getNode(id)
    if (!updated) return
    const finalState = pickState(updated, Object.keys(previous) as (keyof SceneNode)[])

    ctx.undo.push({
      label: mode === 'NONE' ? 'Remove auto layout' : 'Add auto layout',
      forward: () => {
        ctx.graph.updateNode(id, finalState)
        if (mode !== 'NONE') computeLayout(ctx.graph, id)
        ctx.runLayoutForNode(id)
      },
      inverse: () => {
        ctx.graph.updateNode(id, previous)
        ctx.runLayoutForNode(id)
      }
    })
  }

  /**
   * Gives a frame auto layout as Shift+A does in Figma: the flow follows how its layers are
   * spread, a row or a column, and they keep their order along it, so the frame looks the same.
   */
  function addAutoLayout(id: string) {
    const node = ctx.graph.getNode(id)
    if (node?.layoutMode !== 'NONE') return
    const children = flowChildren(ctx, node)
    const boxes = children.map((child) => getAxisAlignedBoundsInParent([child], id, ctx.graph))
    const mode = inferredFlow(boxes)
    const order = flowOrder(boxes, mode).map((index) => children[index].id)
    const previousOrder = [...node.childIds]
    ctx.undo.runBatch('Add auto layout', () => {
      const flowIds = new Set(order)
      // The flow takes the layers in the order they read; absolute layers keep their places.
      const queue = [...order]
      const nextOrder = previousOrder.map((childId) =>
        flowIds.has(childId) ? (queue.shift() ?? childId) : childId
      )
      const reorder = (ids: readonly string[]) =>
        ids.forEach((childId, index) => ctx.graph.insertChildAt(childId, id, index))
      if (nextOrder.some((childId, index) => childId !== previousOrder[index])) {
        reorder(nextOrder)
        ctx.undo.push({
          label: 'Add auto layout',
          forward: () => reorder(nextOrder),
          inverse: () => reorder(previousOrder)
        })
      }
      setLayoutMode(id, mode)
    })
  }

  return { setLayoutMode, addAutoLayout }
}

/** The layers a frame's auto layout lays out: those not positioned absolutely. */
function flowChildren(ctx: EditorContext, node: SceneNode): SceneNode[] {
  return ctx.graph.getChildren(node.id).filter((child) => child.layoutPositioning !== 'ABSOLUTE')
}

function captureLayoutState(node: SceneNode): Partial<SceneNode> {
  return {
    layoutMode: node.layoutMode,
    itemSpacing: node.itemSpacing,
    paddingTop: node.paddingTop,
    paddingRight: node.paddingRight,
    paddingBottom: node.paddingBottom,
    paddingLeft: node.paddingLeft,
    primaryAxisSizing: node.primaryAxisSizing,
    counterAxisSizing: node.counterAxisSizing,
    primaryAxisAlign: node.primaryAxisAlign,
    counterAxisAlign: node.counterAxisAlign,
    gridTemplateColumns: node.gridTemplateColumns,
    gridTemplateRows: node.gridTemplateRows,
    gridColumnGap: node.gridColumnGap,
    gridRowGap: node.gridRowGap,
    width: node.width,
    height: node.height
  }
}

function pickState(node: SceneNode, keys: (keyof SceneNode)[]): Partial<SceneNode> {
  return pick(node, keys) as Partial<SceneNode>
}

function layoutModeUpdates(
  ctx: EditorContext,
  node: SceneNode,
  id: string,
  mode: LayoutMode
): Partial<SceneNode> {
  const updates: Partial<SceneNode> = { layoutMode: mode }
  if (mode === 'GRID' && node.layoutMode !== 'GRID') {
    applyGridDefaults(ctx, node, id, updates)
  } else if ((mode === 'HORIZONTAL' || mode === 'VERTICAL') && node.layoutMode === 'NONE') {
    Object.assign(updates, autoLayoutDefaults(ctx, node, mode))
  } else if ((mode === 'HORIZONTAL' || mode === 'VERTICAL') && node.layoutMode === 'GRID') {
    // As in Figma, the gaps stay when the flow changes: along the new flow, then across it.
    const along = mode === 'HORIZONTAL' ? node.gridColumnGap : node.gridRowGap
    const across = mode === 'HORIZONTAL' ? node.gridRowGap : node.gridColumnGap
    updates.itemSpacing = along
    updates.counterAxisSpacing = across
  }
  return updates
}

function applyGridDefaults(
  ctx: EditorContext,
  node: SceneNode,
  id: string,
  updates: Partial<SceneNode>
) {
  const children = ctx.graph.getChildren(id)
  const cols = Math.max(2, Math.ceil(Math.sqrt(children.length)))
  const rows = Math.max(1, Math.ceil(children.length / cols))
  updates.gridTemplateColumns = Array.from({ length: cols }, () => ({
    sizing: 'FR' as const,
    value: 1
  }))
  updates.gridTemplateRows = Array.from({ length: rows }, () => ({
    sizing: 'FR' as const,
    value: 1
  }))
  // A flow's gaps carry over to the grid, as Figma keeps them when the flow changes.
  const flows = node.layoutMode === 'HORIZONTAL' || node.layoutMode === 'VERTICAL'
  const along = flows ? node.itemSpacing : 0
  const across = flows ? node.counterAxisSpacing : 0
  updates.gridColumnGap = node.layoutMode === 'VERTICAL' ? across : along
  updates.gridRowGap = node.layoutMode === 'VERTICAL' ? along : across
  // A frame that hugged its layers keeps hugging the grid, so gaps and new rows grow it.
  const hugged = flows && (node.primaryAxisSizing === 'HUG' || node.counterAxisSizing === 'HUG')
  updates.primaryAxisSizing = hugged ? 'HUG' : 'FIXED'
  updates.counterAxisSizing = hugged ? 'HUG' : 'FIXED'
  if (!flows) {
    updates.paddingTop = 0
    updates.paddingRight = 0
    updates.paddingBottom = 0
    updates.paddingLeft = 0
  }
}

/**
 * Figma keeps a frame's look when it gains auto layout: an empty frame keeps its fixed size, and a
 * frame with layers hugs them with the padding and spacing they already have, so it stays in place.
 */
function autoLayoutDefaults(
  ctx: EditorContext,
  node: SceneNode,
  mode: 'HORIZONTAL' | 'VERTICAL'
): Partial<SceneNode> {
  const children = flowChildren(ctx, node)
  const boxes = children.map((child) => getAxisAlignedBoundsInParent([child], node.id, ctx.graph))
  const base: Partial<SceneNode> = {
    primaryAxisAlign: 'MIN',
    counterAxisAlign: inferredCounterAlign(boxes, mode)
  }
  if (children.length === 0) {
    return {
      ...base,
      itemSpacing: 0,
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      primaryAxisSizing: 'FIXED',
      counterAxisSizing: 'FIXED'
    }
  }
  const content = getAxisAlignedBoundsInParent(children, node.id, ctx.graph)
  const inset = (value: number) => Math.max(0, Math.round(value))
  const itemSpacing = inferredSpacing(boxes, mode)
  const padding = {
    paddingTop: inset(content.y),
    paddingRight: inset(node.width - content.x - content.width),
    paddingBottom: inset(node.height - content.y - content.height),
    paddingLeft: inset(content.x)
  }
  return {
    ...base,
    itemSpacing,
    ...padding,
    primaryAxisSizing: 'HUG',
    counterAxisSizing: 'HUG'
  }
}
