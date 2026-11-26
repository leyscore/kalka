import type { SceneNode } from '@kalka/scene-graph'

import { getNodeEditCapability } from '#core/editor/capabilities'
import { captureDocumentChange, restoreDocumentChange } from '#core/editor/history/document-change'
import type { EditorContext } from '#core/editor/types'

import {
  instanceOverrideGroups,
  pushInstanceOverrides,
  resetInstanceOverrides,
  type InstanceOverrideGroup
} from './overrides'
import { hasMissingMainComponent, restoreMainComponent } from './restore'

/**
 * The instance commands of Figma's Object menu and instance panel: Reset all changes, the reset
 * of one kind of change, Push changes to main component and Restore main component. Each is one
 * undo step that brings the selection back with it.
 */
export function createInstanceCommandActions(ctx: EditorContext) {
  function recordEdit(label: string, nodeId: string, edit: () => boolean): boolean {
    const pageId = ctx.graph.closest(nodeId, (node) => node.type === 'CANVAS')?.id
    if (!pageId) return false
    const selection = new Set(ctx.state.selectedIds)
    const finish = captureDocumentChange(ctx.graph, pageId)
    let changed = false
    try {
      changed = edit()
    } finally {
      const change = finish()
      if (changed) {
        ctx.runLayoutForNode(nodeId)
        ctx.undo.push({
          label,
          forward: () => {
            restoreDocumentChange(ctx, change, 'after')
            ctx.setSelectedIds(new Set(selection))
          },
          inverse: () => {
            restoreDocumentChange(ctx, change, 'before')
            ctx.setSelectedIds(new Set(selection))
          }
        })
        ctx.requestRender()
      }
    }
    return changed
  }

  function instance(node: SceneNode | undefined): SceneNode | undefined {
    return node?.type === 'INSTANCE' && getNodeEditCapability(ctx.graph, node.id).editable
      ? node
      : undefined
  }

  /** The kinds of change the instance carries, for its reset menu. */
  function getInstanceOverrideGroups(nodeId: string): InstanceOverrideGroup[] {
    const node = ctx.graph.getNode(nodeId)
    if (node?.type !== 'INSTANCE' || hasMissingMainComponent(ctx.graph, node)) return []
    return instanceOverrideGroups(ctx.graph, node)
  }

  /** Reset all changes, or only one kind of change, on each selected instance. */
  function resetInstanceChanges(nodes: SceneNode[], group?: InstanceOverrideGroup): boolean {
    const targets = nodes.filter(
      (node) => instance(node) && !hasMissingMainComponent(ctx.graph, node)
    )
    if (targets.length === 0) return false
    return ctx.undo.runBatch(group ? `Reset ${group}` : 'Reset all changes', () =>
      targets
        .map((node) =>
          recordEdit('Reset instance', node.id, () => {
            if (getInstanceOverrideGroups(node.id).length === 0) return false
            resetInstanceOverrides(ctx.graph, node, group)
            return true
          })
        )
        .some(Boolean)
    )
  }

  /** Whether Push changes to main component can take the instance's edits to a main component here. */
  function canPushInstanceChanges(node: SceneNode | undefined): boolean {
    const target = instance(node)
    const main = target?.componentId ? ctx.graph.getNode(target.componentId) : undefined
    return (
      !!target &&
      main?.type === 'COMPONENT' &&
      getNodeEditCapability(ctx.graph, main.id).editable &&
      getInstanceOverrideGroups(target.id).length > 0
    )
  }

  function pushChangesToMainComponent(node: SceneNode | undefined): boolean {
    const target = instance(node)
    if (!target || !canPushInstanceChanges(target)) return false
    return recordEdit(
      'Push changes to main component',
      target.id,
      () => pushInstanceOverrides(ctx.graph, target) !== null
    )
  }

  function canRestoreMainComponent(node: SceneNode | undefined): boolean {
    return !!instance(node) && hasMissingMainComponent(ctx.graph, node)
  }

  function restoreMainComponentOf(node: SceneNode | undefined): string | null {
    const target = instance(node)
    if (!target || !canRestoreMainComponent(target)) return null
    let restored: string | null = null
    recordEdit('Restore main component', target.id, () => {
      restored = restoreMainComponent(ctx.graph, target.id)
      return restored !== null
    })
    return restored
  }

  return {
    getInstanceOverrideGroups,
    resetInstanceChanges,
    canPushInstanceChanges,
    pushChangesToMainComponent,
    canRestoreMainComponent,
    restoreMainComponent: restoreMainComponentOf
  }
}
