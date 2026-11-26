import type { VectorNetwork, VectorRegion, VectorSegment, VectorVertex } from '@kalka/scene-graph'
import type { Vector } from '@kalka/scene-graph/primitives'

import { computeAccurateBounds, evalCubic, type CubicPoints } from '#core/vector/curve-math'

import { findChains, stepCurve, type ChainStep, type PathChain } from './chains'
import { fitCubics, unitVector } from './fit'

/** A turn sharper than this, in degrees, is a corner Simplify keeps. */
const CORNER_ANGLE = 35
const CORNER_COS = Math.cos((CORNER_ANGLE * Math.PI) / 180)

function controlLength(curve: CubicPoints): number {
  return (
    Math.hypot(curve.cp1.x - curve.p0.x, curve.cp1.y - curve.p0.y) +
    Math.hypot(curve.cp2.x - curve.cp1.x, curve.cp2.y - curve.cp1.y) +
    Math.hypot(curve.p3.x - curve.cp2.x, curve.p3.y - curve.cp2.y)
  )
}

/** The direction a curve leaves its start in, falling back on its other points. */
export function curveStartDirection(curve: CubicPoints): Vector | null {
  for (const point of [curve.cp1, curve.cp2, curve.p3]) {
    const direction = unitVector({ x: point.x - curve.p0.x, y: point.y - curve.p0.y })
    if (direction) return direction
  }
  return null
}

/** The direction a curve arrives at its end in. */
export function curveEndDirection(curve: CubicPoints): Vector | null {
  for (const point of [curve.cp2, curve.cp1, curve.p0]) {
    const direction = unitVector({ x: curve.p3.x - point.x, y: curve.p3.y - point.y })
    if (direction) return direction
  }
  return null
}

function isCorner(arriving: CubicPoints, leaving: CubicPoints): boolean {
  const a = curveEndDirection(arriving)
  const b = curveStartDirection(leaving)
  if (!a || !b) return true
  return a.x * b.x + a.y * b.y < CORNER_COS
}

interface Run {
  steps: ChainStep[]
  /** The fitted replacement, or null when the run stays as it was. */
  fit: CubicPoints[] | null
}

/** A chain cut at its corners; a loop without corners stays one run. */
function chainRuns(network: VectorNetwork, chain: PathChain): ChainStep[][] {
  const curves = chain.steps.map((step) => stepCurve(network, step))
  const n = chain.steps.length
  const corners: number[] = []
  // Step i starts at a corner when the curve before it turns sharply into it.
  for (let i = chain.closed ? 0 : 1; i < n; i++) {
    const previous = i === 0 ? n - 1 : i - 1
    if (isCorner(curves[previous], curves[i])) corners.push(i)
  }
  if (!chain.closed) {
    const runs: ChainStep[][] = []
    let start = 0
    for (const corner of [...corners, n]) {
      runs.push(chain.steps.slice(start, corner))
      start = corner
    }
    return runs.filter((run) => run.length > 0)
  }
  if (corners.length === 0) return [chain.steps]
  const runs: ChainStep[][] = []
  for (let c = 0; c < corners.length; c++) {
    const from = corners[c]
    const to = corners[(c + 1) % corners.length]
    const run: ChainStep[] = []
    for (let i = from; run.length === 0 || i !== to; i = (i + 1) % n) run.push(chain.steps[i])
    runs.push(run)
  }
  return runs
}

function samplePoints(curves: readonly CubicPoints[]): Vector[] {
  const points: Vector[] = [curves[0].p0]
  for (const curve of curves) {
    const samples = Math.min(64, Math.max(6, Math.ceil(controlLength(curve) / 1.5)))
    for (let s = 1; s <= samples; s++) {
      const t = s / samples
      const { p0, cp1, cp2, p3 } = curve
      points.push(evalCubic(p0.x, p0.y, cp1.x, cp1.y, cp2.x, cp2.y, p3.x, p3.y, t))
    }
  }
  return points
}

/** A curve that never strays from its chord is drawn as a straight line, as it was before. */
function straightenIfFlat(curve: CubicPoints, tolerance: number): CubicPoints {
  const chord = { x: curve.p3.x - curve.p0.x, y: curve.p3.y - curve.p0.y }
  const len = Math.hypot(chord.x, chord.y)
  if (len < 1e-9) return curve
  const off = (p: Vector) =>
    Math.abs((p.x - curve.p0.x) * chord.y - (p.y - curve.p0.y) * chord.x) / len
  return off(curve.cp1) <= tolerance / 4 && off(curve.cp2) <= tolerance / 4
    ? { p0: curve.p0, cp1: curve.p0, cp2: curve.p3, p3: curve.p3 }
    : curve
}

function fitRunCurves(
  network: VectorNetwork,
  steps: ChainStep[],
  tolerance: number
): CubicPoints[] | null {
  if (steps.length < 2) return null
  const curves = steps.map((step) => stepCurve(network, step))
  const first = curves[0]
  const last = curves[curves.length - 1]
  const closed =
    Math.hypot(first.p0.x - last.p3.x, first.p0.y - last.p3.y) < 1e-9 && !isCorner(last, first)
  // A smooth loop keeps its seam smooth: both ends take the average of the two directions there.
  let tangentStart = curveStartDirection(first)
  let arriving = curveEndDirection(last)
  if (closed && tangentStart && arriving) {
    const average = unitVector({ x: tangentStart.x + arriving.x, y: tangentStart.y + arriving.y })
    if (average) {
      tangentStart = average
      arriving = average
    }
  }
  const fitted = fitCubics(samplePoints(curves), {
    tolerance,
    tangentStart,
    tangentEnd: arriving ? { x: -arriving.x, y: -arriving.y } : null
  })
  if (fitted.length === 0 || fitted.length >= steps.length) return null
  return fitted.map((curve) => straightenIfFlat(curve, tolerance))
}

/** Simplify's default tolerance: half a pixel, more for large paths. */
export function defaultSimplifyTolerance(network: VectorNetwork): number {
  const bounds = computeAccurateBounds(network)
  return Math.min(4, Math.max(0.5, Math.hypot(bounds.width, bounds.height) * 0.004))
}

function relativeSegment(
  curve: CubicPoints,
  start: number,
  end: number,
  startPoint: Vector,
  endPoint: Vector
): VectorSegment {
  return {
    start,
    end,
    tangentStart: { x: curve.cp1.x - startPoint.x, y: curve.cp1.y - startPoint.y },
    tangentEnd: { x: curve.cp2.x - endPoint.x, y: curve.cp2.y - endPoint.y }
  }
}

function remapLoop(
  loop: readonly number[],
  runOf: Map<number, { run: number; position: number }>,
  runs: readonly Run[],
  newSegmentsOfRun: readonly number[][],
  keptSegment: Map<number, number>
): number[] {
  const runAt = (i: number) => runOf.get(loop[(i + loop.length) % loop.length])?.run ?? -1
  let offset = loop.findIndex((_, i) => runAt(i) !== runAt(i - 1))
  if (offset === -1) offset = 0
  const rotated = [...loop.slice(offset), ...loop.slice(0, offset)]
  const result: number[] = []
  for (let i = 0; i < rotated.length;) {
    const info = runOf.get(rotated[i])
    if (!info || !runs[info.run].fit) {
      const kept = keptSegment.get(rotated[i])
      if (kept !== undefined) result.push(kept)
      i++
      continue
    }
    let j = i
    while (j < rotated.length && runOf.get(rotated[j])?.run === info.run) j++
    const size = runs[info.run].steps.length
    const next = j - i > 1 ? runOf.get(rotated[i + 1])?.position : undefined
    const forward = next === undefined || (next - info.position + size) % size === 1
    const segments = newSegmentsOfRun[info.run]
    result.push(...(forward ? segments : [...segments].reverse()))
    i = j
  }
  return result
}

/**
 * Figma's Simplify vector: refit each smooth stretch of the path with as few curves as stay
 * within `tolerance` of it. Corners, ends and junctions stay where they are, a stretch only
 * changes when it ends up with fewer points, and fills keep their regions.
 */
export function simplifyVectorNetwork(
  network: VectorNetwork,
  tolerance = defaultSimplifyTolerance(network)
): VectorNetwork {
  const runs: Run[] = []
  for (const chain of findChains(network)) {
    for (const steps of chainRuns(network, chain)) {
      runs.push({ steps, fit: fitRunCurves(network, steps, tolerance) })
    }
  }
  if (!runs.some((run) => run.fit)) return network

  // Points inside a refitted stretch go; every other point stays, in order.
  const removed = new Set<number>()
  const runOf = new Map<number, { run: number; position: number }>()
  runs.forEach((run, runIndex) => {
    run.steps.forEach((step, position) => {
      runOf.set(step.segment, { run: runIndex, position })
      if (!run.fit || position === 0) return
      const segment = network.segments[step.segment]
      removed.add(step.forward ? segment.start : segment.end)
    })
  })
  const vertices: VectorVertex[] = []
  const vertexMap = new Map<number, number>()
  network.vertices.forEach((vertex, index) => {
    if (removed.has(index)) return
    vertexMap.set(index, vertices.length)
    vertices.push({ ...vertex })
  })
  const mapVertex = (index: number) => vertexMap.get(index) ?? 0

  const segments: VectorSegment[] = []
  const keptSegment = new Map<number, number>()
  const newSegmentsOfRun: number[][] = runs.map(() => [])
  const emitted = new Set<number>()
  network.segments.forEach((segment, index) => {
    const info = runOf.get(index)
    const fit = info ? runs[info.run].fit : null
    if (!info || !fit) {
      keptSegment.set(index, segments.length)
      segments.push({
        start: mapVertex(segment.start),
        end: mapVertex(segment.end),
        tangentStart: { ...segment.tangentStart },
        tangentEnd: { ...segment.tangentEnd }
      })
      return
    }
    if (emitted.has(info.run)) return
    emitted.add(info.run)
    const { steps } = runs[info.run]
    const first = steps[0]
    const last = steps[steps.length - 1]
    const firstSegment = network.segments[first.segment]
    const lastSegment = network.segments[last.segment]
    const startVertex = mapVertex(first.forward ? firstSegment.start : firstSegment.end)
    const endVertex = mapVertex(last.forward ? lastSegment.end : lastSegment.start)
    fit.forEach((curve, k) => {
      const isLast = k === fit.length - 1
      const start = k === 0 ? startVertex : vertices.length - 1
      let end = endVertex
      if (!isLast) {
        end = vertices.length
        vertices.push({ x: curve.p3.x, y: curve.p3.y, handleMirroring: 'ANGLE' })
      }
      newSegmentsOfRun[info.run].push(segments.length)
      segments.push(relativeSegment(curve, start, end, curve.p0, curve.p3))
    })
  })

  const regions: VectorRegion[] = network.regions.map((region) => ({
    ...region,
    loops: region.loops.map((loop) => remapLoop(loop, runOf, runs, newSegmentsOfRun, keptSegment))
  }))
  return { vertices, segments, regions }
}
