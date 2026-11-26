import { markRaw, type Ref } from 'vue'

import type { Editor } from '@kalka/core/editor'
import type { PrototypeNodeAction, SceneGraph } from '@kalka/scene-graph'
import type { Rect, Vector } from '@kalka/scene-graph/primitives'

import type { DragPrototypeOverlay, DragState } from '#vue/shared/input/types'

/** An Open overlay action of a layer whose overlay is placed by hand, and where it opens. */
export interface ManualOverlay {
  reaction: number
  action: number
  frameId: string
  /** The overlay's box on the canvas, from the triggering layer's top-left. */
  rect: Rect
}

function isManualOverlay(graph: SceneGraph, action: PrototypeNodeAction): boolean {
  if (action.navigation !== 'OVERLAY' || !action.destinationId) return false
  return graph.getNode(action.destinationId)?.overlayPositionType === 'MANUAL'
}

/**
 * Where a manual overlay opens from a layer, as the presenter places it: its offset from the
 * layer's top-left, else just below the layer.
 */
function offsetOf(action: PrototypeNodeAction, height: number): Vector {
  return action.overlayRelativePosition ?? { x: 0, y: height }
}

/** The manual overlays a layer's interactions open, in canvas coordinates. */
export function manualOverlays(graph: SceneGraph, sourceId: string): ManualOverlay[] {
  const source = graph.getNode(sourceId)
  if (!source) return []
  const bounds = graph.getAbsoluteBounds(sourceId)
  const found: ManualOverlay[] = []
  source.reactions.forEach((reaction, r) => {
    reaction.actions.forEach((action, a) => {
      if (action.type !== 'NODE' || !action.destinationId || !isManualOverlay(graph, action)) return
      const frame = graph.getNode(action.destinationId)
      if (!frame) return
      const offset = offsetOf(action, bounds.height)
      found.push({
        reaction: r,
        action: a,
        frameId: frame.id,
        rect: {
          x: bounds.x + offset.x,
          y: bounds.y + offset.y,
          width: frame.width,
          height: frame.height
        }
      })
    })
  })
  return found
}

/**
 * Starts dragging where a manual overlay of the selected layer opens, as Figma lets its preview
 * on the canvas be dragged, when the pointer goes down on it in the Prototype tab.
 */
export function startManualOverlayDrag(
  editor: Editor,
  cx: number,
  cy: number,
  setDrag: (drag: DragState) => void
): boolean {
  const { state, graph } = editor
  if (!state.prototyping || state.selectedIds.size !== 1) return false
  const [sourceId] = state.selectedIds
  const hit = manualOverlays(graph, sourceId)
    .reverse()
    .find(
      ({ rect }) =>
        cx >= rect.x && cx <= rect.x + rect.width && cy >= rect.y && cy <= rect.y + rect.height
    )
  const source = graph.getNode(sourceId)
  if (!hit || !source) return false
  const bounds = graph.getAbsoluteBounds(sourceId)
  setDrag({
    type: 'prototype-overlay',
    sourceId,
    reaction: hit.reaction,
    action: hit.action,
    startX: cx,
    startY: cy,
    origin: { x: hit.rect.x - bounds.x, y: hit.rect.y - bounds.y },
    offset: null,
    // The drag state is reactive; the interactions stay plain so they can be copied.
    before: markRaw(structuredClone(source.reactions))
  })
  return true
}

/** The interactions with the dragged overlay opening at `offset`. */
function withOffset(drag: DragPrototypeOverlay, offset: Vector) {
  const reactions = structuredClone(drag.before)
  const action = reactions[drag.reaction]?.actions[drag.action]
  // A plain copy: the drag state hands out reactive objects.
  if (action?.type === 'NODE') action.overlayRelativePosition = { x: offset.x, y: offset.y }
  return reactions
}

function offsetAt(drag: DragPrototypeOverlay, cx: number, cy: number): Vector {
  return {
    x: Math.round(drag.origin.x + cx - drag.startX),
    y: Math.round(drag.origin.y + cy - drag.startY)
  }
}

/** The overlay follows the pointer; the drag is one undo step when it ends. */
export function moveManualOverlay(
  editor: Editor,
  drag: DragPrototypeOverlay,
  cx: number,
  cy: number
): void {
  drag.offset = offsetAt(drag, cx, cy)
  editor.graph.updateNode(drag.sourceId, { reactions: withOffset(drag, drag.offset) })
  editor.requestRepaint()
}

/**
 * Drops the overlay where it was dragged, or puts it back on cancel. Whether the drag was a
 * manual overlay's.
 */
export function endManualOverlayDrag(
  drag: Ref<DragState | null>,
  editor: Editor,
  commit: boolean
): boolean {
  const d = drag.value
  if (d?.type !== 'prototype-overlay') return false
  drag.value = null
  editor.graph.updateNode(d.sourceId, { reactions: structuredClone(d.before) })
  if (commit && d.offset) editor.setReactions(d.sourceId, withOffset(d, d.offset), 'Move overlay')
  else editor.requestRepaint()
  return true
}
