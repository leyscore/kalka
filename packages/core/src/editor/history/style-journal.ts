import type { CSSDeclarations } from '@kalka/scene-graph'
import type { UndoEntry } from '@kalka/scene-graph/undo'

import type { EditorContext } from '#core/editor/types'

/**
 * CSS a layer kept as written gives way when an edit sets its fields (`node:styleGaveWay`), but
 * most history entries record only the fields they set. The journal notes each layer's CSS from
 * before the edit and adds it to the entry the edit records, so undo restores it too.
 */
export function createStyleJournal() {
  const before = new Map<string, CSSDeclarations>()
  let context: EditorContext | null = null

  function onRecord(entry: UndoEntry): UndoEntry {
    if (before.size === 0 || !context) return entry
    const graph = () => context?.graph
    const styles = new Map(before)
    before.clear()
    return {
      ...entry,
      inverse: () => {
        entry.inverse()
        for (const [id, style] of styles) graph()?.updateNode(id, { style: { ...style } })
      }
    }
  }

  function bind(ctx: EditorContext): void {
    context = ctx
    ctx.onEditorEvent('node:styleGaveWay', (id, previous) => {
      // Undo and redo replay entries that restore their CSS themselves.
      if (ctx.undo.isReplaying || before.has(id)) return
      before.set(id, { ...previous })
    })
    // What gave way outside a recorded edit belongs to no entry.
    ctx.onEditorEvent('history:changed', () => before.clear())
    ctx.onEditorEvent('graph:replaced', () => before.clear())
  }

  return { onRecord, bind }
}
