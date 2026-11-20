import {
  cloneInstanceOverrideState,
  findInstanceAncestor,
  setInstanceOverride
} from '@kalka/scene-graph'

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
    const overrides = owner ? cloneInstanceOverrideState(owner.instanceOverrides) : null
    const show = (value: boolean) => {
      ctx.graph.updateNode(id, { visible: value })
      if (node.parentId) ctx.runLayoutForNode(node.parentId)
    }
    if (owner) setInstanceOverride(owner.instanceOverrides, owner.id, id, 'visible', true)
    show(visible)
    const changedOverrides = owner ? cloneInstanceOverrideState(owner.instanceOverrides) : null
    ctx.undo.push({
      label: visible ? 'Show layer' : 'Hide layer',
      forward: () => {
        if (owner && changedOverrides)
          ctx.graph.updateNode(owner.id, {
            instanceOverrides: cloneInstanceOverrideState(changedOverrides)
          })
        show(visible)
      },
      inverse: () => {
        if (owner && overrides)
          ctx.graph.updateNode(owner.id, {
            instanceOverrides: cloneInstanceOverrideState(overrides)
          })
        show(!visible)
      }
    })
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
    const locked = !node.locked
    ctx.graph.updateNode(id, { locked })
    ctx.undo.push({
      label: locked ? 'Lock layer' : 'Unlock layer',
      forward: () => ctx.graph.updateNode(id, { locked }),
      inverse: () => ctx.graph.updateNode(id, { locked: !locked })
    })
  }

  function toggleVisibility() {
    for (const id of ctx.state.selectedIds) assertNodeEditable(ctx.graph, id)
    // Each layer takes the opposite of what it showed before any of them changed: layers a
    // property drives together would otherwise toggle it back and forth.
    const targets = [...ctx.state.selectedIds].flatMap((id) => {
      const node = ctx.graph.getNode(id)
      return node ? [[id, !node.visible] as const] : []
    })
    ctx.undo.runBatch('Show/hide', () => {
      for (const [id, visible] of targets) setNodeVisibility(id, visible)
    })
  }

  function toggleLock() {
    for (const id of ctx.state.selectedIds) assertNodeEditable(ctx.graph, id)
    ctx.undo.runBatch('Lock/unlock', () => {
      for (const id of ctx.state.selectedIds) toggleNodeLock(id)
    })
  }

  return { toggleNodeVisibility, toggleNodeLock, toggleVisibility, toggleLock }
}
