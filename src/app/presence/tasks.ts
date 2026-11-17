import { shallowRef, toRaw, type ShallowRef } from 'vue'

import type { SceneGraph } from '@kalka/scene-graph'

import type { AgentPresence } from '@/app/presence/types'

/**
 * What the document's agents worked on, newest first: each line an agent announced with
 * `set_status`, from when it said it until it said the next or went to rest, and where it was
 * working then, so a person can go back to it.
 */
export interface AgentTask {
  id: string
  agentName: string
  text: string
  startedAt: number
  endedAt: number | null
  /** Where the agent's cursor last was during the task. */
  place: { pageId: string; x: number; y: number } | null
}

/** How many tasks a document keeps; older ones fall off. */
export const MAX_AGENT_TASKS = 30

const tasksByGraph = new WeakMap<SceneGraph, ShallowRef<AgentTask[]>>()
let counter = 0

export function agentTasks(graph: SceneGraph): ShallowRef<AgentTask[]> {
  const key = toRaw(graph)
  let tasks = tasksByGraph.get(key)
  if (!tasks) {
    tasks = shallowRef<AgentTask[]>([])
    tasksByGraph.set(key, tasks)
  }
  return tasks
}

function placeOf(agent: AgentPresence): AgentTask['place'] {
  return agent.cursor ? { pageId: agent.cursor.pageId, x: agent.cursor.x, y: agent.cursor.y } : null
}

/**
 * An agent's presence changed from `before` to `after`: a new status line starts a task and ends
 * its previous one, rest ends it, and its cursor keeps the running task's place up to date.
 */
export function trackAgentTask(
  graph: SceneGraph,
  before: AgentPresence,
  after: AgentPresence,
  now = Date.now()
): void {
  const tasks = agentTasks(graph)
  const running = tasks.value.find(
    (task) => task.agentName === before.name && task.endedAt === null
  )
  let next = tasks.value
  const resting = after.status === 'idle' && before.status !== 'idle'
  const newLine = (after.note ?? '') !== (before.note ?? '')
  if (running && (resting || newLine)) {
    next = next.map((task) => (task === running ? { ...task, endedAt: now } : task))
  } else if (running && after.cursor && after.cursor !== before.cursor) {
    next = next.map((task) => (task === running ? { ...task, place: placeOf(after) } : task))
  }
  if (newLine && after.note) {
    next = [
      {
        id: `task-${++counter}`,
        agentName: after.name,
        text: after.note,
        startedAt: now,
        endedAt: null,
        place: placeOf(after)
      },
      ...next
    ].slice(0, MAX_AGENT_TASKS)
  }
  if (next !== tasks.value) tasks.value = next
}
