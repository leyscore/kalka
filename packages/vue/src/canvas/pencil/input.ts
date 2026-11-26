import type { Ref } from 'vue'

import type { Editor } from '@kalka/core/editor'

import { handleNodeEditPointerUp } from '#vue/canvas/vector-input/input'
import type { DragState } from '#vue/shared/input/types'

/** Ends a pencil stroke: commits it on pointer up, drops it on cancel. Whether one was drawn. */
export function finishPencilDrag(
  drag: Ref<DragState | null>,
  editor: Editor,
  commit: boolean
): boolean {
  if (drag.value?.type !== 'pencil') return false
  drag.value = null
  if (commit) editor.pencilCommit()
  else editor.pencilCancel()
  return true
}

/** Pointer up for the path tools: a point or handle drag in a path being edited, or a stroke. */
export function handlePathPointerUp(drag: Ref<DragState | null>, editor: Editor): boolean {
  return handleNodeEditPointerUp(drag, editor) || finishPencilDrag(drag, editor, true)
}
