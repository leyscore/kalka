import type { PlannedSection } from '@kalka/core/figma-api'
import type { Rect } from '@kalka/scene-graph/primitives'

export const AGENT_KINDS = ['chat', 'acp', 'harness', 'mcp'] as const
export type AgentKind = (typeof AGENT_KINDS)[number]

export const AGENT_STATUSES = ['thinking', 'editing', 'idle'] as const
export type AgentStatus = (typeof AGENT_STATUSES)[number]

export interface PresencePoint {
  x: number
  y: number
  pageId: string
}

/** A person's pointer, with the zoom they view it at so followers can match it. */
export interface PersonPoint extends PresencePoint {
  zoom?: number
}

/** Who to keep in view: a person in the room, or any agent, ours or theirs. */
export type FollowTarget = { kind: 'person'; clientId: number } | { kind: 'agent'; agentId: string }

/** A section an agent announced: its name and its approximate height in pixels. */
export type AgentPlanSection = PlannedSection

/**
 * An agent as its owner publishes it: metadata only, never prompts or tool arguments. What its
 * streamed `render` call builds travels apart from presence (`./preview-stream.ts`).
 */
export interface AgentPresence {
  id: string
  /** A callsign, unique among the agents in a room, such as "Fern". */
  name: string
  kind: AgentKind
  model?: string
  status: AgentStatus
  /**
   * What the agent says it is doing now, such as "Composing the hero", from `set_status`; shown
   * after its name while it works, and cleared when it rests.
   */
  note?: string
  /**
   * The sections the agent says it will build, top to bottom, from `plan_sections`; the canvas
   * shows those not built yet as outlines, and the chat lists them under the build step.
   */
  plan?: AgentPlanSection[]
  /** The page the agent works on, known before its first edit. */
  pageId?: string
  /** Where the agent last worked, derived from the nodes it touched. */
  cursor?: PresencePoint
  selection?: string[]
  /** Outlines, in world coordinates on the cursor's page, of what is not a layer yet. */
  outline?: Rect[]
  /**
   * Layers the agent is building and has not released yet, the outermost of each group it
   * wrote; the canvas marks them with its name until it finishes or goes quiet.
   */
  working?: string[]
}
