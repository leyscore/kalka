import { toRaw } from 'vue'

import { markChangedFramesForReview, type SceneGraph } from '@kalka/scene-graph'

/**
 * Frames marked ready for development go back to needing review as soon as anything in them
 * changes, whoever changes it, so "ready" always means the design that was approved.
 */
const watched = new WeakSet<SceneGraph>()

/** Notes for developers on a layer, not its design: changing them leaves a review standing. */
const HANDOFF_FIELDS = new Set(['devResources'])

export function watchFrameReviews(reached: SceneGraph): void {
  const graph = toRaw(reached)
  if (watched.has(graph)) return
  watched.add(graph)
  let pending: Set<string> | null = null
  const changed = (id: string) => {
    if (id === graph.rootId) return
    if (!pending) {
      pending = new Set()
      // One pass per burst of changes, once the edit that made them is done.
      queueMicrotask(() => {
        const ids = pending ?? new Set<string>()
        pending = null
        markChangedFramesForReview(graph, ids)
      })
    }
    pending.add(id)
  }
  graph.onNodeEvents({
    created: (node) => changed(node.id),
    updated: (id, changes) => {
      if (Object.keys(changes).every((key) => HANDOFF_FIELDS.has(key))) return
      changed(id)
    },
    // A deleted layer is gone; the frame it was in changed.
    deleted: (id, parentId) => changed(parentId ?? id),
    reparented: (id) => changed(id),
    reordered: (id) => changed(id)
  })
}
