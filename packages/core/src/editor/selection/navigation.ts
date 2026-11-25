import { uniq } from 'es-toolkit'

import type { SceneNode } from '@kalka/scene-graph'

import type { EditorContext } from '#core/editor/types'

/** Layers the keyboard can reach: locked layers are left alone, as on the canvas. */
function reachable(node: SceneNode | undefined): node is SceneNode {
  return node !== undefined && !node.internalOnly && !node.locked
}

/**
 * Figma's keyboard moves through the layer tree: Enter selects the children of the selection,
 * Shift+Enter or \ its parents, Tab and Shift+Tab the next and previous sibling. Each returns
 * whether the selection changed, so a key that moved nothing keeps its usual meaning.
 */
export function createSelectionNavigationActions(
  ctx: EditorContext,
  select: (ids: string[]) => void
) {
  function selectedNodes() {
    return [...ctx.state.selectedIds].map((id) => ctx.graph.getNode(id)).filter(reachable)
  }

  /** Leaves an entered container that the new selection is, or holds, so clicks can reach it. */
  function leaveEnteredContainerAt(ids: string[]) {
    const entered = ctx.state.enteredContainerId
    if (!entered) return
    const covering = ids.find((id) => ctx.graph.isDescendant(entered, id))
    if (!covering) return
    const parentId = ctx.graph.getNode(covering)?.parentId
    const container =
      parentId && ctx.graph.closest(parentId, (node) => ctx.graph.isContainer(node.id))
    ctx.state.enteredContainerId =
      container && container.type !== 'CANVAS' && container.id !== ctx.state.currentPageId
        ? container.id
        : null
  }

  function selectChildren(): boolean {
    const children = selectedNodes().flatMap((node) =>
      node.childIds.map((id) => ctx.graph.getNode(id)).filter(reachable)
    )
    if (children.length === 0) return false
    select(children.map((node) => node.id))
    return true
  }

  function selectParent(): boolean {
    const parents = uniq(
      selectedNodes().flatMap((node) => {
        const parent = node.parentId ? ctx.graph.getNode(node.parentId) : undefined
        return parent && parent.type !== 'CANVAS' ? [parent.id] : []
      })
    )
    if (parents.length === 0) return false
    leaveEnteredContainerAt(parents)
    select(parents)
    return true
  }

  /**
   * Moves each selected layer to its sibling one row down the layers panel (`step` 1) or up
   * (`step` -1), wrapping around; the panel lists the topmost layer, the last child, first.
   */
  function selectSibling(step: 1 | -1): boolean {
    const siblings = selectedNodes().flatMap((node) => {
      const parent = node.parentId ? ctx.graph.getNode(node.parentId) : undefined
      if (!parent) return []
      const ids = parent.childIds.filter((id) => reachable(ctx.graph.getNode(id)))
      const index = ids.indexOf(node.id)
      const next = ids.length > 1 ? ids.at((index - step) % ids.length) : undefined
      return index === -1 || !next ? [] : [next]
    })
    if (siblings.length === 0) return false
    select(uniq(siblings))
    return true
  }

  return { selectChildren, selectParent, selectSibling }
}
