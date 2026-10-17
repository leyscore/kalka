import * as v from 'valibot'

import type { AgentEdit } from '@kalka/vue'

import { isUnknownRecord } from '@/app/automation/bridge/target'
import type { EditorStore } from '@/app/editor/active-store'
import {
  finishWorking,
  keepWorking,
  markWorking,
  recordLayerActivity
} from '@/app/presence/activity'
import { showAgentEdit } from '@/app/presence/edit-effect'
import { addAgent, agentPlacement, type AgentHandle } from '@/app/presence/registry'
import { MAX_NAME_LENGTH } from '@/app/presence/schema'

/** After this long without a tool call, a session's agent rests and leaves the canvas. */
export const MCP_AGENT_IDLE_MS = 20_000
/** A session that never says goodbye, such as one whose client crashed, is dropped after this. */
export const MCP_AGENT_GONE_MS = 10 * 60_000
const MAX_SESSION_ID = 128
/** Argument and result fields that name the layers a tool works on. */
const NODE_ID_FIELDS = ['id', 'ids', 'node_id', 'node_ids', 'parent_id', 'root_id', 'target_id']
/** Argument fields that name the layers an editing tool changes, rather than where it puts them. */
const TARGET_ID_FIELDS = ['id', 'ids', 'node_id', 'node_ids', 'target_id']
const NODE_LIST_FIELDS = ['results', 'selection', 'nodes']

const agentSessionSchema = v.object({
  session: v.pipe(v.string(), v.minLength(1), v.maxLength(MAX_SESSION_ID)),
  kind: v.picklist(['mcp', 'acp', 'harness']),
  client: v.fallback(
    v.optional(v.pipe(v.string(), v.trim(), v.maxLength(MAX_NAME_LENGTH))),
    undefined
  )
})

/** The MCP session a tool call came from, as the MCP server forwards it. */
export type AgentSession = v.InferOutput<typeof agentSessionSchema>

export function readAgentSession(value: unknown): AgentSession | null {
  const result = v.safeParse(agentSessionSchema, value)
  return result.success ? result.output : null
}

interface SessionAgent {
  handle: AgentHandle
  kind: AgentSession['kind']
  /** Counts the times its chat's replies ended; a tool call from an earlier reply is ignored. */
  replies: number
  idleTimer?: ReturnType<typeof setTimeout>
  goneTimer?: ReturnType<typeof setTimeout>
}

/** Each session's agent in every document it works in; tool calls name their document. */
const sessions = new Map<string, Map<EditorStore, SessionAgent>>()

function sessionAgent(store: EditorStore, session: AgentSession): SessionAgent {
  let agents = sessions.get(session.session)
  if (!agents) {
    agents = new Map()
    sessions.set(session.session, agents)
  }
  let agent = agents.get(store)
  if (!agent) {
    agent = {
      handle: addAgent(store, session.kind, session.client || undefined),
      kind: session.kind,
      replies: 0
    }
    agents.set(store, agent)
  }
  return agent
}

function remove(sessionId: string, store: EditorStore): void {
  const agents = sessions.get(sessionId)
  const agent = agents?.get(store)
  if (!agents || !agent) return
  clearTimeout(agent.idleTimer)
  clearTimeout(agent.goneTimer)
  agent.handle.remove()
  agents.delete(store)
  if (agents.size === 0) sessions.delete(sessionId)
}

function restartTimers(store: EditorStore, sessionId: string, agent: SessionAgent): void {
  clearTimeout(agent.idleTimer)
  clearTimeout(agent.goneTimer)
  agent.idleTimer = setTimeout(() => {
    agent.handle.update({ status: 'idle', cursor: undefined, selection: undefined })
  }, MCP_AGENT_IDLE_MS)
  agent.goneTimer = setTimeout(() => remove(sessionId, store), MCP_AGENT_GONE_MS)
}

function collectIds(
  value: unknown,
  ids: Set<string>,
  fields: readonly string[] = NODE_ID_FIELDS
): void {
  if (!isUnknownRecord(value)) return
  const record = value
  for (const field of fields) {
    const entry = record[field]
    if (typeof entry === 'string') ids.add(entry)
    else if (Array.isArray(entry)) {
      for (const item of entry) if (typeof item === 'string') ids.add(item)
    }
  }
  if (fields !== NODE_ID_FIELDS) return
  for (const field of NODE_LIST_FIELDS) {
    const list = record[field]
    if (!Array.isArray(list)) continue
    for (const item of list) {
      if (isUnknownRecord(item) && typeof item.id === 'string') ids.add(item.id)
    }
  }
}

function layersOnly(store: EditorStore, ids: Iterable<string>): string[] {
  return [...ids].filter((id) => {
    const node = store.graph.getNode(id)
    // Pages and the document root are where the agent is, not what it works on.
    return node !== undefined && node.type !== 'CANVAS' && id !== store.graph.rootId
  })
}

/** The layers a tool call works on: what its arguments name, then what its result names. */
export function touchedNodeIds(store: EditorStore, args: unknown, result: unknown): string[] {
  const ids = new Set<string>()
  collectIds(args, ids)
  collectIds(result, ids)
  return layersOnly(store, ids)
}

/** The layers an editing call's arguments say it changes, not the parent it writes into. */
export function targetNodeIds(store: EditorStore, args: unknown): string[] {
  const ids = new Set<string>()
  collectIds(args, ids, TARGET_ID_FIELDS)
  return layersOnly(store, ids)
}

/** What one agent call read, what it wrote, and the layers it builds from then on. */
export interface AgentActivity {
  read: readonly string[]
  written: readonly string[]
  worked: readonly string[]
}

/**
 * A session started a tool call on `pageId`: its agent shows it is at work there. Returns the
 * reply the call belongs to, for `agentFinished`.
 */
export function agentStarted(store: EditorStore, session: AgentSession, pageId: string): number {
  const agent = sessionAgent(store, session)
  agent.handle.update({ status: 'thinking', pageId })
  restartTimers(store, session.session, agent)
  return agent.replies
}

/**
 * A session's tool call finished: its agent points at the layers the call read or changed, so
 * people see the context it works with, and edits show as editing.
 */
export function agentFinished(
  store: EditorStore,
  session: AgentSession,
  work: {
    pageId: string
    nodeIds: readonly string[]
    edited: boolean
    edit?: AgentEdit
    activity?: AgentActivity
    reply: number
  }
): void {
  const agent = sessionAgent(store, session)
  // A call that was running when its chat's reply ended lands without bringing the agent back
  // or moving it away from what a later reply works on.
  if (work.reply !== agent.replies) return
  const placement = agentPlacement(store, work.nodeIds, work.pageId)
  agent.handle.update({
    status: work.edited ? 'editing' : 'thinking',
    pageId: work.pageId,
    ...placement
  })
  const { activity } = work
  if (activity) {
    recordLayerActivity(store, agent.handle, 'read', activity.read)
    recordLayerActivity(store, agent.handle, 'write', activity.written)
    markWorking(store, agent.handle, activity.worked)
  }
  keepWorking(store, agent.handle)
  // An edit replays on the canvas, the cursor moving through what it touched.
  if (work.edit) {
    const pageId = placement?.pageId ?? work.pageId
    showAgentEdit(store, work.edit, { agent: agent.handle, touched: work.nodeIds, pageId })
  }
  restartTimers(store, session.session, agent)
}

/**
 * A session's agent says it is done with `nodeIds`, or with all it builds in this document, as
 * `finish_working_on_nodes` does. Returns the layers it let go of.
 */
export function finishSessionWork(
  store: EditorStore,
  session: AgentSession,
  nodeIds: readonly string[] | null
): string[] {
  const agent = sessions.get(session.session)?.get(store)
  return agent ? finishWorking(store, agent.handle, nodeIds) : []
}

/**
 * The app's own ACP or Pi chat ended a reply, finished, stopped, or failed: that chat's agents
 * rest now rather than when their idle timer runs out. Only the app's chats send these kinds
 * (`src/app/integrations/mcp`), so no outside MCP client is touched.
 */
export function restAgents(kind: Exclude<AgentSession['kind'], 'mcp'>): void {
  for (const agents of sessions.values()) {
    for (const [store, agent] of agents) {
      if (agent.kind !== kind) continue
      clearTimeout(agent.idleTimer)
      agent.replies++
      agent.handle.update({ status: 'idle', cursor: undefined, selection: undefined })
      finishWorking(store, agent.handle)
    }
  }
}

/** The MCP server says a session ended: its agents leave every document. */
export function endAgentSession(sessionId: string): void {
  // Removing entries while iterating a Map is safe: visited ones stay visited.
  for (const store of sessions.get(sessionId)?.keys() ?? []) remove(sessionId, store)
}
