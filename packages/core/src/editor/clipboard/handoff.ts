import {
  copyHandoffThreads,
  removeCommentThreads,
  restoreCommentThreads,
  type CommentThread,
  type SceneGraph,
  type UndoManager
} from '@kalka/scene-graph'

/** What puts copied annotations back on redo and takes them away on undo. */
export interface HandoffCopy {
  forward(): void
  inverse(): void
}

/**
 * Gives copies of layers the annotations and measurements of the layers they copy, as Figma's
 * paste and duplicate do; null when there were none. `copies` maps each copied layer to its copy.
 */
export function copyLayerHandoff(
  graph: SceneGraph,
  threads: readonly CommentThread[],
  copies: ReadonlyMap<string, string>
): HandoffCopy | null {
  const added = copyHandoffThreads(graph, threads, copies)
  if (added.length === 0) return null
  const ids = new Set(added.map((thread) => thread.id))
  return {
    forward: () => restoreCommentThreads(graph, added),
    inverse: () => removeCommentThreads(graph, ids)
  }
}

/** Copies annotations for pasted layers, as a step of the paste's undo batch. */
export function pasteLayerHandoff(
  graph: SceneGraph,
  undo: UndoManager,
  threads: readonly CommentThread[] | undefined,
  copies: ReadonlyMap<string, string>
): void {
  const copy = threads ? copyLayerHandoff(graph, threads, copies) : null
  if (copy) undo.push({ label: 'Paste', ...copy })
}

/** Pairs each layer of a tree with the layer of its copy at the same place, into `copies`. */
export function pairCopiedTree(
  graph: SceneGraph,
  sourceId: string,
  copyId: string,
  copies: Map<string, string>
): void {
  copies.set(sourceId, copyId)
  const source = graph.getChildren(sourceId)
  const copy = graph.getChildren(copyId)
  if (source.length !== copy.length) return
  source.forEach((child, index) => {
    // The two lists have the same length, so each child has its twin.
    pairCopiedTree(graph, child.id, copy[index].id, copies)
  })
}
