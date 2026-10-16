import { isEqual } from 'es-toolkit'
import { pick } from 'es-toolkit/object'

import type { CSSDeclarations, SceneNode } from '@kalka/scene-graph'
import type { Rect, Vector } from '@kalka/scene-graph/primitives'
import { createResizeSnapshot, type ResizeSnapshot } from '@kalka/scene-graph/resize'
import type { UndoEntry } from '@kalka/scene-graph/undo'

import { assertNodeEditable } from './capabilities'
import { restoreSubtree, snapshotSubtree } from './clipboard/subtree-history'
import {
  capturePageChange as startPageChange,
  restorePageChange as applyPageChangeToEditor,
  type PageChange
} from './history/page-change'
import { collectNodePositions, pushPositionUndo } from './history/position'
import {
  restorePageFromSnapshot as restorePageSnapshot,
  snapshotPage as createPageSnapshot,
  type PageSnapshot
} from './history/snapshot'
import { textAutoResizeChanges } from './text/auto-resize'
import type { EditorContext } from './types'

/** Where a moved layer was, or ends up; its CSS when the move recorded it. */
export interface MoveOriginal {
  x: number
  y: number
  parentId: string
  style?: CSSDeclarations
}

function movedTo({ x, y, style }: MoveOriginal): Partial<SceneNode> {
  // A copy: the move's record may come from reactive state, which cannot be cloned.
  return style ? { x, y, style: { ...style } } : { x, y }
}

type ResizeOriginal = Rect &
  Partial<
    Pick<
      SceneNode,
      | 'vectorNetwork'
      | 'fillGeometry'
      | 'strokeGeometry'
      | 'derivedTextGlyphs'
      | 'strokes'
      | 'textPathData'
      | 'textPathBox'
      | 'style'
    >
  >

/**
 * Records root subtrees that were just created: redo re-creates any that are missing and selects
 * them, undo deletes them and restores the previous selection.
 */
export function pushCreatedSubtreesUndo(
  ctx: EditorContext,
  label: string,
  rootIds: string[],
  previousSelection: Set<string>
) {
  const snapshots = new Map<string, SceneNode>()
  for (const id of rootIds) {
    const subtree = snapshotSubtree(ctx.graph, id)
    for (const [nodeId, snapshot] of subtree) snapshots.set(nodeId, snapshot)
  }
  const nextSelection = new Set(rootIds)

  ctx.undo.push({
    label,
    forward: () => {
      for (const id of rootIds) {
        if (ctx.graph.getNode(id)) continue
        const snapshot = snapshots.get(id)
        if (!snapshot) continue
        restoreSubtree(ctx.graph, snapshot, snapshot.parentId ?? ctx.state.currentPageId, snapshots)
        ctx.runLayoutForNode(id)
      }
      ctx.setSelectedIds(new Set(nextSelection))
    },
    inverse: () => {
      for (const id of rootIds.toReversed()) ctx.graph.deleteNode(id)
      ctx.setSelectedIds(new Set(previousSelection))
    }
  })
}

export function createUndoActions(ctx: EditorContext) {
  function commitMove(originals: Map<string, Vector>) {
    for (const id of originals.keys()) assertNodeEditable(ctx.graph, id)
    pushPositionUndo(ctx, 'Move', originals, collectNodePositions(ctx, originals.keys()))
  }

  /** `style` is the layer's CSS before the move, which the move may have let give way. */
  function commitMoveWithReparent(originals: Map<string, MoveOriginal>) {
    for (const id of originals.keys()) assertNodeEditable(ctx.graph, id)
    const finals = new Map<string, MoveOriginal>()
    for (const [id] of originals) {
      const n = ctx.graph.getNode(id)
      if (n)
        finals.set(id, {
          x: n.x,
          y: n.y,
          parentId: n.parentId ?? ctx.state.currentPageId,
          style: { ...n.style }
        })
    }
    ctx.undo.push({
      label: 'Move',
      forward: () => {
        for (const [id, pos] of finals) {
          ctx.graph.reparentNode(id, pos.parentId)
          ctx.graph.updateNode(id, movedTo(pos))
          ctx.runLayoutForNode(id)
        }
      },
      inverse: () => {
        for (const [id, pos] of originals) {
          ctx.graph.reparentNode(id, pos.parentId)
          ctx.graph.updateNode(id, movedTo(pos))
          ctx.runLayoutForNode(id)
        }
      }
    })
  }

  function commitDuplicateMove(rootIds: string[], previousSelection: Set<string>) {
    pushCreatedSubtreesUndo(ctx, 'Duplicate', rootIds, previousSelection)
  }

  function commitResize(nodeId: string, original: ResizeOriginal) {
    assertNodeEditable(ctx.graph, nodeId)
    const node = ctx.graph.getNode(nodeId)
    if (!node) return
    // Snapshot full geometry when the inverse payload carries any of it
    // (vector/path-text resize); plain rect-only resize stays lightweight.
    const hasGeometry =
      'vectorNetwork' in original ||
      'fillGeometry' in original ||
      'strokeGeometry' in original ||
      'derivedTextGlyphs' in original ||
      'strokes' in original ||
      'textPathData' in original ||
      'textPathBox' in original
    const final: ResizeOriginal = hasGeometry
      ? createResizeSnapshot(node)
      : { x: node.x, y: node.y, width: node.width, height: node.height, style: { ...node.style } }
    ctx.undo.push({
      label: 'Resize',
      forward: () => {
        assertNodeEditable(ctx.graph, nodeId)
        // Geometric replay — keep the raw Figma payload (see commitResizePreview).
        ctx.graph.preserveSourceMetadataDuring(() => ctx.graph.updateNode(nodeId, final))
        ctx.runLayoutForNode(nodeId)
      },
      inverse: () => {
        assertNodeEditable(ctx.graph, nodeId)
        ctx.graph.preserveSourceMetadataDuring(() => ctx.graph.updateNode(nodeId, original))
        ctx.runLayoutForNode(nodeId)
      }
    })
  }

  function commitGroupResize(
    nodeId: string,
    origRect: Rect & Partial<Pick<SceneNode, 'style'>>,
    origChildren: Map<string, ResizeSnapshot>
  ) {
    assertNodeEditable(ctx.graph, nodeId)
    for (const childId of origChildren.keys()) assertNodeEditable(ctx.graph, childId)
    const node = ctx.graph.getNode(nodeId)
    if (!node) return
    const finalRect = {
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      style: { ...node.style }
    }
    const finalChildren = new Map<string, ResizeSnapshot>()
    for (const [childId] of origChildren) {
      const child = ctx.graph.getNode(childId)
      if (child) finalChildren.set(childId, createResizeSnapshot(child))
    }
    ctx.undo.push({
      label: 'Resize',
      forward: () => {
        assertNodeEditable(ctx.graph, nodeId)
        for (const childId of finalChildren.keys()) assertNodeEditable(ctx.graph, childId)
        // Geometric replay — keep the raw Figma payload (see commitResizePreview).
        ctx.graph.preserveSourceMetadataDuring(() => {
          ctx.graph.updateNode(nodeId, finalRect)
          for (const [childId, final] of finalChildren) ctx.graph.updateNode(childId, final)
        })
        ctx.runLayoutForNode(nodeId)
      },
      inverse: () => {
        assertNodeEditable(ctx.graph, nodeId)
        for (const childId of origChildren.keys()) assertNodeEditable(ctx.graph, childId)
        ctx.graph.preserveSourceMetadataDuring(() => {
          ctx.graph.updateNode(nodeId, origRect)
          for (const [childId, orig] of origChildren) ctx.graph.updateNode(childId, orig)
        })
        ctx.runLayoutForNode(nodeId)
      }
    })
  }

  function commitRotation(nodeId: string, origRotation: number) {
    assertNodeEditable(ctx.graph, nodeId)
    const node = ctx.graph.getNode(nodeId)
    if (!node) return
    const finalRotation = node.rotation
    ctx.undo.push({
      label: 'Rotate',
      forward: () => {
        ctx.graph.updateNode(nodeId, { rotation: finalRotation })
      },
      inverse: () => {
        ctx.graph.updateNode(nodeId, { rotation: origRotation })
      }
    })
  }

  function commitNodeUpdate(nodeId: string, previous: Partial<SceneNode>, label = 'Update') {
    assertNodeEditable(ctx.graph, nodeId)
    const node = ctx.graph.getNode(nodeId)
    if (!node) return
    const restoredPrevious = { ...previous, ...textAutoResizeChanges(node, previous) }
    const current = pick(
      node,
      Object.keys(restoredPrevious) as (keyof SceneNode)[]
    ) as Partial<SceneNode>
    if (isEqual(current, restoredPrevious)) return
    ctx.undo.push({
      label,
      forward: () => {
        ctx.graph.updateNode(nodeId, current)
        ctx.runLayoutForNode(nodeId)
      },
      inverse: () => {
        ctx.graph.updateNode(nodeId, restoredPrevious)
        ctx.runLayoutForNode(nodeId)
      }
    })
  }

  function undoAction(validateEnteredContainer: () => void) {
    ctx.undo.undo()
    validateEnteredContainer()
    ctx.requestRender()
  }

  function redoAction(validateEnteredContainer: () => void) {
    ctx.undo.redo()
    validateEnteredContainer()
    ctx.requestRender()
  }

  function snapshotPage(pageId = ctx.state.currentPageId): PageSnapshot {
    return createPageSnapshot(ctx.graph, pageId)
  }

  function restorePageFromSnapshot(snapshot: PageSnapshot) {
    restorePageSnapshot(ctx, snapshot)
  }

  /** Starts recording an edit to a page; the returned function ends it with what changed. */
  function capturePageChange(pageId = ctx.state.currentPageId): () => PageChange {
    return startPageChange(ctx.graph, pageId)
  }

  function restorePageChange(change: PageChange, side: 'before' | 'after') {
    applyPageChangeToEditor(ctx, change, side)
  }

  function pushUndoEntry(entry: UndoEntry) {
    ctx.undo.push(entry)
  }

  return {
    commitMove,
    commitMoveWithReparent,
    commitDuplicateMove,
    commitResize,
    commitGroupResize,
    commitRotation,
    commitNodeUpdate,
    undoAction,
    redoAction,
    snapshotPage,
    restorePageFromSnapshot,
    capturePageChange,
    restorePageChange,
    pushUndoEntry
  }
}
