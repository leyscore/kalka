import { findInstanceAncestor, setInstanceOverride } from '@kalka/scene-graph'

import { assertNodeEditable } from '#core/editor/capabilities'
import {
  applyBoundVisibilityEdit,
  bindsVisibility
} from '#core/editor/components/authoring/visibility-edit'
import type { EditorContext } from '#core/editor/types'

export function createStructureStateActions(ctx: EditorContext) {
  /** Shows or hides a layer; one a boolean property drives sets the property, as in Figma. */
  function setNodeVisibility(id: string, visible: boolean) {
    const node = ctx.graph.getNode(id)
    if (!node) return
    const owner = findInstanceAncestor(ctx.graph, id)
    // The property takes the value even where the layer already shows it, so the two agree.
    if (owner && bindsVisibility(node) && applyBoundVisibilityEdit(ctx, id, visible)) return
    if (node.visible === visible) return
    if (owner) setInstanceOverride(owner.instanceOverrides, owner.id, id, 'visible', true)
    ctx.graph.updateNode(id, { visible })
    if (node.parentId) ctx.runLayoutForNode(node.parentId)
  }

  function toggleNodeVisibility(id: string) {
    assertNodeEditable(ctx.graph, id)
    const node = ctx.graph.getNode(id)
    if (node) setNodeVisibility(id, !node.visible)
  }

  function toggleNodeLock(id: string) {
    assertNodeEditable(ctx.graph, id)
    const node = ctx.graph.getNode(id)
    if (!node) return
    ctx.graph.updateNode(id, { locked: !node.locked })
  }

  function toggleVisibility() {
    for (const id of ctx.state.selectedIds) assertNodeEditable(ctx.graph, id)
    // Each layer takes the opposite of what it showed before any of them changed: layers a
    // property drives together would otherwise toggle it back and forth.
    const targets = [...ctx.state.selectedIds].flatMap((id) => {
      const node = ctx.graph.getNode(id)
      return node ? [[id, !node.visible] as const] : []
    })
    for (const [id, visible] of targets) setNodeVisibility(id, visible)
  }

  function toggleLock() {
    for (const id of ctx.state.selectedIds) assertNodeEditable(ctx.graph, id)
    for (const id of ctx.state.selectedIds) toggleNodeLock(id)
  }

  return { toggleNodeVisibility, toggleNodeLock, toggleVisibility, toggleLock }
}
