import type { SceneGraph } from '@kalka/scene-graph'

import type { EditorStore } from '@/app/editor/active-store'

import { presenceOf } from './registry'

/** Another agent at work on a frame a call wanted to edit. */
export interface HeldFrame {
  agent: string
  frame: string
}

/** The layer on the page that holds `nodeId`: itself when it sits on the page. */
export function topLevelLayer(graph: SceneGraph, nodeId: string): string | undefined {
  let node = graph.getNode(nodeId)
  while (node?.parentId) {
    const parent = graph.getNode(node.parentId)
    if (!parent || parent.type === 'CANVAS') return node.id
    node = parent
  }
  return undefined
}

/**
 * The first frame among `nodeIds` that another of our agents is building, so agents working at
 * once in a document do not edit the same frame: each holds the top-level frames it builds until
 * it finishes, goes quiet, or its reply ends. People's agents in a room are not counted; their
 * edits merge through the room.
 */
export function heldByOtherAgent(
  store: EditorStore,
  agentId: string | undefined,
  nodeIds: readonly string[]
): HeldFrame | null {
  if (nodeIds.length === 0) return null
  const { graph } = store
  const wanted = new Set(
    nodeIds.flatMap((id) => {
      const top = topLevelLayer(graph, id)
      return top ? [top] : []
    })
  )
  if (wanted.size === 0) return null
  for (const agent of presenceOf(store).agents.value) {
    if (agent.id === agentId || agent.status === 'idle') continue
    for (const id of agent.working ?? []) {
      const top = topLevelLayer(graph, id)
      if (top && wanted.has(top)) {
        return { agent: agent.name, frame: graph.getNode(top)?.name ?? top }
      }
    }
  }
  return null
}

/** What the model reads when the frame it wanted is taken. */
export function frameHeldMessage({ agent, frame }: HeldFrame): string {
  return (
    `${agent} is building "${frame}" right now, so nothing was changed. Work on another frame, ` +
    `or finish your other steps and try this one again once ${agent} is done.`
  )
}
