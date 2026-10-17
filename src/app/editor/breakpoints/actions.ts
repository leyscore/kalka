import {
  createBreakpoint,
  responsiveOverrides,
  responsiveParent,
  type SceneNode
} from '@kalka/scene-graph'

import { executeWithDocumentUndo } from '@/app/automation/execution/editor'
import type { EditorStore } from '@/app/editor/active-store'

/** Breakpoints the Design panel offers, from Framer's and Webflow's common widths. */
export const BREAKPOINT_PRESETS = [
  { key: 'tablet', width: 810 },
  { key: 'phone', width: 390 }
] as const

export type BreakpointPreset = (typeof BREAKPOINT_PRESETS)[number]

/** Adds a breakpoint to a primary artboard as one undo step, and selects it. */
export async function addBreakpoint(
  store: EditorStore,
  primaryId: string,
  width: number,
  name: string
): Promise<void> {
  const pageId = store.graph.getNode(primaryId)?.parentId
  if (!pageId) return
  let created: SceneNode | undefined
  await executeWithDocumentUndo(store, pageId, 'Add breakpoint', async () => {
    created = createBreakpoint(store.graph, primaryId, width, name)
    store.runLayoutForNode(pageId)
  })
  if (created) store.select([created.id])
  store.requestRender()
}

/** Gives a breakpoint copy back the values of the next wider breakpoint. */
export function resetBreakpointValues(store: EditorStore, node: SceneNode): void {
  const parent = responsiveParent(store.graph, node)
  if (!parent) return
  const changes: Partial<SceneNode> = {}
  for (const field of responsiveOverrides(store.graph, node))
    Object.assign(changes, { [field]: structuredClone(parent[field]) })
  if (Object.keys(changes).length > 0)
    store.updateNodeWithUndo(node.id, changes, 'Reset to wider breakpoint')
}
