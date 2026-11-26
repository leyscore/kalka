import type { Editor } from '@kalka/core/editor'

import { cancelBlurHandle, commitBlurHandle, handleBlurHandleMove } from '#vue/shared/input/blur'
import {
  cancelGradientHandle,
  commitGradientHandle,
  handleGradientHandleMove
} from '#vue/shared/input/gradient'
import {
  cancelSmartSelection,
  commitSmartSelection,
  handleSmartSelectionMove
} from '#vue/shared/input/smart-selection'
import type {
  DragBlurHandle,
  DragGradientHandle,
  DragSmartSelection,
  DragState
} from '#vue/shared/input/types'

/**
 * A drag of a handle drawn over the selection: one an open paint or effect editor draws on its
 * layer, or a smart selection's gap or layer centre.
 */
export type EditorHandleDrag = DragGradientHandle | DragBlurHandle | DragSmartSelection

export function isEditorHandleDrag(d: DragState | null | undefined): d is EditorHandleDrag {
  return (
    d?.type === 'gradient-handle' ||
    d?.type === 'blur-handle' ||
    d?.type === 'smart-gap' ||
    d?.type === 'smart-reorder'
  )
}

export function moveEditorHandle(d: EditorHandleDrag, cx: number, cy: number, editor: Editor) {
  if (d.type === 'gradient-handle') handleGradientHandleMove(d, cx, cy, editor)
  else if (d.type === 'blur-handle') handleBlurHandleMove(d, cx, cy, editor)
  else handleSmartSelectionMove(d, cx, cy, editor)
}

/** Records the drag as one undo step. */
export function commitEditorHandle(d: EditorHandleDrag, editor: Editor) {
  if (d.type === 'gradient-handle') commitGradientHandle(d, editor)
  else if (d.type === 'blur-handle') commitBlurHandle(d, editor)
  else commitSmartSelection(d, editor)
}

/** Puts the layer back as it was at the press. */
export function cancelEditorHandle(d: EditorHandleDrag, editor: Editor) {
  if (d.type === 'gradient-handle') cancelGradientHandle(d, editor)
  else if (d.type === 'blur-handle') cancelBlurHandle(d, editor)
  else cancelSmartSelection(d, editor)
}
