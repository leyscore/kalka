import type { Vector } from '@kalka/scene-graph/primitives'

import type { CubicPoints } from '#core/vector/curve-math'

/**
 * Least-squares fitting of cubic Béziers to a run of points, after Philip Schneider's method
 * ("An Algorithm for Automatically Fitting Digitized Curves", Graphics Gems, 1990): fit one curve
 * with the end tangents fixed, refine its parameters with Newton steps, and split at the point of
 * worst error when it still misses. The pencil fits strokes with it and Simplify refits paths.
 */

const MAX_REPARAMETERIZE = 4
const MAX_DEPTH = 24

function sub(a: Vector, b: Vector): Vector {
  return { x: a.x - b.x, y: a.y - b.y }
}
function add(a: Vector, b: Vector): Vector {
  return { x: a.x + b.x, y: a.y + b.y }
}
function scale(a: Vector, s: number): Vector {
  return { x: a.x * s, y: a.y * s }
}
function dot(a: Vector, b: Vector): number {
  return a.x * b.x + a.y * b.y
}
function length(a: Vector): number {
  return Math.hypot(a.x, a.y)
}

/** The unit vector of `a`, or null when it has no length to speak of. */
export function unitVector(a: Vector): Vector | null {
  const len = length(a)
  return len > 1e-9 ? { x: a.x / len, y: a.y / len } : null
}

function bezierAt(curve: CubicPoints, t: number): Vector {
  const mt = 1 - t
  const a = mt * mt * mt
  const b = 3 * mt * mt * t
  const c = 3 * mt * t * t
  const d = t * t * t
  return {
    x: a * curve.p0.x + b * curve.cp1.x + c * curve.cp2.x + d * curve.p3.x,
    y: a * curve.p0.y + b * curve.cp1.y + c * curve.cp2.y + d * curve.p3.y
  }
}

function bezierDerivative(curve: CubicPoints, t: number): Vector {
  const mt = 1 - t
  const a = sub(curve.cp1, curve.p0)
  const b = sub(curve.cp2, curve.cp1)
  const c = sub(curve.p3, curve.cp2)
  return {
    x: 3 * (mt * mt * a.x + 2 * mt * t * b.x + t * t * c.x),
    y: 3 * (mt * mt * a.y + 2 * mt * t * b.y + t * t * c.y)
  }
}

function bezierSecondDerivative(curve: CubicPoints, t: number): Vector {
  const mt = 1 - t
  const a = add(sub(curve.cp2, scale(curve.cp1, 2)), curve.p0)
  const b = add(sub(curve.p3, scale(curve.cp2, 2)), curve.cp1)
  return { x: 6 * (mt * a.x + t * b.x), y: 6 * (mt * a.y + t * b.y) }
}

function chordLengthParameters(points: readonly Vector[]): number[] {
  const u = [0]
  for (let i = 1; i < points.length; i++) u.push(u[i - 1] + length(sub(points[i], points[i - 1])))
  const total = u[u.length - 1]
  return total > 0 ? u.map((value) => value / total) : u.map((_, i) => i / (points.length - 1))
}

/** The curve through the run's ends whose handles lie along the given tangents. */
function generateBezier(
  points: readonly Vector[],
  params: readonly number[],
  tangentStart: Vector,
  tangentEnd: Vector
): CubicPoints {
  const first = points[0]
  const last = points[points.length - 1]
  let c00 = 0
  let c01 = 0
  let c11 = 0
  let x0 = 0
  let x1 = 0
  for (let i = 0; i < points.length; i++) {
    const t = params[i]
    const mt = 1 - t
    const b0 = mt * mt * mt
    const b1 = 3 * mt * mt * t
    const b2 = 3 * mt * t * t
    const b3 = t * t * t
    const a0 = scale(tangentStart, b1)
    const a1 = scale(tangentEnd, b2)
    c00 += dot(a0, a0)
    c01 += dot(a0, a1)
    c11 += dot(a1, a1)
    const rest = sub(points[i], add(scale(first, b0 + b1), scale(last, b2 + b3)))
    x0 += dot(a0, rest)
    x1 += dot(a1, rest)
  }
  const det = c00 * c11 - c01 * c01
  let alphaStart = Math.abs(det) > 1e-12 ? (x0 * c11 - x1 * c01) / det : 0
  let alphaEnd = Math.abs(det) > 1e-12 ? (c00 * x1 - c01 * x0) / det : 0
  const chord = length(sub(last, first))
  const epsilon = 1e-6 * chord
  // Degenerate or backwards handles: fall back to a third of the chord, as the method advises.
  if (alphaStart < epsilon || alphaEnd < epsilon) {
    alphaStart = chord / 3
    alphaEnd = chord / 3
  }
  return {
    p0: first,
    cp1: add(first, scale(tangentStart, alphaStart)),
    cp2: add(last, scale(tangentEnd, alphaEnd)),
    p3: last
  }
}

function reparameterize(
  curve: CubicPoints,
  points: readonly Vector[],
  params: readonly number[]
): number[] {
  return params.map((t, i) => {
    const delta = sub(bezierAt(curve, t), points[i])
    const d1 = bezierDerivative(curve, t)
    const d2 = bezierSecondDerivative(curve, t)
    const denominator = dot(d1, d1) + dot(delta, d2)
    if (Math.abs(denominator) < 1e-12) return t
    return Math.min(1, Math.max(0, t - dot(delta, d1) / denominator))
  })
}

function maxError(
  curve: CubicPoints,
  points: readonly Vector[],
  params: readonly number[]
): { error: number; index: number } {
  let error = 0
  let index = Math.floor(points.length / 2)
  for (let i = 1; i < points.length - 1; i++) {
    const d = sub(bezierAt(curve, params[i]), points[i])
    const squared = dot(d, d)
    if (squared >= error) {
      error = squared
      index = i
    }
  }
  return { error, index }
}

function fitRun(
  points: readonly Vector[],
  tangentStart: Vector,
  tangentEnd: Vector,
  squaredError: number,
  depth: number,
  out: CubicPoints[]
): void {
  const first = points[0]
  const last = points[points.length - 1]
  if (points.length === 2) {
    const third = length(sub(last, first)) / 3
    out.push({
      p0: first,
      cp1: add(first, scale(tangentStart, third)),
      cp2: add(last, scale(tangentEnd, third)),
      p3: last
    })
    return
  }

  let params = chordLengthParameters(points)
  let curve = generateBezier(points, params, tangentStart, tangentEnd)
  let worst = maxError(curve, points, params)
  if (worst.error < squaredError || depth >= MAX_DEPTH) {
    out.push(curve)
    return
  }
  if (worst.error < squaredError * 4) {
    for (let i = 0; i < MAX_REPARAMETERIZE; i++) {
      params = reparameterize(curve, points, params)
      curve = generateBezier(points, params, tangentStart, tangentEnd)
      worst = maxError(curve, points, params)
      if (worst.error < squaredError) {
        out.push(curve)
        return
      }
    }
  }

  const split = Math.min(points.length - 2, Math.max(1, worst.index))
  const center = unitVector(sub(points[split - 1], points[split + 1])) ?? {
    x: -tangentStart.x,
    y: -tangentStart.y
  }
  fitRun(points.slice(0, split + 1), tangentStart, center, squaredError, depth + 1, out)
  fitRun(points.slice(split), scale(center, -1), tangentEnd, squaredError, depth + 1, out)
}

/** Points with consecutive duplicates dropped, which would stall the parameterization. */
export function dedupePoints(points: readonly Vector[], minDistance = 1e-6): Vector[] {
  const result: Vector[] = []
  for (const point of points) {
    const previous = result.at(-1)
    if (previous && length(sub(point, previous)) <= minDistance) continue
    result.push({ x: point.x, y: point.y })
  }
  return result
}

export interface FitCubicsOptions {
  /** How far, in the points' units, the curves may stray from any point. */
  tolerance: number
  /** The direction the run leaves its first point in; estimated from the points otherwise. */
  tangentStart?: Vector | null
  /** The direction from the last point back into the run; estimated otherwise. */
  tangentEnd?: Vector | null
}

/**
 * Cubic Béziers, joined end to end, that pass within `tolerance` of every point. The curves
 * meet tangent to each other; the run's own ends follow the given tangents.
 */
export function fitCubics(points: readonly Vector[], options: FitCubicsOptions): CubicPoints[] {
  const run = dedupePoints(points)
  if (run.length < 2) return []
  const tangentStart = (options.tangentStart && unitVector(options.tangentStart)) ??
    unitVector(sub(run[1], run[0])) ?? { x: 1, y: 0 }
  const tangentEnd = (options.tangentEnd && unitVector(options.tangentEnd)) ??
    unitVector(sub(run[run.length - 2], run[run.length - 1])) ?? { x: -1, y: 0 }
  const out: CubicPoints[] = []
  const tolerance = Math.max(1e-3, options.tolerance)
  fitRun(run, tangentStart, tangentEnd, tolerance * tolerance, 0, out)
  return out
}
