import { onScopeDispose, toRaw } from 'vue'

import type { Editor, WidthHandle } from '@kalka/core/editor'
import {
  nearestOnCenterline,
  pointAtLength,
  strokeCenterlines,
  widthProfileFunction,
  type Centerline
} from '@kalka/core/vector'
import { sortedWidthProfile, type SceneNode, type StrokeWidthPoint } from '@kalka/scene-graph'
import { getWorldMatrix } from '@kalka/scene-graph/coordinate'
import Matrix from '@kalka/scene-graph/matrix'
import type { Vector } from '@kalka/scene-graph/primitives'

import type { DragWidth } from '#vue/shared/input/types'

/** Screen pixels within which a press grabs a handle or the pointer reaches the path. */
const HANDLE_REACH = 7
const PATH_REACH = 10
const MIN_WIDTH = 0.01

/** The selected path the tool works on: one vector or line with a visible stroke. */
function widthTarget(editor: Editor): SceneNode | null {
  if (editor.state.activeTool !== 'VARIABLE_WIDTH' || editor.state.selectedIds.size !== 1) {
    return null
  }
  const [id] = editor.state.selectedIds
  const node = editor.graph.getNode(id)
  if (!node || node.locked || (node.type !== 'VECTOR' && node.type !== 'LINE')) return null
  return node.strokes.some((stroke) => stroke.visible) ? node : null
}

function strokeWeight(node: SceneNode): number {
  return node.strokes.find((stroke) => stroke.visible)?.weight ?? node.strokeWeight
}

interface Frame {
  node: SceneNode
  lines: Centerline[]
  toPage: (point: Vector) => Vector
  toLocal: (point: Vector) => Vector
}

function frameOf(editor: Editor, node: SceneNode): Frame | null {
  const world = getWorldMatrix(node, editor.graph)
  const inverse = Matrix.invert(world)
  if (!inverse) return null
  return {
    node,
    lines: strokeCenterlines(node),
    toPage: (point) => Matrix.mapPoint(world, point),
    toLocal: (point) => Matrix.mapPoint(inverse, point)
  }
}

/** The handle at arc length `at` of a line, in node coordinates. */
function localHandle(frame: Frame, line: Centerline, at: number): WidthHandle {
  const point = pointAtLength(line, at)
  const widths = widthProfileFunction(frame.node.strokeWidthProfile)(at / line.length)
  const weight = strokeWeight(frame.node)
  // Left of the path looking along it, on a y-down canvas.
  const nx = point.ty
  const ny = -point.tx
  return {
    center: { x: point.x, y: point.y },
    left: { x: point.x + nx * widths.ascent * weight, y: point.y + ny * widths.ascent * weight },
    right: { x: point.x - nx * widths.descent * weight, y: point.y - ny * widths.descent * weight }
  }
}

function pageHandle(frame: Frame, handle: WidthHandle): WidthHandle {
  return {
    center: frame.toPage(handle.center),
    left: frame.toPage(handle.left),
    right: frame.toPage(handle.right)
  }
}

/** Every width point's handle on every subpath, with the line and point it belongs to. */
function handlesOf(frame: Frame) {
  const profile = sortedWidthProfile(frame.node.strokeWidthProfile)
  return frame.lines.flatMap((line) =>
    profile.map((point, index) => ({
      index,
      line,
      handle: localHandle(frame, line, point.position * line.length)
    }))
  )
}

function show(
  editor: Editor,
  frame: Frame | null,
  hover: WidthHandle | null,
  active: number | null
) {
  const next = frame
    ? {
        nodeId: frame.node.id,
        handles: handlesOf(frame).map(({ handle }) => pageHandle(frame, handle)),
        active,
        hover: hover ? pageHandle(frame, hover) : null
      }
    : null
  if (next === null && editor.state.widthEdit === null) return
  editor.state.widthEdit = next
  editor.requestRepaint()
}

/** The width point picked last on the path, which Delete removes; null when none is. */
function pickedPoint(editor: Editor, node: SceneNode): number | null {
  const edit = editor.state.widthEdit
  return edit?.nodeId === node.id ? edit.active : null
}

/**
 * Removes the picked width point, as Delete does in Figma, in one undo step. A profile left
 * with a uniform stroke is cleared, so the stroke is plain again. Returns whether one was removed.
 */
export function deletePickedWidthPoint(editor: Editor): boolean {
  const node = widthTarget(editor)
  const index = node ? pickedPoint(editor, node) : null
  if (!node || index === null) return false
  const original = node.strokeWidthProfile.map((point) => ({ ...point }))
  const profile = sortedWidthProfile(original).filter((_, at) => at !== index)
  const uniform = profile.every((point) => point.ascent === 0.5 && point.descent === 0.5)
  editor.updateNode(node.id, { strokeWidthProfile: uniform ? [] : profile })
  editor.commitNodeUpdate(node.id, { strokeWidthProfile: original }, 'Delete width point')
  const updated = widthTarget(editor)
  show(editor, updated ? frameOf(editor, updated) : null, null, null)
  return true
}

/** Shows the tool's handles while it is on and a path is selected, and hides them otherwise. */
export function bindVariableWidth(editor: Editor) {
  const refresh = () => {
    const node = widthTarget(editor)
    show(editor, node ? frameOf(editor, node) : null, null, null)
  }
  const stopTool = editor.onEditorEvent('tool:changed', refresh)
  const stopSelection = editor.onEditorEvent('selection:changed', refresh)
  onScopeDispose(() => {
    stopTool()
    stopSelection()
    editor.state.widthEdit = null
  })
}

/** Where on the path the pointer is, if it is on the stroke or close to it. */
function pathUnder(frame: Frame, cx: number, cy: number, zoom: number) {
  const local = frame.toLocal({ x: cx, y: cy })
  const weight = strokeWeight(frame.node)
  let best: { line: Centerline; at: number; distance: number; side: 1 | -1 } | null = null
  for (const line of frame.lines) {
    const found = nearestOnCenterline(line, local.x, local.y)
    if (!best || found.distance < best.distance) best = { line, ...found }
  }
  if (!best) return null
  const widths = widthProfileFunction(frame.node.strokeWidthProfile)(best.at / best.line.length)
  const reach = Math.max(widths.ascent, widths.descent) * weight + PATH_REACH / zoom
  return best.distance <= reach ? best : null
}

/** Shows where a press would add a width point while the tool is over the selected path. */
export function updateVariableWidthHover(cx: number, cy: number, editor: Editor) {
  const node = widthTarget(editor)
  if (!node) {
    show(editor, null, null, null)
    return
  }
  const frame = frameOf(editor, node)
  if (!frame) return
  const under = pathUnder(frame, cx, cy, editor.state.zoom)
  const hover = under ? localHandle(frame, under.line, under.at) : null
  show(editor, frame, hover, pickedPoint(editor, node))
}

/** The profile a drag starts from: a uniform stroke gets points at its ends first, as in Figma. */
function startingProfile(node: SceneNode): StrokeWidthPoint[] {
  const profile = sortedWidthProfile(node.strokeWidthProfile)
  if (profile.length > 0) return profile
  return [
    { position: 0, ascent: 0.5, descent: 0.5 },
    { position: 1, ascent: 0.5, descent: 0.5 }
  ]
}

/**
 * A press with the Variable width tool (Shift+W): on a handle's edge it drags the stroke's width
 * there, on its centre it slides the point along the path, and elsewhere on the stroke it adds a
 * point and drags its width. Alt changes one side only. Null when the press misses the path.
 */
export function startVariableWidthDrag(
  cx: number,
  cy: number,
  altKey: boolean,
  editor: Editor
): DragWidth | null {
  const node = widthTarget(editor)
  const frame = node ? frameOf(editor, node) : null
  if (!node || !frame) return null
  const reach = HANDLE_REACH / editor.state.zoom
  const pointer = { x: cx, y: cy }
  const near = (point: Vector) => Math.hypot(point.x - pointer.x, point.y - pointer.y) <= reach
  const original = node.strokeWidthProfile.map((point) => ({ ...point }))
  for (const { index, line, handle } of handlesOf(frame)) {
    const page = pageHandle(frame, handle)
    const lineIndex = frame.lines.indexOf(line)
    if (near(page.left) || near(page.right)) {
      const side = near(page.left) ? 'left' : 'right'
      return {
        type: 'width',
        nodeId: node.id,
        index,
        line: lineIndex,
        mode: altKey ? side : 'both',
        original
      }
    }
    if (near(page.center)) {
      return { type: 'width', nodeId: node.id, index, line: lineIndex, mode: 'move', original }
    }
  }
  const under = pathUnder(frame, cx, cy, editor.state.zoom)
  if (!under) {
    show(editor, frame, null, null)
    return null
  }
  const position = under.at / under.line.length
  const widths = widthProfileFunction(original)(position)
  const profile = [...startingProfile(node), { position, ...widths }].sort(
    (a, b) => a.position - b.position
  )
  editor.updateNode(node.id, { strokeWidthProfile: profile })
  const index = profile.findIndex((point) => point.position === position)
  const mode = altKey ? (under.side === 1 ? 'left' : 'right') : 'both'
  return {
    type: 'width',
    nodeId: node.id,
    index,
    line: frame.lines.indexOf(under.line),
    mode,
    original
  }
}

export function moveVariableWidthDrag(drag: DragWidth, cx: number, cy: number, editor: Editor) {
  const node = editor.graph.getNode(drag.nodeId)
  const frame = node ? frameOf(editor, node) : null
  const line = frame?.lines[drag.line]
  if (!node || !frame || !line) return
  const profile = sortedWidthProfile(node.strokeWidthProfile)
  const point = profile.at(drag.index)
  if (!point) return
  const local = frame.toLocal({ x: cx, y: cy })
  if (drag.mode === 'move') {
    const before = profile[drag.index - 1]?.position ?? 0
    const after = profile[drag.index + 1]?.position ?? 1
    const at = nearestOnCenterline(line, local.x, local.y).at / line.length
    profile[drag.index] = { ...point, position: Math.max(before, Math.min(after, at)) }
  } else {
    const center = pointAtLength(line, point.position * line.length)
    // Signed distance along the left normal (ty, -tx).
    const across = (local.x - center.x) * center.ty - (local.y - center.y) * center.tx
    const width = Math.max(MIN_WIDTH, Math.abs(across) / Math.max(strokeWeight(node), 1e-6))
    if (drag.mode === 'both') profile[drag.index] = { ...point, ascent: width, descent: width }
    else if (drag.mode === 'left') profile[drag.index] = { ...point, ascent: width }
    else profile[drag.index] = { ...point, descent: width }
  }
  editor.updateNode(node.id, { strokeWidthProfile: profile })
  show(editor, frameOf(editor, { ...node, strokeWidthProfile: profile }), null, drag.index)
}

/** Keeps the drag as one undo step, or puts the profile back; the point stays picked. */
export function finishVariableWidthDrag(drag: DragWidth, editor: Editor, commit: boolean) {
  // Drag state is reactive; its profile must reach the graph as plain data.
  const original = toRaw(drag.original).map((point) => ({ ...toRaw(point) }))
  if (commit) {
    editor.commitNodeUpdate(drag.nodeId, { strokeWidthProfile: original }, 'Change stroke width')
  } else {
    editor.updateNode(drag.nodeId, { strokeWidthProfile: original })
  }
  const node = widthTarget(editor)
  show(editor, node ? frameOf(editor, node) : null, null, commit ? drag.index : null)
}
