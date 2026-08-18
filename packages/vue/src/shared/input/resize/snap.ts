import type { Editor } from '@open-pencil/core/editor'
import type { SceneNode } from '@open-pencil/scene-graph'
import { getAxisAlignedWorldBounds } from '@open-pencil/scene-graph/coordinate'
import type { Rect } from '@open-pencil/scene-graph/primitives'

import { explicitSnapTargets } from '#vue/shared/input/explicit-snap-targets'
import {
  resolveObjectPixelSnap,
  worldBoundsNode,
  worldDeltaToParentLocal
} from '#vue/shared/input/snap'
import type { DragResize, HandlePosition } from '#vue/shared/input/types'

function movesLeft(handle: HandlePosition): boolean {
  return handle.includes('w')
}

function movesRight(handle: HandlePosition): boolean {
  return handle.includes('e')
}

function movesTop(handle: HandlePosition): boolean {
  return handle === 'nw' || handle === 'n' || handle === 'ne'
}

function movesBottom(handle: HandlePosition): boolean {
  return handle === 'sw' || handle === 's' || handle === 'se'
}

function resizeTargets(drag: DragResize, editor: Editor): SceneNode[] {
  const node = editor.graph.getNode(drag.nodeId)
  const parentId = node?.parentId ?? editor.state.currentPageId
  return editor.graph
    .getChildren(parentId)
    .filter((candidate) => candidate.id !== drag.nodeId)
    .map((candidate) => worldBoundsNode(candidate, editor))
}

function activeEdgeBounds(handle: HandlePosition, rect: Rect): Rect {
  const horizontal = movesLeft(handle) || movesRight(handle)
  const vertical = movesTop(handle) || movesBottom(handle)
  let x = rect.x
  let y = rect.y
  if (movesRight(handle)) x += rect.width
  if (movesBottom(handle)) y += rect.height
  return {
    x,
    y,
    width: horizontal ? 0 : rect.width,
    height: vertical ? 0 : rect.height
  }
}

function applyEdgeDelta(handle: HandlePosition, rect: Rect, dx: number, dy: number): Rect {
  let { x, y, width, height } = rect
  if (movesLeft(handle)) {
    x += dx
    width -= dx
  } else if (movesRight(handle)) {
    width += dx
  }
  if (movesTop(handle)) {
    y += dy
    height -= dy
  } else if (movesBottom(handle)) {
    height += dy
  }
  return { x, y, width: Math.max(1, width), height: Math.max(1, height) }
}

export function applyResizeSnap(
  drag: DragResize,
  rect: Rect,
  editor: Editor,
  disableSnapping: boolean
): Rect {
  if (disableSnapping || !editor.state) {
    if (editor.state) editor.state.snapGuides = []
    return rect
  }

  const node = editor.graph.getNode(drag.nodeId)
  if (!node) return rect
  const candidate = { ...node, ...rect }
  const worldBounds = getAxisAlignedWorldBounds(candidate, editor.graph)
  const activeBounds = activeEdgeBounds(drag.handle, worldBounds)
  const snap = resolveObjectPixelSnap(
    new Set([drag.nodeId]),
    activeBounds,
    resizeTargets(drag, editor),
    editor,
    explicitSnapTargets(node.parentId, editor)
  )
  const horizontal = movesLeft(drag.handle) || movesRight(drag.handle)
  const vertical = movesTop(drag.handle) || movesBottom(drag.handle)
  const localCorrection = worldDeltaToParentLocal(snap.correction, node.parentId, editor)
  const dx = horizontal ? localCorrection.x : 0
  const dy = vertical ? localCorrection.y : 0

  editor.state.snapGuides = snap.guides
  return applyEdgeDelta(drag.handle, rect, dx, dy)
}
