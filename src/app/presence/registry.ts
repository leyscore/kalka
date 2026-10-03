import { shallowRef, type ShallowRef } from 'vue'

import type { PresenceCursor } from '@open-pencil/core/canvas'
import { AI_ACTIVE_COLOR } from '@open-pencil/core/constants'
import { randomHex } from '@open-pencil/core/random'
import type { Color } from '@open-pencil/scene-graph/primitives'

import type { RemotePeer } from '@/app/collab/types'
import type { EditorStore } from '@/app/editor/active-store'

import { pickCallsign } from './callsigns'
import type { AgentKind, AgentPresence } from './types'

/** Agents' color outside a room, where there is no collaborator color to inherit. */
const SOLO_AGENT_COLOR: Color = { ...AI_ACTIVE_COLOR, a: 1 }

interface Presence {
  /** Agents running in this app for the document. */
  agents: ShallowRef<readonly AgentPresence[]>
  /** People in the room, with their agents. */
  peers: ShallowRef<readonly RemotePeer[]>
  /** The local collaborator's color while in a room. */
  ownerColor: ShallowRef<Color | null>
}

const presences = new WeakMap<EditorStore, Presence>()

export function presenceOf(store: EditorStore): Presence {
  const existing = presences.get(store)
  if (existing) return existing
  const presence: Presence = {
    agents: shallowRef([]),
    peers: shallowRef([]),
    ownerColor: shallowRef(null)
  }
  presences.set(store, presence)
  store.onEditorEvent('page:changed', () => refreshCursors(store))
  return presence
}

function agentCursor(agent: AgentPresence, color: Color, pageId: string): PresenceCursor[] {
  if (agent.status === 'idle' || agent.cursor?.pageId !== pageId) return []
  const { x, y } = agent.cursor
  return [{ kind: 'agent', name: agent.name, color, x, y, selection: agent.selection }]
}

/** Draw everyone working on the page on screen: people, their agents, and ours. */
export function refreshCursors(store: EditorStore): void {
  const { agents, peers, ownerColor } = presenceOf(store)
  const pageId = store.state.currentPageId
  store.state.presenceCursors = [
    ...peers.value.flatMap((peer): PresenceCursor[] => [
      ...(peer.cursor?.pageId === pageId
        ? [
            {
              kind: 'person' as const,
              name: peer.name,
              color: peer.color,
              ...peer.cursor,
              selection: peer.selection
            }
          ]
        : []),
      ...peer.agents.flatMap((agent) => agentCursor(agent, peer.color, pageId))
    ]),
    ...agents.value.flatMap((agent) =>
      agentCursor(agent, ownerColor.value ?? SOLO_AGENT_COLOR, pageId)
    )
  ]
  store.requestRepaint()
}

export function setPeers(store: EditorStore, peers: readonly RemotePeer[]): void {
  presenceOf(store).peers.value = peers
  refreshCursors(store)
}

export function setOwnerColor(store: EditorStore, color: Color | null): void {
  presenceOf(store).ownerColor.value = color
  refreshCursors(store)
}

export interface AgentHandle {
  readonly id: string
  readonly name: string
  update: (patch: Partial<Omit<AgentPresence, 'id' | 'name' | 'kind'>>) => void
  remove: () => void
}

/** Announce an agent working in this document under a callsign unique among visible agents. */
export function addAgent(store: EditorStore, kind: AgentKind, model?: string): AgentHandle {
  const presence = presenceOf(store)
  const taken = new Set([
    ...presence.agents.value.map((agent) => agent.name),
    ...presence.peers.value.flatMap((peer) => peer.agents.map((agent) => agent.name))
  ])
  const agent: AgentPresence = {
    id: randomHex(8),
    name: pickCallsign(taken),
    kind,
    model,
    status: 'idle'
  }
  presence.agents.value = [...presence.agents.value, agent]
  const replace = (next: AgentPresence | null) => {
    const agents = presence.agents.value
    presence.agents.value = next
      ? agents.map((entry) => (entry.id === agent.id ? next : entry))
      : agents.filter((entry) => entry.id !== agent.id)
    refreshCursors(store)
  }
  return {
    id: agent.id,
    name: agent.name,
    update: (patch) => {
      const current = presence.agents.value.find((entry) => entry.id === agent.id)
      if (current) replace({ ...current, ...patch })
    },
    remove: () => replace(null)
  }
}
