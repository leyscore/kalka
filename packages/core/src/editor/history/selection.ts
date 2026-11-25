import type { UndoEntry } from '@kalka/scene-graph/undo'

import type { EditorContext } from '#core/editor/types'

/**
 * Undo and redo select what each step was made on, as in Figma. An entry keeps the selection of
 * the moment it was recorded and restores it after replaying, unless the step sets the selection
 * itself, as creating and deleting layers do. Layers that are gone or on another page are left out,
 * and when none is left the selection stays as it is.
 */
export function createSelectionJournal() {
  let context: EditorContext | null = null

  function restore(ctx: EditorContext, ids: readonly string[]) {
    const pageId = ctx.state.currentPageId
    const present = ids.filter((id) => ctx.graph.isDescendant(id, pageId))
    if (present.length > 0) ctx.setSelectedIds(new Set(present))
  }

  function replay(run: () => void, ids: readonly string[]) {
    const ctx = context
    // Only undo and redo move the selection; a cancelled batch runs inverses too.
    if (!ctx?.undo.isReplaying) {
      run()
      return
    }
    const before = ctx.state.selectedIds
    run()
    if (ctx.state.selectedIds === before) restore(ctx, ids)
  }

  function onRecord(entry: UndoEntry): UndoEntry {
    if (!context) return entry
    const ids = [...context.state.selectedIds]
    return {
      ...entry,
      forward: () => replay(entry.forward, ids),
      inverse: () => replay(entry.inverse, ids)
    }
  }

  function bind(ctx: EditorContext): void {
    context = ctx
  }

  return { onRecord, bind }
}
