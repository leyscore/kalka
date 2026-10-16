import valueParser, { type FunctionNode, type Node } from 'postcss-value-parser'

import { TRANSPARENT } from '../constants'
import { parseCSSColor } from '../css'
import type { Fill, GradientStop } from '../types'

/** `to <side>` directions as CSS angles: 0deg points up, 90deg right. */
const SIDE_ANGLES: Record<string, number> = { top: 0, right: 90, bottom: 180, left: 270 }

/** The first `linear-gradient()` of a background, as written or as the browser computed it. */
function firstLinearGradient(value: string): FunctionNode | null {
  for (const node of valueParser(value).nodes) {
    if (node.type === 'function' && /^(?:-webkit-)?linear-gradient$/i.test(node.value)) return node
  }
  return null
}

/** The comma separated arguments of a function, each as its nodes. */
function argumentsOf(node: FunctionNode): Node[][] {
  const groups: Node[][] = [[]]
  for (const child of node.nodes) {
    if (child.type === 'div' && child.value === ',') groups.push([])
    else if (child.type !== 'space' && child.type !== 'comment')
      groups[groups.length - 1].push(child)
  }
  return groups.filter((group) => group.length > 0)
}

/**
 * The CSS angle of a direction argument, or null when the argument is a color stop. A corner
 * (`to top right`) points across the box so its middle line joins the other two corners.
 */
function directionAngle(group: Node[], width: number, height: number): number | null {
  const words = group.map((node) => node.value.toLowerCase())
  const unit = group.length === 1 ? valueParser.unit(words[0]) : false
  if (unit) {
    const amount = Number(unit.number)
    if (unit.unit === 'deg') return amount
    if (unit.unit === 'turn') return amount * 360
    if (unit.unit === 'rad') return (amount * 180) / Math.PI
    if (unit.unit === 'grad') return amount * 0.9
    return null
  }
  if (words[0] !== 'to') return null
  const sides = words.slice(1)
  const vertical = sides.find((side) => side === 'top' || side === 'bottom')
  const horizontal = sides.find((side) => side === 'left' || side === 'right')
  if (!vertical || !horizontal) return SIDE_ANGLES[sides[0]] ?? null
  const across = (Math.atan2(height, width) * 180) / Math.PI
  if (vertical === 'top') return horizontal === 'right' ? across : 360 - across
  return horizontal === 'right' ? 180 - across : 180 + across
}

/** A color stop: its color and, when given, its position along the line (0 to 1). */
function colorStop(
  group: Node[]
): { color: GradientStop['color']; position: number | null } | null {
  const color = parseCSSColor(valueParser.stringify(group[0])) ?? transparentFor(group[0])
  if (!color) return null
  const unit = group[1] ? valueParser.unit(group[1].value) : false
  const position = unit && unit.unit === '%' ? Number(unit.number) / 100 : null
  return { color, position }
}

function transparentFor(node: Node): GradientStop['color'] | null {
  return node.value.toLowerCase() === 'transparent' ? { ...TRANSPARENT } : null
}

/** Stops without a position spread evenly between the ones that have one, as CSS places them. */
function placeStops(
  stops: { color: GradientStop['color']; position: number | null }[]
): GradientStop[] {
  const positions = stops.map((stop) => stop.position)
  positions[0] ??= 0
  positions[positions.length - 1] ??= 1
  for (let index = 1; index < positions.length; index++) {
    if (positions[index] !== null) continue
    const next = positions.findIndex((value, at) => at > index && value !== null)
    const before = positions[index - 1] ?? 0
    const after = positions[next] ?? 1
    const step = (after - before) / (next - index + 1)
    for (let at = index; at < next; at++) positions[at] = before + step * (at - index + 1)
  }
  return stops.map((stop, index) => ({ color: stop.color, position: positions[index] ?? 0 }))
}

/**
 * A layer fill for a CSS `linear-gradient()` on a box of this size, the inverse of the export:
 * the gradient line runs through the middle of the box at the CSS angle, long enough to reach its
 * corners, and the fill's transform maps that line onto the layer's unit square.
 */
export function linearGradientFill(
  value: string | undefined,
  width: number,
  height: number
): Fill | null {
  const gradient = value ? firstLinearGradient(value) : null
  if (!gradient || width <= 0 || height <= 0) return null
  const groups = argumentsOf(gradient)
  const angle = groups[0] ? directionAngle(groups[0], width, height) : null
  const stopGroups = angle === null ? groups : groups.slice(1)
  const parsed = stopGroups.map(colorStop)
  if (parsed.length < 2 || parsed.some((stop) => stop === null)) return null
  const stops = placeStops(parsed.filter((stop) => stop !== null))
  const radians = (((angle ?? 180) % 360) * Math.PI) / 180
  const ux = Math.sin(radians)
  const uy = -Math.cos(radians)
  const length = Math.abs(width * ux) + Math.abs(height * uy)
  const start = { x: width / 2 - (ux * length) / 2, y: height / 2 - (uy * length) / 2 }
  const along = { x: ux * length, y: uy * length }
  return {
    type: 'GRADIENT_LINEAR',
    color: stops[0].color,
    opacity: 1,
    visible: true,
    gradientStops: stops,
    gradientTransform: {
      m00: along.x / width,
      m01: -along.y / width,
      m02: start.x / width,
      m10: along.y / height,
      m11: along.x / height,
      m12: start.y / height
    }
  }
}
