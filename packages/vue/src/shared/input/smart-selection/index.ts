import { markRaw } from 'vue'

import { smartGapPositions, smartReorder, smartSlotAt } from '@kalka/core/editor'
import type { Editor } from '@kalka/core/editor'
import type { Vector } from '@kalka/scene-graph/primitives'

import {
  hitSmartSelection,
  smartSelectionChrome,
  type SmartSelectionChrome,
  type SmartSelectionHit
} from '#vue/shared/input/smart-selection/geometry'
import type { DragSmartSelection } from '#vue/shared/input/types'

/** The smart selection chrome while it can be used: the Select tool, nothing being edited. */
export function activeSmartSelection(editor: Editor): SmartSelectionChrome | null {
  const { state } = editor
  if (state.activeTool !== 'SELECT' || state.viewOnly || state.play) return null
  if (state.editingTextId || state.nodeEditState || state.selectedIds.size < 2) return null
  const chrome = smartSelectionChrome(editor.graph, state.selectedIds, state.zoom)
  return chrome.handles || chrome.tidy ? chrome : null
}

function hitAt(editor: Editor, cx: number, cy: number): SmartSelectionHit | null {
  const chrome = activeSmartSelection(editor)
  return chrome ? hitSmartSelection(chrome, { x: cx, y: cy }, editor.state.zoom) : null
}

function cursorFor(hit: SmartSelectionHit): string {
  if (hit.kind === 'gap') return hit.axis === 'x' ? 'ew-resize' : 'ns-resize'
  return hit.kind === 'center' ? 'grab' : 'pointer'
}

/** Lights the smart selection handle under the pointer; returns the cursor it asks for. */
export function hoverSmartSelection(editor: Editor, cx: number, cy: number): string | null {
  const hit = hitAt(editor, cx, cy)
  editor.setSmartSelectionHandle(hit ? { ...hit, dragging: false } : null)
  return hit ? cursorFor(hit) : null
}

function positionsOf(editor: Editor, ids: Iterable<string>): Map<string, Vector> {
  const positions = new Map<string, Vector>()
  for (const id of ids) {
    const node = editor.graph.getNode(id)
    if (node) positions.set(id, { x: node.x, y: node.y })
  }
  return positions
}

/**
 * Starts a drag of the smart selection handle under the press, or runs Tidy up when the press
 * is on its button. Returns the drag, `'tidied'`, or null when nothing is under the press.
 */
export function tryStartSmartSelection(
  editor: Editor,
  cx: number,
  cy: number
): DragSmartSelection | 'tidied' | null {
  const chrome = activeSmartSelection(editor)
  const hit = chrome ? hitSmartSelection(chrome, { x: cx, y: cy }, editor.state.zoom) : null
  if (!chrome || !hit) return null
  if (hit.kind === 'tidy') {
    editor.tidyNodes([...editor.state.selectedIds])
    editor.setSmartSelectionHandle(null)
    return 'tidied'
  }
  const grid = chrome.handles?.grid
  if (!grid) return null
  editor.setSmartSelectionHandle({ ...hit, dragging: true })
  const ids = grid.rows.flat().map((item) => item.id)
  // The drag lives in a ref; kept raw, the layout it starts from stays plain data.
  const base = {
    grid: markRaw(grid),
    start: { x: cx, y: cy },
    original: markRaw(positionsOf(editor, ids))
  }
  if (hit.kind === 'gap') {
    const startGap = hit.axis === 'x' ? grid.columnGap : grid.rowGap
    return { type: 'smart-gap', axis: hit.axis, startGap, gap: startGap, ...base }
  }
  return { type: 'smart-reorder', nodeId: hit.nodeId, slot: -1, ...base }
}

function reorderTargets(d: Extract<DragSmartSelection, { type: 'smart-reorder' }>, point: Vector) {
  const slot = smartSlotAt(d.grid, d.nodeId, point)
  return { slot, positions: smartReorder(d.grid, d.nodeId, slot).positions }
}

/** Drags every gap along the axis, or the grabbed layer with the others closing up around it. */
export function handleSmartSelectionMove(
  d: DragSmartSelection,
  cx: number,
  cy: number,
  editor: Editor
) {
  if (d.type === 'smart-gap') {
    const delta = d.axis === 'x' ? cx - d.start.x : cy - d.start.y
    d.gap = Math.max(0, Math.round(d.startGap + delta))
    editor.arrangeNodes(smartGapPositions(d.grid, d.axis, d.gap))
    return
  }
  const { slot, positions } = reorderTargets(d, { x: cx, y: cy })
  d.slot = slot
  const item = d.grid.rows.flat().find((cell) => cell.id === d.nodeId)
  // The grabbed layer follows the pointer; it takes its slot when it is let go.
  if (item) positions.set(d.nodeId, { x: item.x + cx - d.start.x, y: item.y + cy - d.start.y })
  editor.arrangeNodes(positions)
}

/** Records the drag as one undo step: the new spacing, or the layer in its new slot. */
export function commitSmartSelection(d: DragSmartSelection, editor: Editor) {
  editor.setSmartSelectionHandle(null)
  if (d.type === 'smart-reorder') {
    if (d.slot < 0) return
    editor.arrangeNodes(smartReorder(d.grid, d.nodeId, d.slot).positions)
    editor.commitArrangement(d.original, 'Reorder layers')
    return
  }
  editor.commitArrangement(d.original, 'Update spacing')
}

/** Puts the layers back where they were at the press. */
export function cancelSmartSelection(d: DragSmartSelection, editor: Editor) {
  editor.setSmartSelectionHandle(null)
  for (const [id, position] of d.original) {
    if (editor.graph.getNode(id)) editor.updateNode(id, position)
  }
}
