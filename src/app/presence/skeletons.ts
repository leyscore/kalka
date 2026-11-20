import type { SceneGraph } from '@kalka/scene-graph'
import { readableForeground } from '@kalka/scene-graph/color'
import type { Color } from '@kalka/scene-graph/primitives'

/**
 * A skeleton where an agent's work is loading: a cloud of pixel dots that twinkles over a layer
 * an edit reveals, until it fades as the layer's content fades in.
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
}

/** How long a skeleton takes to show, and to leave as its content appears. */
export const SKELETON_SHOW_MS = 120
export const SKELETON_EXIT_MS = 320

/** Whether `skeleton` still shows at `now`, or will: not finished fading. */
export function skeletonLive(skeleton: AgentSkeleton, now: number): boolean {
  return now < skeleton.until + skeleton.fade
}

/** How visible a skeleton is at `now`, from 0 to 1. */
export function skeletonOpacity(skeleton: AgentSkeleton, now: number): number {
  if (now < skeleton.from) return 0
  const shown = Math.min(1, (now - skeleton.from) / SKELETON_SHOW_MS)
  if (now < skeleton.until) return shown
  const faded = skeleton.fade > 0 ? (now - skeleton.until) / skeleton.fade : 1
  return Math.max(0, Math.min(shown, 1 - faded))
}

/** Whether a skeleton sits on a light backdrop or a dark one, for which dots read on it. */
export type SkeletonTone = 'light' | 'dark'

/** The tone of a color as a backdrop: dark when white text reads best on it. */
export function toneOf(color: Color): SkeletonTone {
  return readableForeground(color).r > 0.5 ? 'dark' : 'light'
}

/**
 * The tone of what a layer's skeleton sits on: the nearest layer holding it that paints a solid
 * fill, which painter's order has already shown, or else the canvas.
 */
export function backdropTone(graph: SceneGraph, nodeId: string, canvas: Color): SkeletonTone {
  let id = graph.getNode(nodeId)?.parentId
  while (id) {
    const holder = graph.getNode(id)
    if (!holder || holder.type === 'CANVAS') break
    const fill = holder.fills.findLast((paint) => paint.visible && paint.opacity > 0)
    if (fill) return fill.type === 'SOLID' ? toneOf(fill.color) : 'light'
    id = holder.parentId
  }
  return toneOf(canvas)
}

/** The cloud's dot grid, which twinkling patches sit on. */
export const SKELETON_GRID = 9
/** One twinkling patch for about this much area, in screen pixels. */
const AREA_PER_SPARK = 5000
const MIN_SPARKS = 2
const MAX_SPARKS = 24

/** A patch of the cloud that twinkles, in pixels from the skeleton's top-left corner. */
export interface SkeletonSpark {
  left: number
  top: number
  width: number
  height: number
  /** Seconds one twinkle takes, and how far into it the patch starts. */
  duration: number
  delay: number
}

/** A fixed sequence in 0–1 for `key`, so a block twinkles the same way however often it draws. */
function sequence(key: string): () => number {
  let seed = 7
  for (const char of key) seed = (seed * 31 + char.charCodeAt(0)) % 2147483648
  return () => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return seed / 2147483648
  }
}

/**
 * Where a skeleton of `width` × `height` twinkles: a few patches of one to three dots by one or
 * two, on the dot grid within the middle of the block, each at its own pace.
 */
export function skeletonSparks(key: string, width: number, height: number): SkeletonSpark[] {
  const next = sequence(key)
  const count = Math.min(
    MAX_SPARKS,
    Math.max(MIN_SPARKS, Math.round((width * height) / AREA_PER_SPARK))
  )
  const cells = (span: number) => Math.max(0, Math.floor((span * 0.6) / SKELETON_GRID))
  return Array.from({ length: count }, () => {
    const columns = 1 + Math.floor(next() * 3)
    const rows = 1 + Math.floor(next() * 2)
    const left = Math.floor((width * 0.2) / SKELETON_GRID) + Math.floor(next() * cells(width))
    const top = Math.floor((height * 0.2) / SKELETON_GRID) + Math.floor(next() * cells(height))
    return {
      left: left * SKELETON_GRID,
      top: top * SKELETON_GRID,
      width: columns * SKELETON_GRID,
      height: rows * SKELETON_GRID,
      duration: Number((1.2 + next() * 1.4).toFixed(2)),
      delay: -Number((next() * 2).toFixed(2))
    }
  })
}
