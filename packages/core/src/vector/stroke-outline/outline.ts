import type { StrokeCap, StrokeJoin } from '@kalka/scene-graph'
import type { Vector } from '@kalka/scene-graph/primitives'

import { tangentAt, type Centerline } from './centerline'
import type { SideWidths } from './width'

/** A closed polygon as flat x, y pairs. */
export type OutlinePolygon = number[]

const ROUND_STEPS = 12

/** Twice the signed area of a polygon; positive is clockwise on a y-down canvas. */
function signedArea(polygon: OutlinePolygon): number {
  let area = 0
  const n = polygon.length / 2
  for (let index = 0; index < n; index++) {
    const next = (index + 1) % n
    area += polygon[index * 2] * polygon[next * 2 + 1] - polygon[next * 2] * polygon[index * 2 + 1]
  }
  return area
}

/**
 * Every polygon turned the same way, so where they overlap the nonzero rule fills them as one
 * shape instead of cutting holes.
 */
export function orient(polygon: OutlinePolygon): OutlinePolygon {
  if (polygon.length < 6 || signedArea(polygon) >= 0) return polygon
  const reversed: OutlinePolygon = []
  for (let index = polygon.length - 2; index >= 0; index -= 2) {
    reversed.push(polygon[index], polygon[index + 1])
  }
  return reversed
}

/** Points of an arc around (cx, cy) from one angle to another, the end left out. */
function arcPoints(
  cx: number,
  cy: number,
  radius: number,
  from: number,
  sweep: number,
  out: number[]
): void {
  for (let step = 1; step < ROUND_STEPS; step++) {
    const angle = from + (sweep * step) / ROUND_STEPS
    out.push(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius)
  }
}

function circle(cx: number, cy: number, radius: number): OutlinePolygon {
  const points: OutlinePolygon = []
  for (let step = 0; step < ROUND_STEPS * 2; step++) {
    const angle = (Math.PI * step) / ROUND_STEPS
    points.push(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius)
  }
  return points
}

/** The end of a stretch: its point, tangent and the stroke's edges there. */
interface Edge {
  x: number
  y: number
  tx: number
  ty: number
  left: Vector
  right: Vector
  widths: SideWidths
}

function edgeAt(
  line: Centerline,
  index: number,
  from: number,
  to: number,
  widths: SideWidths
): Edge {
  const tangent = tangentAt(line, index, from, to)
  const x = line.xs[index]
  const y = line.ys[index]
  // Left of the path looking along it, on a y-down canvas.
  const nx = tangent.y
  const ny = -tangent.x
  return {
    x,
    y,
    tx: tangent.x,
    ty: tangent.y,
    left: { x: x + nx * widths.ascent, y: y + ny * widths.ascent },
    right: { x: x - nx * widths.descent, y: y - ny * widths.descent },
    widths
  }
}

/** Adds the cap at a stretch's end, going from its left edge round to its right. */
function capPoints(edge: Edge, cap: StrokeCap, atStart: boolean, out: number[]): void {
  const sign = atStart ? -1 : 1
  if (cap === 'ROUND') {
    const radius = (edge.widths.ascent + edge.widths.descent) / 2
    const cx = (edge.left.x + edge.right.x) / 2
    const cy = (edge.left.y + edge.right.y) / 2
    const from = atStart
      ? Math.atan2(edge.right.y - cy, edge.right.x - cx)
      : Math.atan2(edge.left.y - cy, edge.left.x - cx)
    // A half turn from one edge round the end to the other (clockwise on a y-down canvas).
    arcPoints(cx, cy, radius, from, Math.PI, out)
    return
  }
  if (cap === 'SQUARE') {
    const reach = (edge.widths.ascent + edge.widths.descent) / 2
    const dx = edge.tx * reach * sign
    const dy = edge.ty * reach * sign
    if (atStart) out.push(edge.right.x + dx, edge.right.y + dy, edge.left.x + dx, edge.left.y + dy)
    else out.push(edge.left.x + dx, edge.left.y + dy, edge.right.x + dx, edge.right.y + dy)
  }
}

/** Fills the gap where two stretches meet at a corner. */
function joinPolygons(
  incoming: Edge,
  outgoing: Edge,
  join: StrokeJoin,
  miterLimit: number
): OutlinePolygon[] {
  const radius = Math.max(incoming.widths.ascent, incoming.widths.descent)
  if (join === 'ROUND') return [circle(incoming.x, incoming.y, radius)]
  const polygons: OutlinePolygon[] = [
    [incoming.x, incoming.y, incoming.left.x, incoming.left.y, outgoing.left.x, outgoing.left.y],
    [incoming.x, incoming.y, incoming.right.x, incoming.right.y, outgoing.right.x, outgoing.right.y]
  ]
  if (join !== 'MITER') return polygons
  // The outer side is the left one when the path turns right (clockwise on a y-down canvas).
  const turn = incoming.tx * outgoing.ty - incoming.ty * outgoing.tx
  const outer = turn > 0 ? 'left' : 'right'
  const a = incoming[outer]
  const b = outgoing[outer]
  const denominator = incoming.tx * outgoing.ty - incoming.ty * outgoing.tx
  if (Math.abs(denominator) < 1e-9) return polygons
  const k = ((b.x - a.x) * outgoing.ty - (b.y - a.y) * outgoing.tx) / denominator
  const tip = { x: a.x + incoming.tx * k, y: a.y + incoming.ty * k }
  const halfWidth = Math.max(radius, 1e-6)
  if (Math.hypot(tip.x - incoming.x, tip.y - incoming.y) / halfWidth > miterLimit) return polygons
  polygons.push([incoming.x, incoming.y, a.x, a.y, tip.x, tip.y, b.x, b.y])
  return polygons
}

export interface OutlineStyle {
  cap: StrokeCap
  join: StrokeJoin
  miterLimit: number
}

/**
 * A centerline's stroke as filled polygons, `widths(at)` giving how far it reaches on each side
 * at each arc length: a polygon per smooth stretch, its caps at an open path's ends, and joins
 * where it turns sharply.
 */
export function outlineCenterline(
  line: Centerline,
  widths: (at: number) => SideWidths,
  style: OutlineStyle
): OutlinePolygon[] {
  const last = line.xs.length - 1
  const breaks = [0, ...line.corners.filter((index) => index > 0 && index < last), last]
  const polygons: OutlinePolygon[] = []
  const stretchEnds: Array<{ start: Edge; end: Edge }> = []
  for (let k = 0; k < breaks.length - 1; k++) {
    const from = breaks[k]
    const to = breaks[k + 1]
    if (to <= from) continue
    const lefts: number[] = []
    const rights: number[] = []
    let startEdge: Edge | null = null
    let endEdge: Edge | null = null
    for (let index = from; index <= to; index++) {
      const edge = edgeAt(line, index, from, to, widths(line.s[index]))
      if (index === from) startEdge = edge
      if (index === to) endEdge = edge
      lefts.push(edge.left.x, edge.left.y)
      rights.push(edge.right.x, edge.right.y)
    }
    if (!startEdge || !endEdge) continue
    const polygon = [...lefts]
    if (!line.closed && to === last) capPoints(endEdge, style.cap, false, polygon)
    for (let index = rights.length - 2; index >= 0; index -= 2) {
      polygon.push(rights[index], rights[index + 1])
    }
    if (!line.closed && from === 0) capPoints(startEdge, style.cap, true, polygon)
    polygons.push(polygon)
    stretchEnds.push({ start: startEdge, end: endEdge })
  }
  for (let k = 0; k < stretchEnds.length - 1; k++) {
    polygons.push(
      ...joinPolygons(stretchEnds[k].end, stretchEnds[k + 1].start, style.join, style.miterLimit)
    )
  }
  const first = stretchEnds.at(0)
  const final = stretchEnds.at(-1)
  if (line.closed && first && final && line.corners.includes(0)) {
    polygons.push(...joinPolygons(final.end, first.start, style.join, style.miterLimit))
  }
  return polygons.map(orient)
}

/** Polygons as SVG path data. */
export function polygonsToSVGPath(polygons: readonly OutlinePolygon[]): string {
  const round = (value: number) => Math.round(value * 100) / 100
  return polygons
    .filter((polygon) => polygon.length >= 6)
    .map((polygon) => {
      const parts = [`M${round(polygon[0])} ${round(polygon[1])}`]
      for (let index = 2; index < polygon.length; index += 2) {
        parts.push(`L${round(polygon[index])} ${round(polygon[index + 1])}`)
      }
      return `${parts.join('')}Z`
    })
    .join('')
}
