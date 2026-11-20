import type { Color } from '@kalka/scene-graph/primitives'

/**
 * A skeleton where an agent's work is loading: a block of white glass with a shine passing over
 * it, covering a layer an edit reveals, until it fades as the layer's content fades in.
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
export const SKELETON_SHOW_MS = 120

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
