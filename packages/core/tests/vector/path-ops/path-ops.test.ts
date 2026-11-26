import { describe, expect, test } from 'bun:test'

import type { VectorNetwork } from '@kalka/scene-graph'
import type { Vector } from '@kalka/scene-graph/primitives'

import {
  findChains,
  fitCubics,
  healVertices,
  joinVertices,
  reversePathDirection,
  simplifyVectorNetwork
} from '#core/vector'
import { evalCubic, nearestPointOnNetwork } from '#core/vector/bezier'

const zero = { x: 0, y: 0 }

function polyline(points: [number, number][], closed = false): VectorNetwork {
  const vertices = points.map(([x, y]) => ({ x, y }))
  const segments = points.slice(0, closed ? undefined : -1).map((_, i) => ({
    start: i,
    end: (i + 1) % points.length,
    tangentStart: zero,
    tangentEnd: zero
  }))
  return {
    vertices,
    segments,
    regions: closed ? [{ windingRule: 'NONZERO', loops: [segments.map((_, i) => i)] }] : []
  }
}

/** A circle drawn as many short straight segments. */
function densePolygon(count: number, radius: number): VectorNetwork {
  const points: [number, number][] = []
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2
    points.push([radius + radius * Math.cos(a), radius + radius * Math.sin(a)])
  }
  return polyline(points, true)
}

function maxDistanceFrom(network: VectorNetwork, points: Vector[]): number {
  return Math.max(
    ...points.map((p) => nearestPointOnNetwork(p.x, p.y, network, 1000)?.distance ?? Infinity)
  )
}

describe('fitCubics', () => {
  test('fits a quarter circle with one curve within tolerance', () => {
    const points = Array.from({ length: 40 }, (_, i) => {
      const a = (i / 39) * (Math.PI / 2)
      return { x: 100 * Math.cos(a), y: 100 * Math.sin(a) }
    })
    const curves = fitCubics(points, { tolerance: 0.5 })
    expect(curves.length).toBe(1)
    for (const p of points) {
      let best = Infinity
      for (let s = 0; s <= 200; s++) {
        const c = curves[0]
        const q = evalCubic(
          c.p0.x,
          c.p0.y,
          c.cp1.x,
          c.cp1.y,
          c.cp2.x,
          c.cp2.y,
          c.p3.x,
          c.p3.y,
          s / 200
        )
        best = Math.min(best, Math.hypot(q.x - p.x, q.y - p.y))
      }
      expect(best).toBeLessThan(0.6)
    }
  })

  test('splits a wavy run into several curves', () => {
    const points = Array.from({ length: 120 }, (_, i) => ({ x: i * 2, y: 30 * Math.sin(i / 8) }))
    expect(fitCubics(points, { tolerance: 0.5 }).length).toBeGreaterThan(2)
  })
})

describe('simplifyVectorNetwork', () => {
  test('refits a dense polygon with far fewer points and keeps its fill', () => {
    const dense = densePolygon(96, 50)
    const simple = simplifyVectorNetwork(dense, 0.5)
    expect(simple.vertices.length).toBeLessThan(12)
    expect(simple.regions).toHaveLength(1)
    expect(simple.regions[0].loops[0]).toHaveLength(simple.segments.length)
    expect(maxDistanceFrom(simple, dense.vertices)).toBeLessThan(0.75)
    expect(findChains(simple).every((chain) => chain.closed)).toBe(true)
  })

  test('keeps corners and leaves a plain rectangle alone', () => {
    const rectangle = polyline(
      [
        [0, 0],
        [100, 0],
        [100, 50],
        [0, 50]
      ],
      true
    )
    expect(simplifyVectorNetwork(rectangle)).toBe(rectangle)
  })

  test('drops points along a straight run and keeps it straight', () => {
    const line = polyline([
      [0, 0],
      [10, 0],
      [20, 0],
      [30, 0],
      [40, 0]
    ])
    const simple = simplifyVectorNetwork(line, 0.5)
    expect(simple.vertices).toHaveLength(2)
    expect(simple.segments).toHaveLength(1)
    expect(simple.segments[0].tangentStart).toEqual(zero)
  })
})

describe('reversePathDirection', () => {
  test('runs the path from its other end without moving it', () => {
    const path = polyline([
      [0, 0],
      [10, 0],
      [10, 10]
    ])
    const reversed = reversePathDirection(path)
    expect(reversed.segments[0]).toMatchObject({ start: 2, end: 1 })
    expect(reversed.segments[1]).toMatchObject({ start: 1, end: 0 })
    expect(reversePathDirection(reversed)).toEqual(path)
  })

  test('keeps loops pointing at the right segments', () => {
    const square = polyline(
      [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10]
      ],
      true
    )
    const reversed = reversePathDirection(square)
    expect(reversed.regions[0].loops[0]).toEqual([0, 1, 2, 3])
    expect(reversed.segments[0]).toMatchObject({ start: 0, end: 3 })
  })
})

describe('joinVertices', () => {
  const open = polyline([
    [0, 0],
    [10, 0],
    [10, 10]
  ])

  test('closes a path between its ends and fills it', () => {
    const joined = joinVertices(open, [0, 2])
    expect(joined?.network.segments).toHaveLength(3)
    expect(joined?.network.regions).toHaveLength(1)
    expect(joined?.network.regions[0].loops[0]).toHaveLength(3)
  })

  test('merges ends that sit on each other', () => {
    const touching = polyline([
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 0]
    ])
    const joined = joinVertices(touching, [0, 3])
    expect(joined?.network.vertices).toHaveLength(3)
    expect(joined?.network.segments).toHaveLength(3)
    expect(joined?.vertices).toEqual([0])
  })

  test('a smooth join leaves each end along its curve', () => {
    const joined = joinVertices(open, [0, 2], { smooth: true })
    const added = joined?.network.segments[2]
    // The first point is reached from x = 10 heading left, so the join leaves it heading left.
    expect(added?.tangentStart.x).toBeLessThan(0)
    expect(added?.tangentStart.y).toBeCloseTo(0)
    // The last point is reached heading down, so the join leaves it heading down.
    expect(added?.tangentEnd.y).toBeGreaterThan(0)
  })

  test('pairs the nearest free ends of separate paths', () => {
    const two: VectorNetwork = {
      vertices: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 12, y: 0 },
        { x: 22, y: 0 }
      ],
      segments: [
        { start: 0, end: 1, tangentStart: zero, tangentEnd: zero },
        { start: 2, end: 3, tangentStart: zero, tangentEnd: zero }
      ],
      regions: []
    }
    const joined = joinVertices(two, [0, 1, 2, 3])
    expect(joined?.network.segments).toHaveLength(4)
    expect(joined?.network.segments[2]).toMatchObject({ start: 1, end: 2 })
  })
})

describe('healVertices', () => {
  test('removes points and keeps the path whole', () => {
    const path = polyline([
      [0, 0],
      [10, 0],
      [20, 0],
      [30, 0]
    ])
    const healed = healVertices(path, [1, 2])
    expect(healed?.vertices).toHaveLength(2)
    expect(healed?.segments).toEqual([{ start: 0, end: 1, tangentStart: zero, tangentEnd: zero }])
  })
})
