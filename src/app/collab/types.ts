import type { Color } from '@open-pencil/scene-graph/primitives'

import type { AgentPresence, PresencePoint } from '@/app/presence/types'

export interface RemotePeer {
  clientId: number
  name: string
  color: Color
  cursor?: PresencePoint
  selection?: string[]
  /** Agents this person runs, as they publish them. */
  agents: AgentPresence[]
}

export interface CollabState {
  connected: boolean
  roomId: string | null
  peers: RemotePeer[]
  localName: string
  localColor: Color
}

export const DEFAULT_COLLAB_STATE: CollabState = {
  connected: false,
  roomId: null,
  peers: [],
  localName: '',
  localColor: { r: 0.5, g: 0.5, b: 0.5, a: 1 }
}
