import type { Editor } from '@kalka/core/editor'
import type { SceneNode } from '@kalka/scene-graph'

import {
  autoLayoutValueField,
  resolveAutoLayoutHover,
  type AutoLayoutValueField
} from '#vue/shared/input/auto-layout-hover'
import type { DragAutoLayoutValue } from '#vue/shared/input/types'

type AutoLayoutHover = NonNullable<Editor['state']['autoLayoutHover']>

/** The padding across from each one, which Option/Alt drags with it, as in Figma. */
const OPPOSITE: Partial<Record<AutoLayoutValueField, AutoLayoutValueField>> = {
  paddingTop: 'paddingBottom',
  paddingBottom: 'paddingTop',
  paddingLeft: 'paddingRight',
  paddingRight: 'paddingLeft'
}

/**
 * The canvas axis a value follows, and which way grows it: a padding grows as its edge is
 * dragged inwards, the gap as it is dragged along the flow.
 */
function dragAxis(
  node: SceneNode,
  field: AutoLayoutValueField
): Pick<DragAutoLayoutValue, 'axis' | 'direction'> {
  switch (field) {
    case 'paddingTop':
      return { axis: 'y', direction: 1 }
    case 'paddingBottom':
      return { axis: 'y', direction: -1 }
    case 'paddingLeft':
      return { axis: 'x', direction: 1 }
    case 'paddingRight':
      return { axis: 'x', direction: -1 }
  }
  return { axis: node.layoutMode === 'VERTICAL' ? 'y' : 'x', direction: 1 }
}

/** The resize cursor over a padding or gap of the selected auto layout frame, else null. */
export function autoLayoutValueCursor(hover: AutoLayoutHover | null, editor: Editor) {
  const field = hover ? autoLayoutValueField(hover) : null
  const node = hover ? editor.graph.getNode(hover.nodeId) : undefined
  if (!field || !node || node.locked) return null
  return dragAxis(node, field).axis === 'x' ? 'ew-resize' : 'ns-resize'
}

/** The hover that draws a value with its pill, kept while the value is dragged. */
function withValuePill(hover: AutoLayoutHover): AutoLayoutHover {
  if (hover.kind === 'spacing') return { ...hover, kind: 'spacing-value' }
  if (hover.kind === 'padding') return { ...hover, kind: 'padding-value' }
  return hover
}

/** Starts dragging the padding or gap under the press in the selected auto layout frame. */
export function tryStartAutoLayoutValueDrag(
  editor: Editor,
  cx: number,
  cy: number,
  altKey: boolean
): DragAutoLayoutValue | null {
  const hover = resolveAutoLayoutHover(cx, cy, editor)
  const field = hover ? autoLayoutValueField(hover) : null
  const node = hover ? editor.graph.getNode(hover.nodeId) : undefined
  if (!hover || !field || !node || node.locked) return null
  const opposite = altKey ? OPPOSITE[field] : undefined
  const fields = opposite ? [field, opposite] : [field]
  const { axis, direction } = dragAxis(node, field)
  const dragHover = withValuePill(hover)
  editor.setAutoLayoutHover(dragHover)
  return {
    type: 'auto-layout-value',
    nodeId: node.id,
    fields,
    hover: dragHover,
    axis,
    direction,
    start: axis === 'x' ? cx : cy,
    startValue: node[field],
    original: Object.fromEntries(fields.map((key) => [key, node[key]]))
  }
}

/** The value for a pointer at `position` along the drag's axis: whole pixels, never negative. */
export function autoLayoutDragValue(
  d: Pick<DragAutoLayoutValue, 'start' | 'startValue' | 'direction'>,
  position: number
): number {
  return Math.max(0, Math.round(d.startValue + (position - d.start) * d.direction))
}

export function handleAutoLayoutValueMove(
  d: DragAutoLayoutValue,
  cx: number,
  cy: number,
  editor: Editor
) {
  if (!editor.graph.getNode(d.nodeId)) return
  const value = autoLayoutDragValue(d, d.axis === 'x' ? cx : cy)
  editor.updateNode(d.nodeId, Object.fromEntries(d.fields.map((field) => [field, value])))
  editor.setAutoLayoutHover(d.hover)
}

/** Records the drag as one undo step, or nothing when the value did not change. */
export function commitAutoLayoutValueDrag(d: DragAutoLayoutValue, editor: Editor) {
  if (!editor.graph.getNode(d.nodeId)) return
  const label = d.fields.includes('itemSpacing') ? 'Update gap' : 'Update padding'
  editor.commitNodeUpdate(d.nodeId, d.original, label)
}

/** Puts the values back as they were at the press. */
export function cancelAutoLayoutValueDrag(d: DragAutoLayoutValue, editor: Editor) {
  if (editor.graph.getNode(d.nodeId)) editor.updateNode(d.nodeId, d.original)
}
