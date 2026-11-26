import type { Editor } from '@kalka/core/editor'

import { cancelBlurHandle, commitBlurHandle, handleBlurHandleMove } from '#vue/shared/input/blur'
import {
  cancelGradientHandle,
  commitGradientHandle,
  handleGradientHandleMove
} from '#vue/shared/input/gradient'
import type { DragBlurHandle, DragGradientHandle, DragState } from '#vue/shared/input/types'

/** A drag of a handle an open paint or effect editor draws on its layer. */
export type EditorHandleDrag = DragGradientHandle | DragBlurHandle

export function isEditorHandleDrag(d: DragState | null | undefined): d is EditorHandleDrag {
  return d?.type === 'gradient-handle' || d?.type === 'blur-handle'
}

export function moveEditorHandle(d: EditorHandleDrag, cx: number, cy: number, editor: Editor) {
  if (d.type === 'gradient-handle') handleGradientHandleMove(d, cx, cy, editor)
  else handleBlurHandleMove(d, cx, cy, editor)
}

/** Records the drag as one undo step. */
export function commitEditorHandle(d: EditorHandleDrag, editor: Editor) {
  if (d.type === 'gradient-handle') commitGradientHandle(d, editor)
  else commitBlurHandle(d, editor)
}

/** Puts the layer back as it was at the press. */
export function cancelEditorHandle(d: EditorHandleDrag, editor: Editor) {
  if (d.type === 'gradient-handle') cancelGradientHandle(d, editor)
  else cancelBlurHandle(d, editor)
}
