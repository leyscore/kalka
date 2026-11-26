import { markRaw } from 'vue'

import type { Editor } from '@kalka/core/editor'
import { createSceneGeometry } from '@kalka/core/geometry'
import type { Effect, SceneNode } from '@kalka/scene-graph'
import { copyEffects } from '@kalka/scene-graph/copy'
import type { Vector } from '@kalka/scene-graph/primitives'

import type { DragBlurHandle } from '#vue/shared/input/types'

/** Screen pixels around a blur end that pick it up. */
const HANDLE_HIT_RADIUS = 7

/** Where a progressive blur starts and ends without saved points: from the top to the bottom. */
const DEFAULT_START: Vector = { x: 0.5, y: 0 }
const DEFAULT_END: Vector = { x: 0.5, y: 1 }

/** The ends of a progressive blur in the layer's own coordinates. */
export function blurEnds(node: SceneNode, effect: Effect): { start: Vector; end: Vector } {
  const start = effect.startOffset ?? DEFAULT_START
  const end = effect.endOffset ?? DEFAULT_END
  return {
    start: { x: start.x * node.width, y: start.y * node.height },
    end: { x: end.x * node.width, y: end.y * node.height }
  }
}

function isProgressiveBlur(effect: Effect | undefined): effect is Effect {
  return (
    !!effect &&
    effect.blurType === 'PROGRESSIVE' &&
    (effect.type === 'LAYER_BLUR' ||
      effect.type === 'FOREGROUND_BLUR' ||
      effect.type === 'BACKGROUND_BLUR')
  )
}

/** The layer and blur whose ends show, while its settings are open. */
export function activeBlur(editor: Editor): { node: SceneNode; effect: Effect } | null {
  const edit = editor.state.blurEdit
  if (!edit || editor.state.editingTextId || editor.state.nodeEditState) return null
  if (!editor.state.selectedIds.has(edit.nodeId)) return null
  const node = editor.graph.getNode(edit.nodeId)
  const effect = node?.effects[edit.index]
  if (!node || node.locked || node.width <= 0 || node.height <= 0) return null
  return isProgressiveBlur(effect) ? { node, effect } : null
}

/** The blur end under a canvas point. */
export function hitBlurHandle(
  editor: Editor,
  cx: number,
  cy: number
): { node: SceneNode; handle: 'start' | 'end' } | null {
  const active = activeBlur(editor)
  if (!active) return null
  const geometry = createSceneGeometry(editor.graph, editor.state.rotationPreview)
  const reach = HANDLE_HIT_RADIUS / editor.state.zoom
  const ends = blurEnds(active.node, active.effect)
  for (const handle of ['start', 'end'] as const) {
    const world = geometry.toWorld(active.node, ends[handle])
    if (Math.hypot(world.x - cx, world.y - cy) <= reach) return { node: active.node, handle }
  }
  return null
}

/** Lights the blur end under the pointer; returns the cursor it asks for, or null. */
export function hoverBlurHandle(editor: Editor, cx: number, cy: number): string | null {
  const edit = editor.state.blurEdit
  if (!edit) return null
  const hit = hitBlurHandle(editor, cx, cy)
  const handle = hit?.handle ?? null
  if (edit.handle !== handle) editor.setBlurEdit({ ...edit, handle })
  return hit ? 'pointer' : null
}

/** Starts dragging the blur end under the press, if there is one. */
export function tryStartBlurHandle(editor: Editor, cx: number, cy: number): DragBlurHandle | null {
  const edit = editor.state.blurEdit
  const hit = hitBlurHandle(editor, cx, cy)
  if (!edit || !hit) return null
  editor.setBlurEdit({ ...edit, handle: hit.handle, dragging: true })
  return {
    type: 'blur-handle',
    nodeId: hit.node.id,
    index: edit.index,
    handle: hit.handle,
    // The drag lives in a ref; kept raw, the effects written back stay plain data.
    original: markRaw(copyEffects(hit.node.effects))
  }
}

/** Moves the dragged end to the pointer, in the layer's unit box; Figma lets it leave the box. */
export function handleBlurHandleMove(d: DragBlurHandle, cx: number, cy: number, editor: Editor) {
  const node = editor.graph.getNode(d.nodeId)
  if (!node || node.width <= 0 || node.height <= 0) return
  const point = createSceneGeometry(editor.graph, editor.state.rotationPreview).toLocal(node, {
    x: cx,
    y: cy
  })
  if (!point) return
  const offset = { x: point.x / node.width, y: point.y / node.height }
  const field = d.handle === 'start' ? 'startOffset' : 'endOffset'
  editor.updateNode(d.nodeId, {
    effects: d.original.map((effect, index) =>
      index === d.index ? { ...effect, [field]: offset } : effect
    )
  })
}

function endBlurDrag(editor: Editor) {
  const edit = editor.state.blurEdit
  if (edit) editor.setBlurEdit({ ...edit, dragging: false })
}

/** Records the drag as one undo step. */
export function commitBlurHandle(d: DragBlurHandle, editor: Editor) {
  endBlurDrag(editor)
  if (!editor.graph.getNode(d.nodeId)) return
  editor.commitNodeUpdate(d.nodeId, { effects: d.original }, 'Change progressive blur')
}

/** Puts the blur back as it was at the press. */
export function cancelBlurHandle(d: DragBlurHandle, editor: Editor) {
  endBlurDrag(editor)
  if (editor.graph.getNode(d.nodeId)) editor.updateNode(d.nodeId, { effects: d.original })
}
