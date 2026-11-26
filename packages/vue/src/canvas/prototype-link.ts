import type { Ref } from 'vue'

import type { Editor } from '@kalka/core/editor'

import type { DragPrototypeLink, DragState } from '#vue/shared/input/types'

/** Screen pixels between a layer's right edge and its connection handle, and the handle's reach. */
const HANDLE_GAP = 10
const HANDLE_REACH = 9

/**
 * Starts dragging a prototype connection when the pointer goes down on the selected layer's
 * handle, which the Prototype tab draws beside it.
 */
export function startPrototypeLink(
  editor: Editor,
  sx: number,
  sy: number,
  setDrag: (drag: DragState) => void
): boolean {
  const { state } = editor
  if (!state.prototyping || state.selectedIds.size !== 1) return false
  const [id] = state.selectedIds
  if (!editor.graph.getNode(id)) return false
  const bounds = editor.graph.getAbsoluteBounds(id)
  const hx = (bounds.x + bounds.width) * state.zoom + state.panX + HANDLE_GAP
  const hy = (bounds.y + bounds.height / 2) * state.zoom + state.panY
  if (Math.hypot(hx - sx, hy - sy) > HANDLE_REACH) return false
  setDrag({ type: 'prototype-link', sourceId: id })
  editor.setPrototypeLink({ sourceId: id, x: bounds.x + bounds.width, y: bounds.y, targetId: null })
  return true
}

export function movePrototypeLink(editor: Editor, drag: DragPrototypeLink, cx: number, cy: number) {
  editor.setPrototypeLink({
    sourceId: drag.sourceId,
    x: cx,
    y: cy,
    targetId: editor.prototypeTargetAt(drag.sourceId, cx, cy)
  })
}

/** Dropped on a frame, the layer navigates there on click. Whether the drag was a connection. */
export function endPrototypeLink(drag: Ref<DragState | null>, editor: Editor): boolean {
  const d = drag.value
  if (d?.type !== 'prototype-link') return false
  drag.value = null
  const targetId = editor.state.prototypeLink?.targetId
  editor.setPrototypeLink(null)
  if (targetId) editor.connectPrototype(d.sourceId, targetId)
  return true
}
