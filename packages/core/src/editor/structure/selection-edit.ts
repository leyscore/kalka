import type { SceneNode } from '@kalka/scene-graph'

import { getNodeEditCapability } from '#core/editor/capabilities'
import { captureDocumentChange, pushDocumentChange } from '#core/editor/history/document-change'
import type { EditorContext } from '#core/editor/types'

/** The selected layers that may be edited. */
export function editableSelection(ctx: EditorContext): SceneNode[] {
  return [...ctx.state.selectedIds]
    .map((id) => ctx.graph.getNode(id))
    .filter(
      (node): node is SceneNode =>
        node !== undefined && getNodeEditCapability(ctx.graph, node.id).editable
    )
}

/**
 * Runs `edit` as one undo step that brings the selection back with it; `edit` returns the
 * selection to show after it, or null when it changed nothing.
 */
export function recordSelectionEdit(
  ctx: EditorContext,
  label: string,
  edit: () => Set<string> | null
): boolean {
  const before = new Set(ctx.state.selectedIds)
  const finish = captureDocumentChange(ctx.graph, ctx.state.currentPageId)
  let after: Set<string> | null = null
  try {
    after = edit()
  } finally {
    const change = finish()
    if (after) {
      ctx.setSelectedIds(new Set(after))
      pushDocumentChange(ctx, label, change, before, after)
      ctx.requestRender()
    }
  }
  return after !== null
}
