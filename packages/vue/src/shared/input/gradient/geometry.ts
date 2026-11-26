import type { EditorState } from '@kalka/core/editor'
import type { Fill, GradientTransform, SceneNode } from '@kalka/scene-graph'
import {
  ellipticalGradientTransform,
  gradientPoint,
  isGradientFill,
  linearGradientTransform
} from '@kalka/scene-graph/gradient'
import type { Vector } from '@kalka/scene-graph/primitives'

/** The gradient paint a picker edits, and the handle under the pointer. */
export type GradientEdit = NonNullable<EditorState['gradientEdit']>

/** The ends of the gradient line, the width of an elliptical one, or a stop by its index. */
export type GradientHandle = NonNullable<GradientEdit['handle']>

type Size = Pick<SceneNode, 'width' | 'height'>

/**
 * A gradient's handles in the layer's own coordinates, as Figma places them: a linear gradient
 * runs from `start` to `end`; a radial, angular, or diamond one is centred on `start`, reaches
 * `end` along its first radius and `width` along its second. Stops sit on the line from `start`
 * to `end` at their positions.
 */
export interface GradientHandles {
  start: Vector
  end: Vector
  width: Vector | null
  stops: Vector[]
}

const EPSILON = 1e-6

const sub = (a: Vector, b: Vector): Vector => ({ x: a.x - b.x, y: a.y - b.y })
const add = (a: Vector, b: Vector): Vector => ({ x: a.x + b.x, y: a.y + b.y })
const scale = (v: Vector, k: number): Vector => ({ x: v.x * k, y: v.y * k })
const dot = (a: Vector, b: Vector) => a.x * b.x + a.y * b.y
const cross = (a: Vector, b: Vector) => a.x * b.y - a.y * b.x
const length = (v: Vector) => Math.hypot(v.x, v.y)

/** The gradient paint an edit points at, if the layer still has one there. */
export function editedGradient(node: SceneNode | undefined, edit: GradientEdit): Fill | null {
  const paint = node?.[edit.paint].at(edit.index)
  return paint && isGradientFill(paint.type) ? paint : null
}

function toLocal(size: Size, unit: Vector): Vector {
  return { x: unit.x * size.width, y: unit.y * size.height }
}

function toUnit(size: Size, local: Vector): Vector {
  return { x: local.x / size.width, y: local.y / size.height }
}

/** Whether a layer has the area a gradient's handles need. */
export function hasGradientArea(size: Size): boolean {
  return size.width > EPSILON && size.height > EPSILON
}

/** The handles of a gradient paint on a layer, in the layer's coordinates. */
export function gradientHandles(size: Size, fill: Fill): GradientHandles {
  const transform = fill.gradientTransform
  const at = (x: number, y: number) =>
    toLocal(size, transform ? gradientPoint(transform, { x, y }) : { x, y })
  const linear = fill.type === 'GRADIENT_LINEAR'
  const start = linear ? at(0, 0.5) : at(0.5, 0.5)
  const end = at(1, 0.5)
  const stops = (fill.gradientStops ?? []).map((stop) =>
    add(start, scale(sub(end, start), stop.position))
  )
  return { start, end, width: linear ? null : at(0.5, 1), stops }
}

/** Where a point falls along the gradient line, from 0 at its start to 1 at its end. */
export function gradientLinePosition(handles: GradientHandles, point: Vector): number {
  const axis = sub(handles.end, handles.start)
  const squared = dot(axis, axis)
  if (squared < EPSILON) return 0
  return Math.min(1, Math.max(0, dot(sub(point, handles.start), axis) / squared))
}

/**
 * How long a linear gradient's second axis is next to its line, on screen. Figma keeps that ratio
 * when an end is dragged.
 */
function linearAcrossRatio(size: Size, transform: GradientTransform): number {
  const axis = sub(
    toLocal(size, gradientPoint(transform, { x: 1, y: 0 })),
    toLocal(size, gradientPoint(transform, { x: 0, y: 0 }))
  )
  const across = sub(
    toLocal(size, gradientPoint(transform, { x: 0, y: 1 })),
    toLocal(size, gradientPoint(transform, { x: 0, y: 0 }))
  )
  const axisLength = length(axis)
  return axisLength < EPSILON ? size.height / size.width : length(across) / axisLength
}

/**
 * The transform after dragging an end or the width handle to `point`, in the layer's coordinates.
 * The start of a linear gradient or the end moves alone; the centre of an elliptical one carries
 * the whole ellipse; its end turns and stretches the first radius with the second staying square
 * to it; the width handle only lengthens the second radius.
 */
export function draggedGradientTransform(
  size: Size,
  fill: Fill,
  handle: 'start' | 'end' | 'width',
  point: Vector
): GradientTransform | null {
  const transform = fill.gradientTransform
  if (!transform || !hasGradientArea(size)) return null
  const current = gradientHandles(size, fill)
  const unit = (local: Vector) => toUnit(size, local)

  if (fill.type === 'GRADIENT_LINEAR') {
    const start = handle === 'start' ? point : current.start
    const end = handle === 'end' ? point : current.end
    if (length(sub(end, start)) < EPSILON) return null
    const ratio = linearAcrossRatio(size, transform)
    return linearGradientTransform(unit(start), unit(end), size.width, size.height, ratio)
  }

  const width = current.width ?? current.end
  if (handle === 'start') {
    const offset = sub(point, current.start)
    return ellipticalGradientTransform(
      unit(point),
      unit(add(current.end, offset)),
      unit(add(width, offset))
    )
  }

  const radius = sub(current.end, current.start)
  const second = sub(width, current.start)
  // Which side of the first radius the second lies on, so dragging never mirrors the gradient.
  const side = cross(radius, second) < 0 ? -1 : 1
  if (handle === 'end') {
    const next = sub(point, current.start)
    const nextLength = length(next)
    if (nextLength < EPSILON) return null
    const perpendicular = scale({ x: -next.y, y: next.x }, (side * length(second)) / nextLength)
    return ellipticalGradientTransform(
      unit(current.start),
      unit(point),
      unit(add(current.start, perpendicular))
    )
  }

  const radiusLength = length(radius)
  if (radiusLength < EPSILON) return null
  const direction = scale({ x: -radius.y, y: radius.x }, side / radiusLength)
  const reach = Math.max(EPSILON * 1000, dot(sub(point, current.start), direction))
  return ellipticalGradientTransform(
    unit(current.start),
    unit(current.end),
    unit(add(current.start, scale(direction, reach)))
  )
}

/** The paint with a handle dragged to `point`, in the layer's coordinates. */
export function dragGradientHandle<P extends Fill>(
  size: Size,
  fill: P,
  handle: GradientHandle,
  point: Vector
): P {
  if (typeof handle === 'number') {
    const stops = fill.gradientStops ?? []
    if (!stops[handle]) return fill
    const position = gradientLinePosition(gradientHandles(size, fill), point)
    return {
      ...fill,
      gradientStops: stops.map((stop, i) => (i === handle ? { ...stop, position } : stop))
    }
  }
  const gradientTransform = draggedGradientTransform(size, fill, handle, point)
  return gradientTransform ? { ...fill, gradientTransform } : fill
}
