import { markRaw } from 'vue'

import type { Editor } from '@kalka/core/editor'
import { createSceneGeometry } from '@kalka/core/geometry'
import type { Fill, SceneNode } from '@kalka/scene-graph'
import { copyFills, copyStrokes } from '@kalka/scene-graph/copy'
import type { Vector } from '@kalka/scene-graph/primitives'

import { getPointerCoords } from '#vue/shared/input/geometry'
import {
  dragGradientHandle,
  editedGradient,
  gradientHandles,
  hasGradientArea,
  type GradientEdit,
  type GradientHandle
} from '#vue/shared/input/gradient/geometry'
import type { DragGradientHandle } from '#vue/shared/input/types'

export * from '#vue/shared/input/gradient/geometry'

/** Screen pixels around a gradient handle that pick it up. */
const HANDLE_HIT_RADIUS = 7

/** The layer and paint whose gradient handles show, while its picker is open. */
export function activeGradient(
  editor: Editor
): { node: SceneNode; fill: Fill; edit: GradientEdit } | null {
  const edit = editor.state.gradientEdit
  if (!edit || editor.state.editingTextId || editor.state.nodeEditState) return null
  if (!editor.state.selectedIds.has(edit.nodeId)) return null
  const node = editor.graph.getNode(edit.nodeId)
  const fill = editedGradient(node, edit)
  if (!node || !fill || node.locked || !hasGradientArea(node)) return null
  return { node, fill, edit }
}

/** Every handle of a gradient in the order a press picks them: the ends, the stops, the width. */
function pickOrder(fill: Fill, size: SceneNode): { handle: GradientHandle; at: Vector }[] {
  const handles = gradientHandles(size, fill)
  return [
    { handle: 'start' as const, at: handles.start },
    { handle: 'end' as const, at: handles.end },
    ...handles.stops.map((at, index) => ({ handle: index, at })),
    ...(handles.width ? [{ handle: 'width' as const, at: handles.width }] : [])
  ]
}

/** The gradient handle under a canvas point. */
export function hitGradientHandle(
  editor: Editor,
  cx: number,
  cy: number
): { node: SceneNode; fill: Fill; edit: GradientEdit; handle: GradientHandle } | null {
  const active = activeGradient(editor)
  if (!active) return null
  const geometry = createSceneGeometry(editor.graph, editor.state.rotationPreview)
  const reach = HANDLE_HIT_RADIUS / editor.state.zoom
  const hit = pickOrder(active.fill, active.node).find(({ at }) => {
    const world = geometry.toWorld(active.node, at)
    return Math.hypot(world.x - cx, world.y - cy) <= reach
  })
  return hit ? { ...active, handle: hit.handle } : null
}

/** Lights the gradient handle under the pointer; returns the cursor it asks for, or null. */
export function hoverGradientHandle(editor: Editor, cx: number, cy: number): string | null {
  const edit = editor.state.gradientEdit
  if (!edit) return null
  const hit = hitGradientHandle(editor, cx, cy)
  const handle = hit?.handle ?? null
  if (edit.handle !== handle) editor.setGradientEdit({ ...edit, handle })
  return hit ? 'pointer' : null
}

/**
 * Whether a press on the canvas lands on a gradient handle, read from the press itself: a picker
 * dismissed by that press would hide the handles before the canvas could start dragging one.
 */
export function pressesGradientHandle(editor: Editor, event: MouseEvent): boolean {
  if (!(event.target instanceof HTMLCanvasElement)) return false
  const { cx, cy } = getPointerCoords(event, event.target, editor)
  return hitGradientHandle(editor, cx, cy) !== null
}

/** Starts dragging the gradient handle under the press, if there is one. */
export function tryStartGradientHandle(
  editor: Editor,
  cx: number,
  cy: number
): DragGradientHandle | null {
  const hit = hitGradientHandle(editor, cx, cy)
  if (!hit) return null
  const { node, edit, handle } = hit
  editor.setGradientEdit({
    ...edit,
    handle,
    dragging: true,
    activeStop: typeof handle === 'number' ? handle : edit.activeStop
  })
  return {
    type: 'gradient-handle',
    nodeId: node.id,
    paint: edit.paint,
    index: edit.index,
    handle,
    // The drag lives in a ref; kept raw, the paints written back stay plain data.
    original: markRaw({
      fills: copyFills(node.fills),
      strokes: copyStrokes(node.strokes)
    })
  }
}

/** The layer's paints at the press with the edited one replaced. */
function replacedPaint(
  d: DragGradientHandle,
  next: <P extends Fill>(paint: P) => P
): Partial<SceneNode> {
  const replace = <P extends Fill>(paints: P[]) =>
    paints.map((paint, i) => (i === d.index ? next(paint) : paint))
  return d.paint === 'fills'
    ? { fills: replace(d.original.fills) }
    : { strokes: replace(d.original.strokes) }
}

function originalPaint(d: DragGradientHandle): Partial<SceneNode> {
  return d.paint === 'fills' ? { fills: d.original.fills } : { strokes: d.original.strokes }
}

export function handleGradientHandleMove(
  d: DragGradientHandle,
  cx: number,
  cy: number,
  editor: Editor
) {
  const node = editor.graph.getNode(d.nodeId)
  if (!node) return
  const point = createSceneGeometry(editor.graph, editor.state.rotationPreview).toLocal(node, {
    x: cx,
    y: cy
  })
  if (!point) return
  editor.updateNode(
    d.nodeId,
    replacedPaint(d, (paint) => dragGradientHandle(node, paint, d.handle, point))
  )
}

function endGradientDrag(editor: Editor) {
  const edit = editor.state.gradientEdit
  if (edit) editor.setGradientEdit({ ...edit, dragging: false })
}

/** Records the drag as one undo step. */
export function commitGradientHandle(d: DragGradientHandle, editor: Editor) {
  endGradientDrag(editor)
  if (!editor.graph.getNode(d.nodeId)) return
  editor.commitNodeUpdate(d.nodeId, originalPaint(d), 'Change gradient')
}

/** Puts the gradient back as it was at the press. */
export function cancelGradientHandle(d: DragGradientHandle, editor: Editor) {
  endGradientDrag(editor)
  if (editor.graph.getNode(d.nodeId)) editor.updateNode(d.nodeId, originalPaint(d))
}
