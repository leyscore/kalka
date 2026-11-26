import { SELECTION_COLOR } from '@kalka/core/constants'
import type { WidthHandle } from '@kalka/core/editor'
import type { Vector } from '@kalka/scene-graph/primitives'

import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import { css, type OverlayShape } from '#vue/canvas/svg-overlay/shapes'

const WHITE = '#ffffff'

/** A width point in screen space: a line across the stroke, a dot on each edge and one on the path. */
function handleShapes(
  handle: WidthHandle,
  toScreen: (x: number, y: number) => Vector,
  strong: boolean
): OverlayShape[] {
  const center = toScreen(handle.center.x, handle.center.y)
  const left = toScreen(handle.left.x, handle.left.y)
  const right = toScreen(handle.right.x, handle.right.y)
  const color = css(SELECTION_COLOR, strong ? 1 : 0.7)
  const dot = (point: Vector, radius: number, fill = WHITE): OverlayShape => ({
    type: 'ellipse',
    cx: point.x,
    cy: point.y,
    rx: radius,
    ry: radius,
    fill,
    stroke: color,
    strokeWidth: 1
  })
  return [
    { type: 'line', x1: left.x, y1: left.y, x2: right.x, y2: right.y, stroke: color, strokeWidth: 1 },
    dot(left, 3.5),
    dot(right, 3.5),
    dot(center, 2.5, color)
  ]
}

/**
 * The Variable width tool's handles on the selected path: each width point across the stroke,
 * the one being dragged drawn stronger, and a faint one where a press would add a point.
 */
export function variableWidthLayer(context: OverlayContext): OverlayShape[] {
  const state = context.overlays.widthEdit
  if (!state) return []
  const { panX, panY, zoom } = context.view
  const toScreen = (x: number, y: number) => ({ x: x * zoom + panX, y: y * zoom + panY })
  const shapes = state.handles.flatMap((handle, index) =>
    handleShapes(handle, toScreen, state.active === index)
  )
  if (state.hover) {
    shapes.push({ type: 'group', opacity: 0.6, children: handleShapes(state.hover, toScreen, false) })
  }
  return shapes
}
