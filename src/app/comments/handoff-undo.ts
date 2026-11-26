import {
  isHandoffThread,
  type CommentThread,
  type FrameReview,
  type SceneGraph
} from '@kalka/scene-graph'

import type { EditorStore } from '@/app/editor/active-store'

/**
 * Undo for handoff notes, as Figma undoes annotations, measurements and dev status like any edit
 * of the file. Comments stay out of undo, as in Figma, so a step puts back only the annotations,
 * measurements and dev statuses it changed and leaves the comments as they are by then, which
 * someone else in a live room may have written meanwhile.
 */

interface HandoffState {
  threads: CommentThread[]
  reviews: FrameReview[]
}

function readHandoff(graph: SceneGraph): HandoffState {
  const root = graph.getNode(graph.rootId)
  return {
    threads: structuredClone((root?.comments ?? []).filter(isHandoffThread)),
    reviews: structuredClone(root?.frameReviews ?? [])
  }
}

function writeHandoff(graph: SceneGraph, state: HandoffState): void {
  const comments = (graph.getNode(graph.rootId)?.comments ?? []).filter(
    (thread) => !isHandoffThread(thread)
  )
  graph.updateNode(graph.rootId, {
    comments: [...comments, ...structuredClone(state.threads)],
    frameReviews: structuredClone(state.reviews)
  })
}

/** Runs an edit of annotations, measurements or dev status as one undoable step. */
export function editHandoff<T>(store: EditorStore, label: string, edit: () => T): T {
  const before = readHandoff(store.graph)
  const result = edit()
  const after = readHandoff(store.graph)
  const graph = store.graph
  store.undo.push({
    label,
    forward: () => {
      writeHandoff(graph, after)
      store.requestRefresh()
    },
    inverse: () => {
      writeHandoff(graph, before)
      store.requestRefresh()
    }
  })
  store.requestRefresh()
  return result
}
