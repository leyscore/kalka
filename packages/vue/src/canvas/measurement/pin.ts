import { computeMeasurementSegments, type MeasurementSegment } from '@kalka/core/canvas'
import type { Editor } from '@kalka/core/editor'
import type { CommentMeasurement, MeasurementSide } from '@kalka/scene-graph'
import { getAxisAlignedWorldBounds } from '@kalka/scene-graph/coordinate'
import type { Rect } from '@kalka/scene-graph/primitives'

/** How far, in screen pixels, the pointer moves before an Alt-press is a drag, not a pin. */
const DRAG_THRESHOLD = 3

const EPSILON = 0.01

const SIDES: Record<MeasurementSegment['axis'], readonly MeasurementSide[]> = {
  x: ['left', 'right'],
  y: ['top', 'bottom']
}

function edge(box: Rect, side: MeasurementSide): number {
  if (side === 'left') return box.x
  if (side === 'right') return box.x + box.width
  if (side === 'top') return box.y
  return box.y + box.height
}

/**
 * The measurement a drawn segment shows, as a pinned measurement stores it: the side of the first
 * layer the segment starts from and whether it ends on the same side of the second. Null when the
 * segment does not run between their sides.
 */
export function segmentMeasurement(
  from: Rect,
  to: Rect,
  toNodeId: string,
  segment: MeasurementSegment
): CommentMeasurement | null {
  const ends = [segment.from, segment.to]
  const near = (a: number, b: number) => Math.abs(a - b) < EPSILON
  for (const side of SIDES[segment.axis]) {
    for (const target of SIDES[segment.axis]) {
      const a = edge(from, side)
      const b = edge(to, target)
      const matches =
        (near(a, ends[0]) && near(b, ends[1])) || (near(a, ends[1]) && near(b, ends[0]))
      if (matches) return { toNodeId, side, toSameSide: side === target }
    }
  }
  return null
}

/** The distance, in world units, from a point to the line a segment draws. */
function distanceToSegment(segment: MeasurementSegment, x: number, y: number): number {
  const low = Math.min(segment.from, segment.to)
  const high = Math.max(segment.from, segment.to)
  const along = segment.axis === 'x' ? x : y
  const across = segment.axis === 'x' ? y : x
  const outside = Math.max(low - along, along - high, 0)
  return Math.hypot(outside, across - segment.cross)
}

/**
 * The measurement an Alt-click pins: from the one selected layer to the hovered one, the drawn
 * segment nearest the pointer. Null when nothing is being measured.
 */
export function pickPinnedMeasurement(
  editor: Editor,
  cx: number,
  cy: number
): { from: string; measurement: CommentMeasurement } | null {
  const { state, graph } = editor
  const targetId = state.hoveredNodeId
  if (state.measurementMode === 'off' || !targetId || state.selectedIds.size !== 1) return null
  const [fromId] = state.selectedIds
  const fromNode = fromId ? graph.getNode(fromId) : undefined
  const target = graph.getNode(targetId)
  if (!fromId || !fromNode || !target || fromId === targetId) return null
  const from = getAxisAlignedWorldBounds(fromNode, graph)
  const to = getAxisAlignedWorldBounds(target, graph)
  let best: { segment: MeasurementSegment; distance: number } | null = null
  for (const segment of computeMeasurementSegments(from, to)) {
    const distance = distanceToSegment(segment, cx, cy)
    if (!best || distance < best.distance) best = { segment, distance }
  }
  if (!best) return null
  const measurement = segmentMeasurement(from, to, targetId, best.segment)
  return measurement ? { from: fromId, measurement } : null
}

type PinnedMeasurement = { from: string; measurement: CommentMeasurement }

/**
 * Pins a measurement where it is read, as Figma keeps a measurement on the canvas: with a layer
 * selected and Alt held over another, a click keeps the distance drawn nearest the pointer. The
 * press waits for its release, so an Alt-drag still duplicates: once the pointer moves, `move`
 * hands the press back to start as usual.
 */
export function createMeasurementPin<Press extends { button: number }>(
  editor: Editor,
  getCoords: (e: Press) => { sx: number; sy: number; cx: number; cy: number },
  onPin: (from: string, measurement: CommentMeasurement) => boolean
) {
  let pending: { event: Press; sx: number; sy: number; pin: PinnedMeasurement } | null = null

  return {
    /** Holds an Alt-press over a measured layer; true when the press waits for its release. */
    press(e: Press): boolean {
      pending = null
      if (e.button !== 0 || editor.state.viewOnly) return false
      const { sx, sy, cx, cy } = getCoords(e)
      const pin = pickPinnedMeasurement(editor, cx, cy)
      if (!pin) return false
      pending = { event: e, sx, sy, pin }
      return true
    },
    /** The held press to start as usual once the pointer has moved, as a drag. */
    move(e: Press): Press | null {
      if (!pending) return null
      const { sx, sy } = getCoords(e)
      if (Math.hypot(sx - pending.sx, sy - pending.sy) < DRAG_THRESHOLD) return null
      const { event } = pending
      pending = null
      return event
    },
    /** Pins the held press's measurement; true when there was one. */
    release(): boolean {
      if (!pending) return false
      const { pin } = pending
      pending = null
      onPin(pin.from, pin.measurement)
      return true
    },
    cancel() {
      pending = null
    }
  }
}
