import { fitEnclosingGroups, redoGroupFit, undoGroupFit } from '@kalka/scene-graph'

import { groupFitOptions } from '#core/canvas/boolean'
import type { EditorContext } from '#core/editor/types'

/**
 * Refits the groups and booleans around these parents after a move, as one undo step. The fit
 * itself is shared with the plugin API; see `fitEnclosingGroups` in Scene Graph.
 */
export function fitEnclosingGroupsWithUndo(ctx: EditorContext, parentIds: Iterable<string>) {
  const fit = fitEnclosingGroups(
    ctx.graph,
    parentIds,
    groupFitOptions(ctx.getRenderer(), ctx.graph)
  )
  if (!fit) return
  ctx.undo.push({
    label: 'Fit groups',
    forward: () => redoGroupFit(ctx.graph, fit),
    inverse: () => undoGroupFit(ctx.graph, fit)
  })
}

/** Layer fields whose change can move a layer's edges, and with them its group's. */
const GROUP_FIT_FIELDS: ReadonlySet<string> = new Set(['x', 'y', 'width', 'height', 'rotation'])

/**
 * Records `record` and the refit of the groups around `nodeId` as one undo step, when `fields`
 * can change the layer's box: in Figma a group always spans its layers.
 */
export function recordWithGroupFit(
  ctx: EditorContext,
  nodeId: string,
  label: string,
  fields: Iterable<string>,
  record: () => void
): void {
  const parentId = ctx.graph.getNode(nodeId)?.parentId
  if (!parentId || ![...fields].some((field) => GROUP_FIT_FIELDS.has(field))) {
    record()
    return
  }
  ctx.undo.runBatch(label, () => {
    record()
    fitEnclosingGroupsWithUndo(ctx, [parentId])
  })
}
