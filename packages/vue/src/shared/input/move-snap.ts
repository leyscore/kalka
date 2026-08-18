import type { Editor } from '@open-pencil/core/editor'
import { computeSelectionBounds } from '@open-pencil/scene-graph'
import type { SceneNode } from '@open-pencil/scene-graph'
import { getAxisAlignedWorldBounds } from '@open-pencil/scene-graph/coordinate'
import type { Rect } from '@open-pencil/scene-graph/primitives'

import { explicitSnapTargets } from '#vue/shared/input/explicit-snap-targets'
import {
  resolveObjectPixelSnap,
  worldBoundsNode,
  worldDeltaToParentLocal
} from '#vue/shared/input/snap'
import type { DragMove } from '#vue/shared/input/types'

function movingSelection(drag: DragMove, dx: number, dy: number, editor: Editor): SceneNode[] {
  const selectedNodes: SceneNode[] = []
  for (const [id, original] of drag.originals) {
    const node = editor.graph.getNode(id)
    if (!node) continue
    const bounds = getAxisAlignedWorldBounds(
      { ...node, x: original.x, y: original.y },
      editor.graph
    )
    selectedNodes.push({
      ...node,
      x: bounds.x + dx,
      y: bounds.y + dy,
      width: bounds.width,
      height: bounds.height,
      rotation: 0,
      flipX: false,
      flipY: false
    })
  }
  return selectedNodes
}

function absoluteMoveContext(
  drag: DragMove,
  bounds: Rect,
  editor: Editor
): { bounds: Rect; targets: SceneNode[] } {
  const firstId = drag.originals.keys().next().value
  const firstNode = firstId ? editor.graph.getNode(firstId) : undefined
  const parentId = firstNode?.parentId ?? editor.state.currentPageId
  return {
    bounds,
    targets: editor.graph.getChildren(parentId).map((node) => worldBoundsNode(node, editor))
  }
}

export function applyMoveSnap(
  drag: DragMove,
  dx: number,
  dy: number,
  editor: Editor,
  disableSnapping = false
): { dx: number; dy: number } {
  const selectionBounds = computeSelectionBounds(movingSelection(drag, dx, dy, editor))
  if (!selectionBounds || disableSnapping) {
    editor.setSnapGuides([])
    return { dx, dy }
  }

  const context = absoluteMoveContext(drag, selectionBounds, editor)
  const firstId = drag.originals.keys().next().value
  const firstNode = firstId ? editor.graph.getNode(firstId) : undefined
  const parentId = firstNode?.parentId ?? editor.state.currentPageId
  const snap = resolveObjectPixelSnap(
    editor.state.selectedIds,
    context.bounds,
    context.targets,
    editor,
    explicitSnapTargets(parentId, editor)
  )
  editor.setSnapGuides(snap.guides)
  const localDelta = worldDeltaToParentLocal({ x: dx, y: dy }, parentId, editor)
  const localCorrection = worldDeltaToParentLocal(snap.correction, parentId, editor)
  return {
    dx: localDelta.x + localCorrection.x,
    dy: localDelta.y + localCorrection.y
  }
}
