import type { StrokeBrush, StrokeBrushType } from '@kalka/scene-graph'

import { pointAtLength, type Centerline } from './centerline'
import { orient, type OutlinePolygon } from './outline'

/**
 * Kalka's own brushes, drawn here in code (Figma's brush artwork is its own). A stretch brush is
 * shapes in a unit band, `u` 0–1 along the path and `v` -0.5–0.5 across it, bent along each
 * subpath; a scatter brush is one shape about the origin, a stroke weight wide, dropped along it.
 */
type Shape = Array<readonly [number, number]>

const TAU = Math.PI * 2
const BAND_STEPS = 160

/** A closed band in u from its top edge going right and its bottom edge coming back. */
function band(top: (u: number) => number, bottom: (u: number) => number, from = 0, to = 1): Shape {
  const shape: Array<readonly [number, number]> = []
  for (let step = 0; step <= BAND_STEPS; step++) {
    const u = from + ((to - from) * step) / BAND_STEPS
    shape.push([u, -top(u)])
  }
  for (let step = BAND_STEPS; step >= 0; step--) {
    const u = from + ((to - from) * step) / BAND_STEPS
    shape.push([u, bottom(u)])
  }
  return shape
}

/** Rises from nothing at both ends of a stroke. */
function envelope(u: number, head: number, tail: number): number {
  return Math.sqrt(Math.max(0, Math.min(1, u / head, (1 - u) / tail)))
}

const STRETCH_SHAPES: Record<string, () => Shape[]> = {
  /** A broad nib: full in the middle, thinning to points, fuller on one side. */
  calligraphy: () => [
    band(
      (u) => 0.5 * Math.sin(Math.PI * u) ** 0.45,
      (u) => 0.5 * Math.sin(Math.PI * u) ** 0.9 * (0.65 + 0.35 * u)
    )
  ],
  /** A wet stroke whose edges swell and pull back unevenly. */
  ink: () => [
    band(
      (u) => 0.5 * envelope(u, 0.05, 0.14) * (0.78 + 0.22 * Math.sin(TAU * (3.3 * u + 0.1))),
      (u) => 0.5 * envelope(u, 0.05, 0.14) * (0.82 + 0.18 * Math.sin(TAU * (5.1 * u + 0.4)))
    )
  ],
  /** A flat ribbon twisting edge-on three times. */
  ribbon: () => [
    band(
      (u) => 0.5 * (0.12 + 0.88 * Math.abs(Math.cos(Math.PI * 3 * u))),
      (u) => 0.5 * (0.12 + 0.88 * Math.abs(Math.cos(Math.PI * 3 * u)))
    )
  ],
  /** Five thin strands side by side, each starting and ending a little apart. */
  strands: () =>
    [-0.4, -0.2, 0, 0.2, 0.4].map((offset, index) => {
      const from = 0.02 * ((index * 3) % 5)
      const to = 1 - 0.025 * ((index * 2) % 5)
      const thickness = 0.05 + 0.02 * ((index * 7) % 3)
      const span = to - from
      const local = (u: number) => envelope((u - from) / span, 0.08, 0.08)
      return band(
        (u) => -offset + thickness * local(u),
        (u) => offset + thickness * local(u),
        from,
        to
      )
    })
}

function circleShape(radius: number, points = 20): Shape {
  return Array.from({ length: points }, (_, index) => {
    const angle = (TAU * index) / points
    return [Math.cos(angle) * radius, Math.sin(angle) * radius] as const
  })
}

const SCATTER_SHAPES: Record<string, () => Shape[]> = {
  dots: () => [circleShape(0.5)],
  stars: () => [
    Array.from({ length: 10 }, (_, index) => {
      const radius = index % 2 === 0 ? 0.5 : 0.21
      const angle = -Math.PI / 2 + (Math.PI * index) / 5
      return [Math.cos(angle) * radius, Math.sin(angle) * radius] as const
    })
  ],
  /** A leaf along the path: two arcs meeting in points, one side a little fuller. */
  leaves: () => [
    band(
      (u) => 0.22 * Math.sin(Math.PI * u) ** 0.8,
      (u) => 0.16 * Math.sin(Math.PI * u) ** 0.8
    ).map(([u, v]) => [u - 0.5, v] as const)
  ],
  confetti: () => [
    [
      [-0.5, -0.22],
      [0.5, -0.22],
      [0.5, 0.22],
      [-0.5, 0.22]
    ]
  ]
}

/** Each brush Kalka has, by type, in the order its menu lists them. */
export const STROKE_BRUSHES: Record<StrokeBrushType, readonly string[]> = {
  STRETCH: Object.keys(STRETCH_SHAPES),
  SCATTER: Object.keys(SCATTER_SHAPES)
}

/** A brush with the settings it starts with. */
export function defaultStrokeBrush(type: StrokeBrushType, id?: string): StrokeBrush {
  const brushId = id && STROKE_BRUSHES[type].includes(id) ? id : STROKE_BRUSHES[type][0]
  const lively = type === 'SCATTER' && brushId === 'confetti'
  return {
    type,
    id: brushId,
    gap: type === 'SCATTER' ? 1.5 : 0,
    wiggle: lively ? 0.6 : 0,
    sizeJitter: lively ? 0.4 : 0,
    angularJitter: lively ? 1 : 0,
    rotation: 0,
    reverse: false,
    seed: 1
  }
}

/** A brush's shapes; an unknown id draws its type's first brush. */
function brushShapes(brush: StrokeBrush): Shape[] {
  const shapes = brush.type === 'STRETCH' ? STRETCH_SHAPES : SCATTER_SHAPES
  const make = shapes[brush.id] ?? shapes[STROKE_BRUSHES[brush.type][0]]
  return make()
}

/** The same numbers for the same seed, in 0–1 (mulberry32). */
export function seededRandom(seed: number): () => number {
  let state = Math.floor(seed) >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const MAX_SCATTER_COPIES = 5000

/**
 * A stroke drawn with a brush along one centerline. `width(at)` is the stroke's full width at
 * each arc length: its weight, scaled by any width profile.
 */
export function brushPolygons(
  line: Centerline,
  brush: StrokeBrush,
  width: (at: number) => number
): OutlinePolygon[] {
  const shapes = brushShapes(brush)
  if (brush.type === 'STRETCH') {
    return shapes.map((shape) =>
      orient(
        shape.flatMap(([u, v]) => {
          const along = brush.reverse ? 1 - u : u
          const at = along * line.length
          const point = pointAtLength(line, at)
          const across = (brush.reverse ? -v : v) * width(at)
          // The left normal of a y-down canvas is (ty, -tx); v grows to the right.
          return [point.x - point.ty * across, point.y + point.tx * across]
        })
      )
    )
  }
  const polygons: OutlinePolygon[] = []
  const random = seededRandom(brush.seed)
  const firstWidth = Math.max(width(0), 1e-3)
  const spacing = Math.max(0.1, brush.gap) * firstWidth
  let copies = 0
  for (let at = spacing / 2; at <= line.length && copies < MAX_SCATTER_COPIES; copies++) {
    const point = pointAtLength(line, at)
    const size = width(at) * Math.max(0.05, 1 + brush.sizeJitter * (random() * 2 - 1) * 0.6)
    const angle =
      Math.atan2(point.ty, point.tx) +
      (brush.rotation * Math.PI) / 180 +
      brush.angularJitter * Math.PI * (random() * 2 - 1)
    const offset = brush.wiggle * width(at) * (random() * 2 - 1)
    const cx = point.x - point.ty * offset
    const cy = point.y + point.tx * offset
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    for (const shape of shapes) {
      polygons.push(
        orient(
          shape.flatMap(([x, y]) => [
            cx + (x * cos - y * sin) * size,
            cy + (x * sin + y * cos) * size
          ])
        )
      )
    }
    at += Math.max(0.1, brush.gap) * Math.max(width(at), 1e-3)
  }
  return polygons
}
