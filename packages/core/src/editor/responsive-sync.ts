import {
  copiesIn,
  propagateResponsiveChange,
  reconcileBreakpoints,
  responsiveArtboards,
  responsivePrimaryOf,
  type SceneGraph,
  type SceneNode
} from '@kalka/scene-graph'

import { computeAllLayouts } from '#core/layout'

type ComputeLayouts = (graph: SceneGraph, scopeId?: string) => void

interface ResponsiveSyncOptions {
  getGraph: () => SceneGraph
  /** Whether undo or redo is replaying history, which restores structure itself. */
  isReplaying: () => boolean
  requestRender: () => void
  computeLayouts?: ComputeLayouts
}

/**
 * Keeps breakpoint artboards in step with their primary. A field change passes at once to the
 * copy one breakpoint narrower that still followed it, so it lands in the same undo step. A
 * structural edit in a breakpoint is made in the primary instead, and after any structural
 * change the group's structure is brought back in line, once, after the current task.
 */
export function createResponsiveSync(options: ResponsiveSyncOptions) {
  const computeLayouts = options.computeLayouts ?? computeAllLayouts
  let reconciling = false
  let pending: Set<string> | null = null
  /** Which primary layer each breakpoint copy mirrors, to read after a copy is deleted. */
  const sourceOf = new Map<string, string>()

  const graph = () => options.getGraph()
  const quiet = () => {
    const current = graph()
    return reconciling || current.isApplyingLayout || current.isApplyingImportedState
  }

  function indexGroup(primary: SceneNode): void {
    const current = graph()
    for (const artboard of responsiveArtboards(current, primary.id).slice(1))
      for (const [source, copy] of copiesIn(current, artboard)) sourceOf.set(copy.id, source)
  }

  function flush(): void {
    const ids = pending
    pending = null
    if (!ids) return
    const current = graph()
    reconciling = true
    const pages = new Set<string>()
    try {
      for (const id of ids) {
        const primary = current.getNode(id)
        if (!primary || responsiveArtboards(current, id).length < 2) continue
        reconcileBreakpoints(current, id)
        indexGroup(primary)
        if (primary.parentId) pages.add(primary.parentId)
      }
    } finally {
      reconciling = false
    }
    for (const page of pages) computeLayouts(current, page)
    if (pages.size > 0) options.requestRender()
  }

  function schedule(node: SceneNode | undefined): void {
    const primary = node && responsivePrimaryOf(graph(), node)
    if (!primary || responsiveArtboards(graph(), primary.id).length < 2) return
    if (!pending) {
      pending = new Set()
      queueMicrotask(flush)
    }
    pending.add(primary.id)
  }

  function onUpdated(id: string, changes: Partial<SceneNode>, previous: Partial<SceneNode>) {
    if (quiet()) return
    const current = graph()
    propagateResponsiveChange(current, id, changes, previous)
    // A new or removed link reshapes a group.
    if ('responsiveSource' in changes) schedule(current.getNode(id))
  }

  function onCreated(node: SceneNode) {
    if (!quiet()) schedule(node)
  }

  /** Deleting a copy deletes the layer everywhere: the structure is shared. */
  function onDeleted(id: string, parentId: string | null) {
    if (quiet()) return
    const current = graph()
    const source = sourceOf.get(id)
    sourceOf.delete(id)
    if (source && !options.isReplaying() && current.getNode(source)) current.deleteNode(source)
    schedule(parentId ? current.getNode(parentId) : undefined)
  }

  /** Moving a copy moves its primary layer to the matching place. */
  function onMoved(nodeId: string, parentId: string, index: number | null) {
    if (quiet()) return
    const current = graph()
    const node = current.getNode(nodeId)
    const parent = current.getNode(parentId)
    if (node?.responsiveSource && parent && !options.isReplaying()) {
      const sourceParentId = parent.responsiveSource
      const source = current.getNode(node.responsiveSource)
      if (source && sourceParentId && current.getNode(sourceParentId)) {
        reconciling = true
        try {
          current.insertChildAt(source.id, sourceParentId, index ?? parent.childIds.indexOf(nodeId))
        } finally {
          reconciling = false
        }
      }
    }
    schedule(node)
  }

  /** Indexes the groups of a newly opened document, so deletions find their sources. */
  function indexDocument(): void {
    sourceOf.clear()
    const current = graph()
    for (const page of current.getPages(true))
      for (const artboard of current.getChildren(page.id))
        if (!artboard.responsiveSource && responsiveArtboards(current, artboard.id).length > 1)
          indexGroup(artboard)
  }

  return {
    onUpdated,
    onCreated,
    onDeleted,
    onReparented: (nodeId: string, _old: string | null, newParentId: string) =>
      onMoved(nodeId, newParentId, null),
    onReordered: (nodeId: string, parentId: string, index: number) =>
      onMoved(nodeId, parentId, index),
    indexDocument,
    flush
  }
}

export type ResponsiveSync = ReturnType<typeof createResponsiveSync>
