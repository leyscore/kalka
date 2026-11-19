import type { SceneNode } from '@kalka/scene-graph'

import { restoreSubtree } from '#core/editor/history/subtree'
import type { EditorContext } from '#core/editor/types'

export type DeletedEntry = {
  id: string
  parentId: string
  index: number
  subtree: Map<string, SceneNode>
}

export function recreateSnapshots(ctx: EditorContext, snapshots: SceneNode[], pageId: string) {
  for (const snapshot of snapshots) {
    ctx.graph.createNode(snapshot.type, snapshot.parentId ?? pageId, {
      ...snapshot,
      childIds: []
    })
  }
}

export function deleteIds(ctx: EditorContext, ids: string[]) {
  for (const id of [...ids].reverse()) ctx.graph.deleteNode(id)
}

/**
 * Puts deleted layers back where they were. Their positions were read before any of them went,
 * so siblings return lowest position first, each landing where it was; a layer whose parent was
 * deleted too returns once that parent is back.
 */
export function restoreDeletedEntries(ctx: EditorContext, entries: DeletedEntry[]) {
  let pending = entries.toSorted((a, b) => a.index - b.index)
  while (pending.length > 0) {
    const ready = pending.filter((entry) => ctx.graph.getNode(entry.parentId))
    const batch = ready.length > 0 ? ready : pending
    for (const { id, parentId, index, subtree } of batch) {
      const rootSnap = subtree.get(id)
      if (rootSnap) restoreSubtree(ctx.graph, rootSnap, parentId, subtree)
      if (index >= 0) ctx.graph.reorderChild(id, parentId, index)
    }
    pending = pending.filter((entry) => !batch.includes(entry))
  }
}
