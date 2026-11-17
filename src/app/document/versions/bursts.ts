import { shallowRef, toRaw, type ShallowRef } from 'vue'

import type { PageSnapshot } from '@kalka/core/editor'
import type { SceneGraph } from '@kalka/scene-graph'

import type { EditorStore } from '@/app/editor/active-store'

/**
 * Agents' changes, in bursts: an agent's edits to a page close together in time are one change,
 * which keeps the page as it was before it. Restoring a change puts the page back to that state,
 * as one undoable step, so an agent's work is never the only copy of a design.
 */
export interface AgentChange {
  id: string
  agentName: string
  pageId: string
  startedAt: number
  lastAt: number
  edits: number
  before: PageSnapshot
}

/** Edits of one agent to one page this close together are one change. */
export const BURST_MS = 2 * 60_000
/** How many changes a document keeps; older ones fall off with their snapshots. */
export const MAX_AGENT_CHANGES = 20

const changesByGraph = new WeakMap<SceneGraph, ShallowRef<AgentChange[]>>()
let counter = 0

export function agentChanges(graph: SceneGraph): ShallowRef<AgentChange[]> {
  const key = toRaw(graph)
  let changes = changesByGraph.get(key)
  if (!changes) {
    changes = shallowRef<AgentChange[]>([])
    changesByGraph.set(key, changes)
  }
  return changes
}

/**
 * An agent is about to edit `pageId`: it continues its latest change when that is its own, on the
 * same page and recent; otherwise a new change starts, keeping the page as it is now.
 */
export function noteAgentEdit(
  store: EditorStore,
  agentName: string,
  pageId: string,
  now = Date.now()
): void {
  const changes = agentChanges(store.graph)
  const latest = changes.value.at(0)
  if (
    latest &&
    latest.agentName === agentName &&
    latest.pageId === pageId &&
    now - latest.lastAt < BURST_MS
  ) {
    changes.value = [{ ...latest, lastAt: now, edits: latest.edits + 1 }, ...changes.value.slice(1)]
    return
  }
  changes.value = [
    {
      id: `change-${++counter}`,
      agentName,
      pageId,
      startedAt: now,
      lastAt: now,
      edits: 1,
      before: store.snapshotPage(pageId)
    },
    ...changes.value
  ].slice(0, MAX_AGENT_CHANGES)
}

/**
 * Puts a change's page back to how it was before the change, undoing it and everything after it
 * on that page, in one step that undo takes back.
 */
export function restoreBeforeChange(store: EditorStore, change: AgentChange, label: string): void {
  const current = store.snapshotPage(change.pageId)
  store.restorePageFromSnapshot(change.before)
  store.pushUndoStep({
    label,
    forward: () => store.restorePageFromSnapshot(change.before),
    inverse: () => store.restorePageFromSnapshot(current)
  })
  store.requestRender()
}
