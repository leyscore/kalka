import { prototypeConnections, type SceneGraph } from '@kalka/scene-graph'
import type { Color, Rect, Vector } from '@kalka/scene-graph/primitives'

import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import { css, type OverlayShape } from '#vue/canvas/svg-overlay/shapes'

/** Figma's prototype blue. */
const CONNECTION: Color = { r: 0.05, g: 0.6, b: 1, a: 1 }
const HANDLE_RADIUS = 6
const HANDLE_GAP = 10

function screenRect(context: OverlayContext, graph: SceneGraph, id: string): Rect | null {
  if (!graph.getNode(id)) return null
  const bounds = graph.getAbsoluteBounds(id)
  const { panX, panY, zoom } = context.view
  return {
    x: bounds.x * zoom + panX,
    y: bounds.y * zoom + panY,
    width: bounds.width * zoom,
    height: bounds.height * zoom
  }
}

/** Where the handle that starts a connection sits beside a layer, in screen pixels. */
export function prototypeHandlePoint(context: OverlayContext, nodeId: string): Vector | null {
  const rect = screenRect(context, context.graph, nodeId)
  return rect ? { x: rect.x + rect.width + HANDLE_GAP, y: rect.y + rect.height / 2 } : null
}

/** A curve from a layer's side to a point, leaving and arriving horizontally. */
function noodle(from: Vector, to: Vector): string {
  const reach = Math.max(40, Math.abs(to.x - from.x) / 2)
  const direction = to.x >= from.x ? 1 : -1
  return `M ${from.x} ${from.y} C ${from.x + reach * direction} ${from.y} ${to.x - reach * direction} ${to.y} ${to.x} ${to.y}`
}

function arrow(to: Vector, pointsRight: boolean): OverlayShape {
  const back = pointsRight ? -7 : 7
  return {
    type: 'polygon',
    points: [to.x, to.y, to.x + back, to.y - 4, to.x + back, to.y + 4],
    fill: css(CONNECTION)
  }
}

function connection(sourceRect: Rect, targetRect: Rect): OverlayShape[] {
  const rightward = targetRect.x >= sourceRect.x + sourceRect.width
  const from = {
    x: rightward ? sourceRect.x + sourceRect.width : sourceRect.x,
    y: sourceRect.y + sourceRect.height / 2
  }
  const to = {
    x: rightward ? targetRect.x : targetRect.x + targetRect.width,
    y: targetRect.y + Math.min(targetRect.height / 2, 40)
  }
  return [
    { type: 'path', d: noodle(from, to), stroke: css(CONNECTION), strokeWidth: 2 },
    { type: 'ellipse', cx: from.x, cy: from.y, rx: 3, ry: 3, fill: css(CONNECTION) },
    arrow(to, rightward)
  ]
}

/**
 * The Prototype tab's canvas: connections from layers to where their interactions go, the
 * selection's or the whole page's, the handle a new connection is dragged from, and the one
 * being dragged with the frame it would go to.
 */
export function prototypeLayer(context: OverlayContext, pageId: string): OverlayShape[] {
  const { overlays, graph, selectedIds } = context
  if (!overlays.prototyping) return []
  const shapes: OverlayShape[] = []
  const selected = [...selectedIds]
  const shown = prototypeConnections(graph, pageId).filter(
    (link) =>
      selected.length === 0 ||
      selected.some((id) => id === link.sourceId || graph.isDescendant(link.sourceId, id))
  )
  for (const link of shown) {
    const source = screenRect(context, graph, link.sourceId)
    const target = screenRect(context, graph, link.destinationId)
    if (source && target) shapes.push(...connection(source, target))
  }
  const drag = overlays.prototypeLink
  if (drag) {
    const target = drag.targetId ? screenRect(context, graph, drag.targetId) : null
    if (target) shapes.push({ type: 'rect', ...target, stroke: css(CONNECTION), strokeWidth: 2 })
    const source = screenRect(context, graph, drag.sourceId)
    const { panX, panY, zoom } = context.view
    const to = { x: drag.x * zoom + panX, y: drag.y * zoom + panY }
    if (source)
      shapes.push({
        type: 'path',
        d: noodle({ x: source.x + source.width, y: source.y + source.height / 2 }, to),
        stroke: css(CONNECTION),
        strokeWidth: 2
      })
  }
  if (selected.length === 1 && !drag) {
    const point = prototypeHandlePoint(context, selected[0])
    if (point)
      shapes.push({
        type: 'ellipse',
        cx: point.x,
        cy: point.y,
        rx: HANDLE_RADIUS,
        ry: HANDLE_RADIUS,
        fill: css({ r: 1, g: 1, b: 1, a: 1 }),
        stroke: css(CONNECTION),
        strokeWidth: 2
      })
  }
  return shapes
}

/** Whether a screen point is on the connection handle of the selected layer. */
export function hitsPrototypeHandle(
  context: OverlayContext,
  sx: number,
  sy: number
): string | null {
  if (!context.overlays.prototyping || context.selectedIds.size !== 1) return null
  const [id] = context.selectedIds
  const point = prototypeHandlePoint(context, id)
  return point && Math.hypot(point.x - sx, point.y - sy) <= HANDLE_RADIUS + 3 ? id : null
}
