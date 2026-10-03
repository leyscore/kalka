export const AGENT_KINDS = ['chat', 'acp', 'harness', 'mcp'] as const
export type AgentKind = (typeof AGENT_KINDS)[number]

export const AGENT_STATUSES = ['thinking', 'editing', 'idle'] as const
export type AgentStatus = (typeof AGENT_STATUSES)[number]

export interface PresencePoint {
  x: number
  y: number
  pageId: string
}

/** An agent as its owner publishes it: metadata only, never prompts or tool arguments. */
export interface AgentPresence {
  id: string
  /** A callsign, unique among the agents in a room, such as "Fern". */
  name: string
  kind: AgentKind
  model?: string
  status: AgentStatus
  /** Where the agent last worked, derived from the nodes it touched. */
  cursor?: PresencePoint
  selection?: string[]
}
