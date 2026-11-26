import {
  SIZE_FONT_SIZE,
  SIZE_PILL_HEIGHT,
  SIZE_PILL_PADDING_X,
  SIZE_PILL_RADIUS,
  SIZE_PILL_TEXT_OFFSET_Y
} from '@kalka/core/constants'
import { createSceneGeometry } from '@kalka/core/geometry'
import Matrix from '@kalka/scene-graph/matrix'

import { css, type OverlayShape } from '#vue/canvas/svg-overlay/shapes'
import {
  CORNER_HANDLE_RADIUS,
  cornerRadiusHandles,
  showsCornerRadiusHandles
} from '#vue/shared/input/corner-radius'

import { outlineColor, type OverlayContext } from './selection'

const WHITE = css({ r: 1, g: 1, b: 1, a: 1 })
/** Screen pixels from a dragged handle to its radius label. */
const LABEL_OFFSET = 10

/**
 * The selected layer's corner radius handles, as Figma draws them while the pointer is over it: a
 * dot inside each corner, on the radius once it is larger than the dot's inset. The hovered or
 * dragged one fills in, and a dragged one labels the radius it sets.
 */
export function cornerRadiusLayer(context: OverlayContext): OverlayShape[] {
  const { graph, selectedIds, overlays, view } = context
  if (selectedIds.size !== 1 || overlays.transforming) return []
  if (overlays.editingTextId || overlays.nodeEditState) return []
  const [id] = selectedIds
  const node = graph.getNode(id)
  if (!node || !showsCornerRadiusHandles(node, view.zoom)) return []
  // Figma shows the handles while the pointer is over the selected layer.
  const active = overlays.cornerRadiusHandle
  if (active?.nodeId !== node.id) return []
  const color = outlineColor(node, graph)
  const matrix = createSceneGeometry(graph, overlays.rotationPreview).screenMatrix(node, view)
  const handles = cornerRadiusHandles(node, view.zoom)
  const shapes: OverlayShape[] = handles.map((handle) => {
    const [x, y] = Matrix.mapPoints(matrix, [handle.x, handle.y])
    const lit = active.corner === handle.corner
    return {
      type: 'ellipse',
      cx: x,
      cy: y,
      rx: CORNER_HANDLE_RADIUS,
      ry: CORNER_HANDLE_RADIUS,
      fill: lit ? css(color) : WHITE,
      stroke: css(color),
      strokeWidth: 1
    }
  })
  const dragged = active.dragging ? handles.find((h) => h.corner === active.corner) : undefined
  if (!dragged) return shapes
  const [x, y] = Matrix.mapPoints(matrix, [dragged.x, dragged.y])
  const text = String(Math.round(dragged.radius))
  const width = context.measureText(text, SIZE_FONT_SIZE) + SIZE_PILL_PADDING_X * 2
  const left = x + LABEL_OFFSET
  const top = y + LABEL_OFFSET
  return [
    ...shapes,
    {
      type: 'rect',
      x: left,
      y: top,
      width,
      height: SIZE_PILL_HEIGHT,
      rx: SIZE_PILL_RADIUS,
      fill: css(color)
    },
    {
      type: 'text',
      x: left + SIZE_PILL_PADDING_X,
      y: top + SIZE_PILL_TEXT_OFFSET_Y,
      text,
      fill: WHITE,
      fontSize: SIZE_FONT_SIZE
    }
  ]
}
