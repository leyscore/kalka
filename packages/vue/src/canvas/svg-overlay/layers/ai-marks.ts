import {
  AI_ACTIVE_COLOR,
  AI_DONE_COLOR,
  AI_DONE_DURATION_MS,
  AI_PULSE_PERIOD_MS
} from '@kalka/core/constants'

import { highlightRing, type Flash } from '#vue/canvas/svg-overlay/layers/flashes'
import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import { css, type OverlayShape } from '#vue/canvas/svg-overlay/shapes'

/** What an agent is doing: layers it works on pulse, layers it finished glow once. */
export interface AIMarks {
  active: Iterable<string>
  done: readonly Flash[]
  /** The system asks for reduced motion: marks hold steady instead of pulsing and fading. */
  still?: boolean
}

/** The ring of a mark that holds steady, at the middle of the pulse's range. */
const STILL_ACTIVE_ALPHA = 0.55

/** The AI activity marks at `now`, on the `performance.now()` clock, as the Skia pass drew them. */
export function aiMarksLayer(context: OverlayContext, marks: AIMarks, now: number): OverlayShape[] {
  const shapes: OverlayShape[] = []
  const phase = (now % AI_PULSE_PERIOD_MS) / AI_PULSE_PERIOD_MS
  const pulse = marks.still
    ? STILL_ACTIVE_ALPHA
    : 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(phase * Math.PI * 2))
  for (const nodeId of marks.active)
    shapes.push(...highlightRing(context, nodeId, css({ ...AI_ACTIVE_COLOR, a: 1 }, pulse)))
  // Backwards, as the Skia loop walks the list.
  for (let i = marks.done.length - 1; i >= 0; i--) {
    const flash = marks.done[i]
    const elapsed = now - flash.startTime
    if (elapsed > AI_DONE_DURATION_MS) continue
    const opacity = marks.still ? 1 : glowOpacity(elapsed / AI_DONE_DURATION_MS)
    shapes.push(...highlightRing(context, flash.nodeId, css({ ...AI_DONE_COLOR, a: 1 }, opacity)))
  }
  return shapes
}

/** A finished layer's glow over its life `t` in 0–1: it rises over the first 30%, then fades. */
function glowOpacity(t: number): number {
  return t < 0.3 ? t / 0.3 : 1 - (t - 0.3) / 0.7
}
