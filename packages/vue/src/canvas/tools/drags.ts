import type { Ref } from 'vue'

import type { Editor } from '@kalka/core/editor'

import { endPrototypeLink } from '#vue/canvas/prototype-link'
import { endManualOverlayDrag, moveManualOverlay } from '#vue/canvas/prototype-overlay'
import { scaleFactor } from '#vue/canvas/scale/input'
import { finishShapeBuilderDrag, moveShapeBuilderDrag } from '#vue/canvas/shape-builder/input'
import { finishVariableWidthDrag, moveVariableWidthDrag } from '#vue/canvas/variable-width/input'
import { handleNodeEditPointerUp } from '#vue/canvas/vector-input/input'
import type {
  DragPencil,
  DragPrototypeOverlay,
  DragScale,
  DragShapeBuilder,
  DragState,
  DragWidth
} from '#vue/shared/input/types'

/**
 * A pointer move for the pencil, the Scale, Shape builder and Variable width tools and a manual
 * overlay's preview; whether it was theirs.
 */
export function moveToolDrag(
  d: DragState,
  cx: number,
  cy: number,
  editor: Editor
): d is DragPencil | DragScale | DragShapeBuilder | DragWidth | DragPrototypeOverlay {
  if (d.type === 'pencil') {
    editor.pencilExtend(cx, cy)
    return true
  }
  if (d.type === 'scale') {
    d.session.update(scaleFactor(d, cx, cy))
    return true
  }
  if (d.type === 'shape-builder') {
    moveShapeBuilderDrag(d, cx, cy, editor)
    return true
  }
  if (d.type === 'width') {
    moveVariableWidthDrag(d, cx, cy, editor)
    return true
  }
  if (d.type === 'prototype-overlay') {
    moveManualOverlay(editor, d, cx, cy)
    return true
  }
  return false
}

/**
 * Ends a pencil stroke, a Scale tool drag or a manual overlay's: kept on pointer up, dropped on
 * cancel. Whether the drag was one of theirs.
 */
export function endToolDrag(drag: Ref<DragState | null>, editor: Editor, commit: boolean): boolean {
  if (endManualOverlayDrag(drag, editor, commit)) return true
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
  if (d?.type === 'shape-builder') {
    drag.value = null
    finishShapeBuilderDrag(d, editor, commit)
    return true
  }
  if (d?.type === 'width') {
    drag.value = null
    finishVariableWidthDrag(d, editor, commit)
    return true
  }
  return false
}

/** Pointer up for a point or handle drag in a path being edited, a stroke, or a scale. */
export function handleToolPointerUp(drag: Ref<DragState | null>, editor: Editor): boolean {
  return (
    handleNodeEditPointerUp(drag, editor) ||
    endPrototypeLink(drag, editor) ||
    endToolDrag(drag, editor, true)
  )
}
