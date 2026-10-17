import { uniq } from 'es-toolkit'

import type { DocumentChange } from '@kalka/core/editor'
import type { SceneGraph } from '@kalka/scene-graph'
import type { AgentWorkMark } from '@kalka/vue'

import type { RemotePeer } from '@/app/collab/types'
import type { EditorStore } from '@/app/editor/active-store'

import { localAgentColor, presenceOf, type AgentHandle } from './registry'
import { MAX_WORKING } from './schema'
import type { AgentKind, AgentPresence } from './types'

/** An agent lets go of what it builds after this long without a tool call. */
export const WORKING_RELEASE_MS = 60_000
/** Layers whose last read and write are remembered; the oldest are forgotten first. */
export const MAX_TRACKED_LAYERS = 2000
/** Layers one call records, so a call over a huge tree stays cheap. */
export const MAX_RECORDED_PER_CALL = 256

/** Which agent touched a layer, and when, on the `Date.now()` clock of this app. */
export interface AgentTouch {
  agentId: string
  name: string
  kind: AgentKind
  at: number
}

/** The last time an agent read a layer and the last time one wrote it. */
export interface LayerActivity {
  read?: AgentTouch
  write?: AgentTouch
}

type AgentRef = Pick<AgentPresence, 'id' | 'name' | 'kind'>

interface PeerAgentSeen {
  working: ReadonlySet<string>
  selection: ReadonlySet<string>
}

interface Activity {
  /** In the order layers were last touched, oldest first. */
  layers: Map<string, LayerActivity>
  releaseTimers: Map<string, ReturnType<typeof setTimeout>>
  /** What each peer's agent was last seen working on and pointing at. */
  peerAgents: Map<string, PeerAgentSeen>
  marks: { key: readonly unknown[]; value: readonly AgentWorkMark[] } | null
}

const activities = new WeakMap<EditorStore, Activity>()

function activityOf(store: EditorStore): Activity {
  let activity = activities.get(store)
  if (!activity) {
    activity = { layers: new Map(), releaseTimers: new Map(), peerAgents: new Map(), marks: null }
    activities.set(store, activity)
  }
  return activity
}

/**
 * Note that an agent read or wrote layers. This is presence, not document data: it never
 * enters the graph or the history, and only the latest touch of each kind is kept.
 */
export function recordLayerActivity(
  store: EditorStore,
  agent: AgentRef,
  kind: 'read' | 'write',
  nodeIds: readonly string[],
  at = Date.now()
): void {
  const { layers } = activityOf(store)
  const touch: AgentTouch = { agentId: agent.id, name: agent.name, kind: agent.kind, at }
  for (const id of nodeIds.slice(0, MAX_RECORDED_PER_CALL)) {
    const entry = layers.get(id) ?? {}
    // Re-inserted so the map stays ordered by recency.
    layers.delete(id)
    layers.set(id, { ...entry, [kind]: touch })
  }
  for (const id of layers.keys()) {
    if (layers.size <= MAX_TRACKED_LAYERS) break
    layers.delete(id)
  }
}

/** Which agents last read and wrote `nodeId`, if any did. */
export function layerActivity(store: EditorStore, nodeId: string): LayerActivity | undefined {
  return activityOf(store).layers.get(nodeId)
}

function ancestorIn(graph: SceneGraph, nodeId: string, ids: ReadonlySet<string>): boolean {
  let parentId = graph.getNode(nodeId)?.parentId
  while (parentId) {
    if (ids.has(parentId)) return true
    parentId = graph.getNode(parentId)?.parentId
  }
  return false
}

/** The outermost of `ids`: those not inside another one, in the order given. Pages are skipped. */
export function outermostLayers(graph: SceneGraph, ids: readonly string[]): string[] {
  const present = ids.filter((id) => {
    const node = graph.getNode(id)
    return node !== undefined && node.type !== 'CANVAS' && id !== graph.rootId
  })
  const set = new Set(present)
  return uniq(present).filter((id) => !ancestorIn(graph, id, set))
}

/** Every layer an edit created or changed, for the record of what agents wrote. */
export function writtenLayers(change: DocumentChange): string[] {
  return uniq([
    ...change.created.map((node) => node.id),
    ...change.updated.map((update) => update.id)
  ])
}

/**
 * What an edit has an agent working on: the outermost layers it created, and the layers the
 * call named that it changed. A parent that only grew to fit new children, or siblings that
 * moved aside, are not part of the work. Without a page change, as for property edits, the
 * layers the call named.
 */
export function workedLayers(
  graph: SceneGraph,
  change: DocumentChange | null,
  targets: readonly string[]
): string[] {
  if (!change) return outermostLayers(graph, targets)
  const updated = new Set(change.updated.map((update) => update.id))
  return outermostLayers(graph, [
    ...change.created.map((node) => node.id),
    ...targets.filter((id) => updated.has(id))
  ])
}

function workingOf(store: EditorStore, agentId: string): readonly string[] {
  return presenceOf(store).agents.value.find((agent) => agent.id === agentId)?.working ?? []
}

function setWorking(store: EditorStore, agent: AgentHandle, working: readonly string[]): void {
  const current = workingOf(store, agent.id)
  if (current.length === working.length && current.every((id, index) => id === working[index]))
    return
  agent.update({ working: working.length > 0 ? [...working] : undefined })
}

/** The agent is still at work: what it builds stays marked for another `WORKING_RELEASE_MS`. */
export function keepWorking(store: EditorStore, agent: AgentHandle): void {
  const { releaseTimers } = activityOf(store)
  clearTimeout(releaseTimers.get(agent.id))
  releaseTimers.delete(agent.id)
  if (workingOf(store, agent.id).length === 0) return
  releaseTimers.set(
    agent.id,
    setTimeout(() => {
      releaseTimers.delete(agent.id)
      finishWorking(store, agent)
    }, WORKING_RELEASE_MS)
  )
}

/**
 * Mark layers as being built by `agent`, with what it already holds; a layer inside one it
 * holds is part of that one. The newest are kept when it holds more than `MAX_WORKING`.
 */
export function markWorking(store: EditorStore, agent: AgentHandle, nodeIds: readonly string[]) {
  if (nodeIds.length === 0) return
  const merged = outermostLayers(store.graph, [...workingOf(store, agent.id), ...nodeIds])
  setWorking(store, agent, merged.slice(-MAX_WORKING))
  keepWorking(store, agent)
}

/**
 * The agent is done with `nodeIds`, or with everything when none are given: their marks go,
 * with those of layers inside them. Returns the layers it let go of.
 */
export function finishWorking(
  store: EditorStore,
  agent: AgentHandle,
  nodeIds?: readonly string[] | null
): string[] {
  const working = workingOf(store, agent.id)
  const finished = new Set(nodeIds)
  const released =
    finished.size === 0
      ? [...working]
      : working.filter((id) => finished.has(id) || ancestorIn(store.graph, id, finished))
  if (released.length === 0) return []
  const releasedSet = new Set(released)
  setWorking(
    store,
    agent,
    working.filter((id) => !releasedSet.has(id))
  )
  keepWorking(store, agent)
  return released
}

function pageOf(graph: SceneGraph, nodeId: string): string | undefined {
  let node = graph.getNode(nodeId)
  while (node && node.type !== 'CANVAS')
    node = node.parentId ? graph.getNode(node.parentId) : undefined
  return node?.id
}

/**
 * What the canvas marks on `pageId`: layers our agents and people's agents are building, in
 * their colors. The same array comes back while nothing it depends on changed, so the overlay
 * redraws only when it does.
 */
export function workingMarks(store: EditorStore, pageId: string): readonly AgentWorkMark[] {
  const presence = presenceOf(store)
  const activity = activityOf(store)
  const key = [
    presence.agents.value,
    presence.peers.value,
    presence.ownerColor.value,
    pageId,
    store.state.sceneVersion
  ]
  const cached = activity.marks
  if (cached?.key.every((value, index) => Object.is(value, key[index]))) return cached.value
  const own = localAgentColor(store)
  const marks: AgentWorkMark[] = []
  const add = (agent: AgentPresence, color: AgentWorkMark['color']) => {
    for (const nodeId of agent.working ?? []) {
      if (pageOf(store.graph, nodeId) === pageId) marks.push({ nodeId, name: agent.name, color })
    }
  }
  for (const agent of presence.agents.value) add(agent, own)
  for (const peer of presence.peers.value) for (const agent of peer.agents) add(agent, peer.color)
  activity.marks = { key, value: marks }
  return marks
}

/**
 * Records what people's agents read and write, from the presence they share: layers newly in
 * an agent's working set were written, layers newly pointed at otherwise were read. Times are
 * when this app heard of it, since clocks differ between machines.
 */
export function recordPeerActivity(
  store: EditorStore,
  peers: readonly RemotePeer[],
  at = Date.now()
): void {
  const { peerAgents } = activityOf(store)
  const live = new Set<string>()
  for (const peer of peers) {
    for (const agent of peer.agents) {
      live.add(agent.id)
      const seen = peerAgents.get(agent.id)
      const working = new Set(agent.working)
      const selection = new Set(agent.selection)
      const wrote = [...working].filter((id) => !seen?.working.has(id))
      const read = [...selection].filter((id) => !working.has(id) && !seen?.selection.has(id))
      if (wrote.length > 0) recordLayerActivity(store, agent, 'write', wrote, at)
      if (read.length > 0) recordLayerActivity(store, agent, 'read', read, at)
      peerAgents.set(agent.id, { working, selection })
    }
  }
  for (const id of peerAgents.keys()) if (!live.has(id)) peerAgents.delete(id)
}
