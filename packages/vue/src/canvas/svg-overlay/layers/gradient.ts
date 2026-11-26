import { SELECTION_COLOR } from '@kalka/core/constants'
import { createSceneGeometry } from '@kalka/core/geometry'
import Matrix from '@kalka/scene-graph/matrix'
import type { Vector } from '@kalka/scene-graph/primitives'

import { css, type OverlayShape } from '#vue/canvas/svg-overlay/shapes'
import {
  editedGradient,
  gradientHandles,
  hasGradientArea,
  type GradientHandle
} from '#vue/shared/input/gradient/geometry'

import type { OverlayContext } from './selection'

const WHITE = css({ r: 1, g: 1, b: 1, a: 1 })
/** The soft dark edge that keeps the white line and handles visible on light paint. */
const SHADOW = css({ r: 0, g: 0, b: 0, a: 0.35 })
const ACCENT = css(SELECTION_COLOR)
/** Screen radius of the dots at the ends of the gradient line and of its width handle. */
const END_RADIUS = 4.5
/** Screen radius of a color stop's swatch. */
const STOP_RADIUS = 6
/** Points along the ellipse of a radial, angular, or diamond gradient. */
const ELLIPSE_STEPS = 64

function line(a: Vector, b: Vector): OverlayShape[] {
  return [
    { type: 'line', x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: SHADOW, strokeWidth: 3 },
    { type: 'line', x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: WHITE, strokeWidth: 1 }
  ]
}

function dot(p: Vector, radius: number, fill: string, lit: boolean): OverlayShape[] {
  return [
    { type: 'ellipse', cx: p.x, cy: p.y, rx: radius + 1, ry: radius + 1, fill: SHADOW },
    {
      type: 'ellipse',
      cx: p.x,
      cy: p.y,
      rx: radius,
      ry: radius,
      fill,
      stroke: lit ? ACCENT : WHITE,
      strokeWidth: 2
    }
  ]
}

function ellipsePath(center: Vector, end: Vector, width: Vector): string {
  const a = { x: end.x - center.x, y: end.y - center.y }
  const b = { x: width.x - center.x, y: width.y - center.y }
  const points = Array.from({ length: ELLIPSE_STEPS }, (_, i) => {
    const angle = (i / ELLIPSE_STEPS) * Math.PI * 2
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    return `${center.x + a.x * cos + b.x * sin} ${center.y + a.y * cos + b.y * sin}`
  })
  return `M${points.join('L')}Z`
}

/**
 * The gradient paint whose picker is open, drawn on its layer as Figma does: the gradient line
 * with a dot at each end, a swatch per color stop along it, and for a radial, angular, or diamond
 * gradient its ellipse and the handle that sets its width. The hovered, dragged, or selected
 * handle is ringed in the selection color.
 */
export function gradientLayer(context: OverlayContext): OverlayShape[] {
  const { graph, overlays, view, selectedIds } = context
  const edit = overlays.gradientEdit
  if (!edit || overlays.editingTextId || overlays.nodeEditState) return []
  if (!selectedIds.has(edit.nodeId)) return []
  const node = graph.getNode(edit.nodeId)
  const fill = editedGradient(node, edit)
  if (!node || !fill || !hasGradientArea(node)) return []

  const matrix = createSceneGeometry(graph, overlays.rotationPreview).screenMatrix(node, view)
  const toScreen = (p: Vector): Vector => {
    const [x, y] = Matrix.mapPoints(matrix, [p.x, p.y])
    return { x, y }
  }
  const handles = gradientHandles(node, fill)
  const start = toScreen(handles.start)
  const end = toScreen(handles.end)
  const width = handles.width ? toScreen(handles.width) : null
  const lit = (handle: GradientHandle) => edit.handle === handle

  const shapes: OverlayShape[] = []
  if (width) {
    const d = ellipsePath(start, end, width)
    shapes.push(
      { type: 'path', d, stroke: SHADOW, strokeWidth: 3 },
      { type: 'path', d, stroke: WHITE, strokeWidth: 1, dash: [4, 3] },
      ...line(start, width)
    )
  }
  shapes.push(...line(start, end))
  shapes.push(...dot(start, END_RADIUS, WHITE, lit('start')))
  shapes.push(...dot(end, END_RADIUS, WHITE, lit('end')))
  if (width) shapes.push(...dot(width, END_RADIUS, WHITE, lit('width')))
  ;(fill.gradientStops ?? []).forEach((stop, index) => {
    const at = toScreen(handles.stops[index])
    const ringed = lit(index) || edit.activeStop === index
    shapes.push(...dot(at, STOP_RADIUS, css(stop.color, 1), ringed))
  })
  return shapes
}
