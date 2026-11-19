import { getWorldMatrix } from '@kalka/scene-graph/coordinate'
import Matrix from '@kalka/scene-graph/matrix'
import type { Color, Rect } from '@kalka/scene-graph/primitives'

import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import { css, type OverlayShape, type Paint } from '#vue/canvas/svg-overlay/shapes'

/**
 * A skeleton block where an agent's work is loading: a soft block that breathes over a layer an
 * edit reveals, then fades as the layer's content fades in.
 */
export interface AgentSkeleton {
  /** Replaces the skeleton shown under the same key. */
  key: string
  /** The layer it covers. */
  nodeId: string
  /** When it shows, on the `performance.now()` clock. */
  from: number
  /** When its content starts to appear and it starts to fade. */
  until: number
  /** How long it takes to fade as its content appears. */
  fade: number
  /** The agent's color, for the dashed edge that says it is working there. */
  color?: Color
}

/** How long a skeleton takes to show. */
const SHOW_MS = 120
/** One breath of a skeleton block, from faint to full and back. */
export const BREATH_MS = 1400
/** Skeleton blocks drawn per frame. */
export const MAX_DRAWN_SKELETONS = 48
const FILL: Color = { r: 0.55, g: 0.57, b: 0.62, a: 1 }
const FILL_ALPHA = 0.22
const FILL_BREATH = 0.1
const STILL_ALPHA = 0.26
const MAX_RADIUS = 8
const EDGE_ALPHA = 0.8
const EDGE_DASH: readonly [number, number] = [4, 3]

/** Whether `skeleton` still draws at `now`, or will: not finished fading. */
export function skeletonLive(skeleton: AgentSkeleton, now: number): boolean {
  return now < skeleton.until + skeleton.fade
}

/** How visible a skeleton is at `now`, from 0 to 1, before its breathing. */
export function skeletonOpacity(skeleton: AgentSkeleton, now: number): number {
  if (now < skeleton.from) return 0
  const shown = Math.min(1, (now - skeleton.from) / SHOW_MS)
  if (now < skeleton.until) return shown
  const faded = skeleton.fade > 0 ? (now - skeleton.until) / skeleton.fade : 1
  return Math.max(0, Math.min(shown, 1 - faded))
}

/** The fill's alpha at `now`: it breathes slowly, or holds still when motion is reduced. */
function breath(now: number, still: boolean): number {
  if (still) return STILL_ALPHA
  return FILL_ALPHA + FILL_BREATH * Math.sin(((now % BREATH_MS) / BREATH_MS) * Math.PI * 2)
}

/** The skeleton's box on screen: its layer's bounds through its world matrix. */
function screenBox(context: OverlayContext, nodeId: string): Rect | null {
  const { graph, view } = context
  const node = graph.getNode(nodeId)
  if (!node) return null
  const points = Matrix.mapPoints(getWorldMatrix(node, graph), [
    0,
    0,
    node.width,
    0,
    node.width,
    node.height,
    0,
    node.height
  ])
  const xs = [points[0], points[2], points[4], points[6]].map((x) => x * view.zoom + view.panX)
  const ys = [points[1], points[3], points[5], points[7]].map((y) => y * view.zoom + view.panY)
  const left = Math.min(...xs)
  const top = Math.min(...ys)
  return { x: left, y: top, width: Math.max(...xs) - left, height: Math.max(...ys) - top }
}

/** The dashed edge in the agent's color, when it has one. */
function edge(color: Color | undefined): Pick<Paint, 'stroke' | 'strokeWidth' | 'dash'> {
  if (!color) return {}
  return { stroke: css(color, EDGE_ALPHA), strokeWidth: 1, dash: EDGE_DASH }
}

/**
 * Skeleton blocks where agents' work is loading: soft rounded blocks that breathe in place, edged
 * with dashes in the agent's color, so the canvas shows calmly where content is coming instead
 * of it moving into place.
 */
export function agentSkeletonsLayer(
  context: OverlayContext,
  skeletons: readonly AgentSkeleton[],
  clock: { now: number; still?: boolean }
): OverlayShape[] {
  const shapes: OverlayShape[] = []
  const alpha = breath(clock.now, clock.still ?? false)
  for (const skeleton of skeletons) {
    if (shapes.length >= MAX_DRAWN_SKELETONS) break
    const opacity = skeletonOpacity(skeleton, clock.now)
    if (opacity <= 0) continue
    const box = screenBox(context, skeleton.nodeId)
    if (!box || box.width < 1 || box.height < 1) continue
    shapes.push({
      type: 'rect',
      ...box,
      rx: Math.min(MAX_RADIUS, box.height / 4, box.width / 4),
      fill: css(FILL, alpha),
      ...edge(skeleton.color),
      opacity
    })
  }
  return shapes
}
