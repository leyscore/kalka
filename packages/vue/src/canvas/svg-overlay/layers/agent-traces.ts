import { getWorldMatrix } from '@kalka/scene-graph/coordinate'
import Matrix from '@kalka/scene-graph/matrix'
import type { Color } from '@kalka/scene-graph/primitives'

import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import { css, type OverlayShape } from '#vue/canvas/svg-overlay/shapes'

/**
 * A layer an agent's edit reveals: a thin frame marks its box just before its content fades in,
 * holds while it does, then fades, so the build reads as one slot filled at a time.
 */
export interface AgentTrace {
  nodeId: string
  /** The agent's color. */
  color: Color
  /** When the layer's content starts to appear, on the `performance.now()` clock. */
  start: number
  /** How long its content takes to appear. */
  duration: number
}

/** The frame shows this long before the content it frames starts to appear. */
export const TRACE_LEAD_MS = 140
/** How long the frame takes to show. */
const TRACE_SHOW_MS = 90
/** How long a frame takes to fade once its content is in. */
export const TRACE_FADE_MS = 360
/** Frames drawn per frame; an edit reveals no more layers than this at a time. */
export const MAX_DRAWN_TRACES = 32
const TRACE_WIDTH = 1
const TRACE_ALPHA = 0.9

/** Whether `trace` still draws at `now`, or will: not finished fading. */
export function traceLive(trace: AgentTrace, now: number): boolean {
  return now < trace.start + trace.duration + TRACE_FADE_MS
}

/** How opaque a trace's frame is at `now`: 0 before it shows and after it faded. */
export function traceOpacity(trace: AgentTrace, now: number): number {
  const shown = trace.start - TRACE_LEAD_MS
  if (now < shown) return 0
  if (now < shown + TRACE_SHOW_MS) return (now - shown) / TRACE_SHOW_MS
  const settled = trace.start + trace.duration
  if (now <= settled) return 1
  return Math.max(0, 1 - (now - settled) / TRACE_FADE_MS)
}

/** The layer's corners on screen, clockwise from its top-left, through its world matrix. */
function screenCorners(context: OverlayContext, nodeId: string): number[] | null {
  const { graph, view } = context
  const node = graph.getNode(nodeId)
  if (!node) return null
  const corners = Matrix.mapPoints(getWorldMatrix(node, graph), [
    0,
    0,
    node.width,
    0,
    node.width,
    node.height,
    0,
    node.height
  ])
  return Array.from(corners, (value, index) =>
    index % 2 === 0 ? value * view.zoom + view.panX : value * view.zoom + view.panY
  )
}

/**
 * Frames around the layers an agent's edit reveals, in its color: each marks its layer's box
 * as the layer's turn comes, so the build reads one slot at a time, top to bottom.
 */
export function agentTracesLayer(
  context: OverlayContext,
  traces: readonly AgentTrace[],
  now: number
): OverlayShape[] {
  const shapes: OverlayShape[] = []
  for (const trace of traces) {
    if (shapes.length >= MAX_DRAWN_TRACES) break
    const opacity = traceOpacity(trace, now)
    if (opacity <= 0) continue
    const points = screenCorners(context, trace.nodeId)
    if (!points) continue
    shapes.push({
      type: 'polygon',
      points,
      stroke: css(trace.color, TRACE_ALPHA),
      strokeWidth: TRACE_WIDTH,
      opacity
    })
  }
  return shapes
}
