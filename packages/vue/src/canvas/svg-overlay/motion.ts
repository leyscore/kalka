import { skeletonLive, type AgentSkeleton } from '#vue/canvas/svg-overlay/layers/agent-skeletons'
import { loaderStep, type AgentWorkMark } from '#vue/canvas/svg-overlay/layers/agent-work'
import type { AIMarks } from '#vue/canvas/svg-overlay/layers/ai-marks'
import type { Flash } from '#vue/canvas/svg-overlay/layers/flashes'

/** What agents show on the overlay for one frame, and whether it still moves. */
export interface AgentOverlayFrame {
  work: readonly AgentWorkMark[]
  skeletons: readonly AgentSkeleton[]
  /** A skeleton is showing or fading: it breathes, so every frame draws. */
  loadingSkeletons: boolean
  /** A busy mark's loader steps: the overlay keeps asking for frames, drawing only on a step. */
  loading: boolean
  /**
   * The loader's step now, which keys the frame, so frames between steps draw nothing; 0 while
   * nothing loads.
   */
  step: number
}

/** Agents' marks and frames for a frame at `now`; loaders hold still when motion is reduced. */
export function agentOverlayFrame(
  work: readonly AgentWorkMark[],
  skeletons: readonly AgentSkeleton[],
  still: boolean,
  now: number
): AgentOverlayFrame {
  const loading = !still && work.some((mark) => mark.busy)
  return {
    work,
    skeletons,
    loadingSkeletons: skeletons.some((skeleton) => skeletonLive(skeleton, now)),
    loading,
    step: loading ? loaderStep(now) : 0
  }
}

/** The same empty list every frame, so a pane without agents at work never redraws for it. */
const NO_AGENT_SKELETONS: readonly AgentSkeleton[] = []

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
  agents: AgentOverlayFrame
  /** Something moves every frame: the frame is keyed by the time. */
  animating: boolean
  /** Ask for another frame, whether or not this one drew. */
  continues: boolean
}

/** What animates at `now`: flashes, AI marks, and agents' skeletons and loaders. */
export function overlayMotion(
  renderer: FlashSource | null | undefined,
  work: readonly AgentWorkMark[],
  skeletons: readonly AgentSkeleton[] | undefined,
  still: boolean,
  now: number
): OverlayMotion {
  const flashes = renderer?._flashes ?? []
  const aiMarks: AIMarks = {
    active: renderer?._aiActiveNodes ?? [],
    done: renderer?._aiDoneFlashes ?? [],
    still
  }
  const agentFrame = agentOverlayFrame(work, skeletons ?? NO_AGENT_SKELETONS, still, now)
  const animating =
    flashes.length > 0 ||
    aiMarks.done.length > 0 ||
    (renderer?._aiActiveNodes.size ?? 0) > 0 ||
    agentFrame.loadingSkeletons
  return {
    flashes,
    aiMarks,
    agents: agentFrame,
    animating,
    continues: animating || agentFrame.loading
  }
}
