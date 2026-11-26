import type { SceneNode, VectorNetwork } from '@kalka/scene-graph'
import { lineEndNetwork } from '@kalka/scene-graph/arrow-caps'
import type { Vector } from '@kalka/scene-graph/primitives'

import { evalCubic, type CubicPoints } from '#core/vector/curve-math'
import { findChains, stepCurve } from '#core/vector/path-ops'

/** Below this angle between two curves where they meet, the path runs on smoothly. */
const CORNER_ANGLE = (12 * Math.PI) / 180
/** About how far apart, in pixels, the points a curve is flattened into are. */
const SAMPLE_SPACING = 1.25
const MAX_SAMPLES_PER_CURVE = 400

/**
 * One subpath flattened into points, with the arc length at each. `corners` are the indices of
 * points where the path turns sharply, which split it into smooth stretches.
 */
export interface Centerline {
  xs: number[]
  ys: number[]
  s: number[]
  length: number
  closed: boolean
  corners: number[]
}

/** A point on a centerline and the unit tangent there. */
export interface CenterlinePoint {
  x: number
  y: number
  tx: number
  ty: number
}

function curveLengthEstimate(curve: CubicPoints): number {
  const { p0, cp1, cp2, p3 } = curve
  return (
    Math.hypot(cp1.x - p0.x, cp1.y - p0.y) +
    Math.hypot(cp2.x - cp1.x, cp2.y - cp1.y) +
    Math.hypot(p3.x - cp2.x, p3.y - cp2.y)
  )
}

function curvePoints(curve: CubicPoints): Array<Vector> {
  const count = Math.min(
    MAX_SAMPLES_PER_CURVE,
    Math.max(4, Math.ceil(curveLengthEstimate(curve) / SAMPLE_SPACING))
  )
  const { p0, cp1, cp2, p3 } = curve
  const points: Array<Vector> = []
  for (let index = 0; index <= count; index++) {
    points.push(evalCubic(p0.x, p0.y, cp1.x, cp1.y, cp2.x, cp2.y, p3.x, p3.y, index / count))
  }
  return points
}

function direction(from: Vector, to: Vector): Vector | null {
  const length = Math.hypot(to.x - from.x, to.y - from.y)
  return length > 1e-9 ? { x: (to.x - from.x) / length, y: (to.y - from.y) / length } : null
}

/** The direction a run of points leaves its first point in, or arrives at its last. */
function endDirection(points: Array<Vector>, atEnd: boolean): Vector | null {
  if (atEnd) {
    const last = points[points.length - 1]
    for (let index = points.length - 2; index >= 0; index--) {
      const found = direction(points[index], last)
      if (found) return found
    }
    return null
  }
  for (let index = 1; index < points.length; index++) {
    const found = direction(points[0], points[index])
    if (found) return found
  }
  return null
}

function isCorner(incoming: Vector | null, outgoing: Vector | null): boolean {
  if (!incoming || !outgoing) return false
  const dot = Math.max(-1, Math.min(1, incoming.x * outgoing.x + incoming.y * outgoing.y))
  return Math.acos(dot) > CORNER_ANGLE
}

function centerlineFromCurves(curves: CubicPoints[], closed: boolean): Centerline | null {
  const xs: number[] = []
  const ys: number[] = []
  const s: number[] = []
  const corners: number[] = []
  let previousEnd: Vector | null = null
  let firstStart: Vector | null = null
  for (const curve of curves) {
    const points = curvePoints(curve)
    if (curveLengthEstimate(curve) < 1e-9) continue
    const start = endDirection(points, false)
    if (firstStart === null) firstStart = start
    if (xs.length > 0 && isCorner(previousEnd, start)) corners.push(xs.length - 1)
    for (let index = xs.length > 0 ? 1 : 0; index < points.length; index++) {
      const point = points[index]
      const last = xs.length - 1
      const step = last >= 0 ? Math.hypot(point.x - xs[last], point.y - ys[last]) : 0
      xs.push(point.x)
      ys.push(point.y)
      s.push(last >= 0 ? s[last] + step : 0)
    }
    previousEnd = endDirection(points, true)
  }
  const length = s.at(-1) ?? 0
  if (xs.length < 2 || !(length > 1e-6)) return null
  // Where a loop closes on a corner, its start is one too.
  if (closed && isCorner(previousEnd, firstStart)) corners.unshift(0)
  return { xs, ys, s, length, closed, corners }
}

/** The network a layer's stroke follows: its own, or a line's two ends. */
function strokeNetwork(node: SceneNode): VectorNetwork | null {
  if (node.vectorNetwork && node.vectorNetwork.segments.length > 0) return node.vectorNetwork
  if (node.type === 'LINE') return lineEndNetwork(node.width, node.height)
  return null
}

/** Each subpath a layer's stroke follows, flattened, in the layer's own coordinates. */
export function strokeCenterlines(node: SceneNode): Centerline[] {
  const network = strokeNetwork(node)
  if (!network) return []
  const centerlines: Centerline[] = []
  for (const chain of findChains(network)) {
    const curves = chain.steps.map((step) => stepCurve(network, step))
    const centerline = centerlineFromCurves(curves, chain.closed)
    if (centerline) centerlines.push(centerline)
  }
  return centerlines
}

/** The index of the last point at or before arc length `at`. */
function sampleIndex(line: Centerline, at: number): number {
  let low = 0
  let high = line.s.length - 1
  while (high - low > 1) {
    const middle = (low + high) >> 1
    if (line.s[middle] <= at) low = middle
    else high = middle
  }
  return low
}

/** The unit tangent at point `index`, from its neighbours within its smooth stretch. */
export function tangentAt(line: Centerline, index: number, from = 0, to = line.xs.length - 1) {
  const before = Math.max(from, index - 1)
  const after = Math.min(to, index + 1)
  const found = direction(
    { x: line.xs[before], y: line.ys[before] },
    { x: line.xs[after], y: line.ys[after] }
  )
  return found ?? { x: 1, y: 0 }
}

/** The point and tangent at arc length `at`, clamped to the line. */
export function pointAtLength(line: Centerline, at: number): CenterlinePoint {
  const clamped = Math.max(0, Math.min(line.length, at))
  const index = Math.min(sampleIndex(line, clamped), line.xs.length - 2)
  const span = line.s[index + 1] - line.s[index]
  const f = span > 1e-12 ? (clamped - line.s[index]) / span : 0
  const tangent = direction(
    { x: line.xs[index], y: line.ys[index] },
    { x: line.xs[index + 1], y: line.ys[index + 1] }
  ) ?? { x: 1, y: 0 }
  return {
    x: line.xs[index] + (line.xs[index + 1] - line.xs[index]) * f,
    y: line.ys[index] + (line.ys[index + 1] - line.ys[index]) * f,
    tx: tangent.x,
    ty: tangent.y
  }
}

/** The arc length on a line nearest to a point, and how far the point is from it. */
export function nearestOnCenterline(
  line: Centerline,
  x: number,
  y: number
): { at: number; distance: number; side: 1 | -1 } {
  let best = { at: 0, distance: Infinity, side: 1 as 1 | -1 }
  for (let index = 0; index < line.xs.length - 1; index++) {
    const ax = line.xs[index]
    const ay = line.ys[index]
    const dx = line.xs[index + 1] - ax
    const dy = line.ys[index + 1] - ay
    const lengthSquared = dx * dx + dy * dy
    const f =
      lengthSquared > 0
        ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / lengthSquared))
        : 0
    const px = ax + dx * f
    const py = ay + dy * f
    const distance = Math.hypot(x - px, y - py)
    if (distance < best.distance) {
      // Left of the path, looking along it, is where the cross product is negative (y down).
      const side = dx * (y - ay) - dy * (x - ax) < 0 ? 1 : -1
      best = { at: line.s[index] + Math.sqrt(lengthSquared) * f, distance, side }
    }
  }
  return best
}
