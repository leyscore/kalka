import { loaderStep, type AgentWorkMark } from '#vue/canvas/svg-overlay/layers/agent-work'
import type { AIMarks } from '#vue/canvas/svg-overlay/layers/ai-marks'
import type { Flash } from '#vue/canvas/svg-overlay/layers/flashes'

/** The renderer's flash and AI mark state the overlay animates, where a renderer exists. */
interface FlashSource {
  _flashes: readonly Flash[]
  _aiActiveNodes: ReadonlySet<string>
  _aiDoneFlashes: readonly Flash[]
}

/** Everything that animates on the overlay for one frame, and whether the next must draw. */
export interface OverlayMotion {
  flashes: readonly Flash[]
  aiMarks: AIMarks
  /** Something moves every frame: the frame is keyed by the time. */
  animating: boolean
  /**
   * The step of the loaders on busy work marks, which keys the frame, so frames between steps
   * draw nothing; 0 while nothing loads.
   */
  loaderStep: number
  /** Ask for another frame, whether or not this one drew. */
  continues: boolean
}

/** What animates at `now`: flashes, AI marks, and the loaders where agents work. */
export function overlayMotion(
  renderer: FlashSource | null | undefined,
  work: readonly AgentWorkMark[],
  still: boolean,
  now: number
): OverlayMotion {
  const flashes = renderer?._flashes ?? []
  const aiMarks: AIMarks = {
    active: renderer?._aiActiveNodes ?? [],
    done: renderer?._aiDoneFlashes ?? [],
    still
  }
  const animating =
    flashes.length > 0 || aiMarks.done.length > 0 || (renderer?._aiActiveNodes.size ?? 0) > 0
  const loading = !still && work.some((mark) => mark.busy)
  return {
    flashes,
    aiMarks,
    animating,
    loaderStep: loading ? loaderStep(now) : 0,
    continues: animating || loading
  }
}
