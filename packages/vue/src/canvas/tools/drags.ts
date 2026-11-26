import type { Ref } from 'vue'

import type { Editor } from '@kalka/core/editor'

import { scaleFactor } from '#vue/canvas/scale/input'
import { handleNodeEditPointerUp } from '#vue/canvas/vector-input/input'
import type { DragPencil, DragScale, DragState } from '#vue/shared/input/types'

/** A pointer move for the pencil and the Scale tool; whether the drag was one of theirs. */
export function moveToolDrag(
  d: DragState,
  cx: number,
  cy: number,
  editor: Editor
): d is DragPencil | DragScale {
  if (d.type === 'pencil') {
    editor.pencilExtend(cx, cy)
    return true
  }
  if (d.type === 'scale') {
    d.session.update(scaleFactor(d, cx, cy))
    return true
  }
  return false
}

/**
 * Ends a pencil stroke or a Scale tool drag: kept on pointer up, dropped on cancel. Whether the
 * drag was one of theirs.
 */
export function endToolDrag(drag: Ref<DragState | null>, editor: Editor, commit: boolean): boolean {
  const d = drag.value
  if (d?.type === 'pencil') {
    drag.value = null
    if (commit) editor.pencilCommit()
    else editor.pencilCancel()
    return true
  }
  if (d?.type === 'scale') {
    drag.value = null
    if (commit) d.session.commit()
    else d.session.cancel()
    return true
  }
  return false
}

/** Pointer up for a point or handle drag in a path being edited, a stroke, or a scale. */
export function handleToolPointerUp(drag: Ref<DragState | null>, editor: Editor): boolean {
  return handleNodeEditPointerUp(drag, editor) || endToolDrag(drag, editor, true)
}
