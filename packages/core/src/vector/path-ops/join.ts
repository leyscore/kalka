import type { VectorNetwork, VectorSegment, VectorVertex } from '@kalka/scene-graph'
import type { Vector } from '@kalka/scene-graph/primitives'

import { isLineSegment, removeVertex } from '../bezier'
import { findChains, stepCurve, vertexDegrees } from './chains'
import { unitVector } from './fit'
import { curveEndDirection } from './simplify'

/** Points closer than this are one point once joined. */
const MERGE_DISTANCE = 0.01
/** How far a smooth join's handles reach, as a share of the gap they bridge. */
const SMOOTH_HANDLE_SHARE = 1 / 3

function cloneNetwork(network: VectorNetwork): VectorNetwork {
  return {
    vertices: network.vertices.map((vertex) => ({ ...vertex })),
    segments: network.segments.map((segment) => ({
      ...segment,
      tangentStart: { ...segment.tangentStart },
      tangentEnd: { ...segment.tangentEnd }
    })),
    regions: network.regions.map((region) => ({
      ...region,
      loops: region.loops.map((loop) => [...loop])
    }))
  }
}

function distance(a: Vector, b: Vector): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/** The pairs to join: two points as chosen, more paired with their nearest free ends. */
function joinPairs(network: VectorNetwork, indices: readonly number[]): [number, number][] {
  const unique = [...new Set(indices)].filter((i) => i >= 0 && i < network.vertices.length)
  if (unique.length === 2) return [[unique[0], unique[1]]]
  const degrees = vertexDegrees(network)
  const free = unique.filter((i) => degrees[i] <= 1)
  const candidates: { a: number; b: number; d: number }[] = []
  for (let i = 0; i < free.length; i++) {
    for (let j = i + 1; j < free.length; j++) {
      const a = free[i]
      const b = free[j]
      candidates.push({ a, b, d: distance(network.vertices[a], network.vertices[b]) })
    }
  }
  candidates.sort((x, y) => x.d - y.d)
  const used = new Set<number>()
  const pairs: [number, number][] = []
  for (const { a, b } of candidates) {
    if (used.has(a) || used.has(b)) continue
    used.add(a)
    used.add(b)
    pairs.push([a, b])
  }
  return pairs
}

function connected(network: VectorNetwork, a: number, b: number): boolean {
  return network.segments.some(
    (s) => (s.start === a && s.end === b) || (s.start === b && s.end === a)
  )
}

/** The handle fields that meet at a point. */
function handlesAt(network: VectorNetwork, vertex: number) {
  const handles: { segment: VectorSegment; field: 'tangentStart' | 'tangentEnd' }[] = []
  for (const segment of network.segments) {
    if (segment.start === vertex) handles.push({ segment, field: 'tangentStart' })
    if (segment.end === vertex) handles.push({ segment, field: 'tangentEnd' })
  }
  return handles
}

/** The direction a path carries on past one of its ends, along the curve that reaches it. */
function outwardDirection(network: VectorNetwork, vertex: number, toward: Vector): Vector | null {
  const handles = handlesAt(network, vertex)
  if (handles.length !== 1) {
    return unitVector({
      x: toward.x - network.vertices[vertex].x,
      y: toward.y - network.vertices[vertex].y
    })
  }
  const { segment } = handles[0]
  const forward = segment.end === vertex
  const curve = stepCurve(network, { segment: network.segments.indexOf(segment), forward })
  return curveEndDirection(curve)
}

/** Moves every segment of `from` onto `into` and drops `from`. */
function mergeVertices(network: VectorNetwork, into: number, from: number): VectorNetwork {
  const vertices = network.vertices.filter((_, i) => i !== from)
  const remap = (i: number) => {
    const target = i === from ? into : i
    return target > from ? target - 1 : target
  }
  const segmentMap = new Map<number, number | null>()
  const segments: VectorSegment[] = []
  network.segments.forEach((segment, index) => {
    const start = remap(segment.start)
    const end = remap(segment.end)
    if (start === end && distance(segment.tangentStart, segment.tangentEnd) === 0) {
      segmentMap.set(index, null)
      return
    }
    segmentMap.set(index, segments.length)
    segments.push({ ...segment, start, end })
  })
  const regions = network.regions.map((region) => ({
    ...region,
    loops: region.loops.map((loop) =>
      loop.flatMap((index) => {
        const mapped = segmentMap.get(index)
        return mapped === null || mapped === undefined ? [] : [mapped]
      })
    )
  }))
  return { vertices, segments, regions }
}

/** A loop the join just closed gets a fill region, as a path closed with the pen does. */
function fillNewLoops(network: VectorNetwork): VectorNetwork {
  const inRegion = new Set(network.regions.flatMap((region) => region.loops.flat()))
  const loops = findChains(network)
    .filter((chain) => chain.closed && chain.steps.every((step) => !inRegion.has(step.segment)))
    .map((chain) => chain.steps.map((step) => step.segment))
  if (loops.length === 0) return network
  return {
    ...network,
    regions: [
      ...network.regions,
      ...loops.map((loop) => ({ windingRule: 'NONZERO' as const, loops: [loop] }))
    ]
  }
}

export interface JoinResult {
  network: VectorNetwork
  /** The joined points, renumbered for the new network. */
  vertices: number[]
}

/**
 * Figma's Join selection, and Smooth join selection with `smooth`: two chosen points are linked
 * by a new segment (or become one point when they sit on each other); with more, each free end
 * is linked to the nearest other one. A smooth join leaves the ends along the curves that reach
 * them, so the path flows through. A loop that closes is filled.
 */
export function joinVertices(
  network: VectorNetwork,
  indices: readonly number[],
  options: { smooth?: boolean } = {}
): JoinResult | null {
  let next = cloneNetwork(network)
  const pairs = joinPairs(next, indices)
  if (pairs.length === 0) return null
  // Where each chosen point is now: merging two points renumbers the ones after them.
  const current = new Map(pairs.flat().map((index) => [index, index]))
  let changed = false

  for (const [first, second] of pairs) {
    const a = current.get(first) ?? first
    const b = current.get(second) ?? second
    if (a === b || connected(next, a, b)) continue
    const va = next.vertices[a]
    const vb = next.vertices[b]
    if (distance(va, vb) < MERGE_DISTANCE) {
      const [keep, drop] = a < b ? [a, b] : [b, a]
      next = mergeVertices(next, keep, drop)
      for (const [key, value] of current) {
        if (value === drop) current.set(key, keep)
        else if (value > drop) current.set(key, value - 1)
      }
      changed = true
      continue
    }
    const segment: VectorSegment = {
      start: a,
      end: b,
      tangentStart: { x: 0, y: 0 },
      tangentEnd: { x: 0, y: 0 }
    }
    if (options.smooth) smoothJoinHandles(next, segment, va, vb)
    next.segments.push(segment)
    changed = true
  }
  if (!changed) return null
  return { network: fillNewLoops(next), vertices: [...new Set(current.values())] }
}

function smoothJoinHandles(
  network: VectorNetwork,
  segment: VectorSegment,
  va: VectorVertex,
  vb: VectorVertex
): void {
  const reach = distance(va, vb) * SMOOTH_HANDLE_SHARE
  for (const [vertex, other, field] of [
    [segment.start, vb, 'tangentStart'],
    [segment.end, va, 'tangentEnd']
  ] as const) {
    const direction = outwardDirection(network, vertex, other)
    if (!direction) continue
    segment[field] = { x: direction.x * reach, y: direction.y * reach }
    // The curve already there gets the mirrored handle, so the point is smooth.
    for (const handle of handlesAt(network, vertex)) {
      const current = handle.segment[handle.field]
      const length = Math.hypot(current.x, current.y) || reach
      handle.segment[handle.field] = { x: -direction.x * length, y: -direction.y * length }
    }
    network.vertices[vertex] = { ...network.vertices[vertex], handleMirroring: 'ANGLE' }
  }
}

/**
 * Figma's Delete and heal selection: each chosen point goes and the curves on either side become
 * one that keeps the shape as near as it can, so the path stays whole.
 */
export function healVertices(
  network: VectorNetwork,
  indices: readonly number[]
): VectorNetwork | null {
  const sorted = [...new Set(indices)].sort((a, b) => b - a)
  let next: VectorNetwork = network
  let changed = false
  for (const index of sorted) {
    if (index < 0 || index >= next.vertices.length) continue
    const around = next.segments.filter((s) => s.start === index || s.end === index)
    const healed = removeVertex(next, index)
    if (!healed) break
    // Between two straight segments the healed one is straight too, not a curve along the chord.
    if (around.length === 2 && around.every(isLineSegment)) {
      const [a, b] = around.map((s) => {
        const other = s.start === index ? s.end : s.start
        return other > index ? other - 1 : other
      })
      for (const segment of healed.segments) {
        if (
          (segment.start === a && segment.end === b) ||
          (segment.start === b && segment.end === a)
        ) {
          segment.tangentStart = { x: 0, y: 0 }
          segment.tangentEnd = { x: 0, y: 0 }
        }
      }
    }
    next = healed
    changed = true
  }
  return changed ? next : null
}
