import { materializeFigFragment } from '@kalka/fig'
import type { NodeChange } from '@kalka/kiwi/fig/codec'
import {
  captureTransferredState,
  DEFAULT_FONT_FAMILY,
  removeGraphTransfer,
  applyGraphTransfer,
  prepareGraphTransfer,
  type SceneGraph
} from '@kalka/scene-graph'

/** Whether any text in the document, or any of its runs, is set in Inter. */
function usesInter(graph: SceneGraph): boolean {
  for (const node of graph.getAllNodes()) {
    if (node.type !== 'TEXT') continue
    if ((node.fontFamily || DEFAULT_FONT_FAMILY) === DEFAULT_FONT_FAMILY) return true
    if (node.styleRuns.some((run) => run.style.fontFamily === DEFAULT_FONT_FAMILY)) return true
  }
  return false
}

/** Interpret in isolation before any destination mutation. */
export function prepareClipboardImport(
  changes: NodeChange[],
  graph: SceneGraph,
  parentId: string,
  blobs: Uint8Array[] = [],
  offsetX = 0,
  offsetY = 0
) {
  const fragment = materializeFigFragment(changes, blobs, { missingComponent: 'detach-empty' })
  const plan = prepareGraphTransfer({
    source: fragment.graph,
    rootIds: fragment.rootIds,
    dependencyPageIds: fragment.dependencyPageIds,
    target: graph,
    parentId
  })
  const roots = new Set(plan.rootIds)
  for (const node of plan.nodes)
    if (roots.has(node.id)) {
      node.props.x = (node.props.x ?? 0) + offsetX
      node.props.y = (node.props.y ?? 0) + offsetY
    }
  // Figma's text keeps the Inter Figma laid it out with in a document whose own text does not
  // use Inter yet, so switching changes nothing already there; elsewhere it takes the document's.
  const interBefore = graph.interVersion
  const interAfter = usesInter(graph) ? interBefore : fragment.graph.interVersion
  let snapshot = plan
  const operation = {
    sourceIds: fragment.sources,
    plan,
    capture: () => {
      snapshot = captureTransferredState(graph, plan)
    },
    undo: () => {
      removeGraphTransfer(graph, snapshot)
      graph.interVersion = interBefore
    },
    redo: () => {
      graph.interVersion = interAfter
      applyGraphTransfer(graph, snapshot)
    },
    commit: () => {
      graph.interVersion = interAfter
      applyGraphTransfer(graph, plan)
    }
  }
  return operation
}
