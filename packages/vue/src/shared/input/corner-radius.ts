import type { Editor } from '@kalka/core/editor'
import { createSceneGeometry } from '@kalka/core/geometry'
import type { SceneNode } from '@kalka/scene-graph'
import type { Vector } from '@kalka/scene-graph/primitives'

import type {
  CornerKey,
  CornerPosition,
  CornerRadii,
  DragCornerRadius
} from '#vue/shared/input/types'

/** Layers whose corners round, which show radius handles when selected, as in Figma. */
const ROUNDED_TYPES: ReadonlySet<SceneNode['type']> = new Set([
  'RECTANGLE',
  'FRAME',
  'COMPONENT',
  'INSTANCE'
])

/** Screen pixels from a corner to its handle while the radius is smaller than that. */
const HANDLE_INSET = 12
/** The shortest side, in screen pixels, a layer needs before its handles show. */
const MIN_SCREEN_SIDE = 48
/** Screen pixels around a handle that pick it up. */
const HANDLE_HIT_RADIUS = 6
/** The handle's dot, in screen pixels. */
export const CORNER_HANDLE_RADIUS = 3.5

export const RADIUS_CORNERS: readonly CornerPosition[] = ['nw', 'ne', 'se', 'sw']

const CORNER_KEYS: Record<CornerPosition, CornerKey> = {
  nw: 'topLeftRadius',
  ne: 'topRightRadius',
  se: 'bottomRightRadius',
  sw: 'bottomLeftRadius'
}

/** The direction from each corner into the layer. */
const INWARD: Record<CornerPosition, Vector> = {
  nw: { x: 1, y: 1 },
  ne: { x: -1, y: 1 },
  se: { x: -1, y: -1 },
  sw: { x: 1, y: -1 }
}

export interface CornerRadiusHandle {
  corner: CornerPosition
  /** In the layer's own coordinates. */
  x: number
  y: number
  radius: number
}

export function cornerRadius(node: CornerRadii, corner: CornerPosition): number {
  return node.independentCorners ? node[CORNER_KEYS[corner]] : node.cornerRadius
}

/** The largest radius a corner draws: half the shorter side. */
export function maxCornerRadius(node: Pick<SceneNode, 'width' | 'height'>): number {
  return Math.max(0, Math.min(node.width, node.height) / 2)
}

/** Whether the layer shows radius handles at this zoom: a large enough box that rounds. */
export function showsCornerRadiusHandles(node: SceneNode, zoom: number): boolean {
  return (
    ROUNDED_TYPES.has(node.type) &&
    !node.locked &&
    node.textPathData === null &&
    Math.min(node.width, node.height) * zoom >= MIN_SCREEN_SIDE
  )
}

/** Where a corner's handle sits: on the radius, or a few pixels in from the corner until then. */
function handleDepth(node: SceneNode, corner: CornerPosition, zoom: number): number {
  const radius = Math.min(cornerRadius(node, corner), maxCornerRadius(node))
  return Math.min(Math.max(radius, HANDLE_INSET / zoom), maxCornerRadius(node))
}

function cornerPoint(node: Pick<SceneNode, 'width' | 'height'>, corner: CornerPosition): Vector {
  return {
    x: corner === 'ne' || corner === 'se' ? node.width : 0,
    y: corner === 'se' || corner === 'sw' ? node.height : 0
  }
}

/** The four handles of a layer, in its own coordinates. */
export function cornerRadiusHandles(node: SceneNode, zoom: number): CornerRadiusHandle[] {
  return RADIUS_CORNERS.map((corner) => {
    const depth = handleDepth(node, corner, zoom)
    const origin = cornerPoint(node, corner)
    return {
      corner,
      x: origin.x + INWARD[corner].x * depth,
      y: origin.y + INWARD[corner].y * depth,
      radius: cornerRadius(node, corner)
    }
  })
}

/** How far a local point lies into the layer from a corner, along the corner's diagonal. */
function depthFrom(node: SceneNode, corner: CornerPosition, point: Vector): number {
  const origin = cornerPoint(node, corner)
  const inward = INWARD[corner]
  return ((point.x - origin.x) * inward.x + (point.y - origin.y) * inward.y) / 2
}

function selectedRoundedNode(editor: Editor): SceneNode | null {
  if (editor.state.selectedIds.size !== 1) return null
  if (editor.state.editingTextId || editor.state.nodeEditState) return null
  const [id] = editor.state.selectedIds
  const node = editor.graph.getNode(id)
  return node && showsCornerRadiusHandles(node, editor.state.zoom) ? node : null
}

function localPoint(editor: Editor, node: SceneNode, cx: number, cy: number): Vector | null {
  return createSceneGeometry(editor.graph, editor.state.rotationPreview).toLocal(node, {
    x: cx,
    y: cy
  })
}

/** The radius handle of the selected layer under a canvas point. */
export function hitCornerRadiusHandle(
  editor: Editor,
  cx: number,
  cy: number
): { node: SceneNode; corner: CornerPosition } | null {
  const node = selectedRoundedNode(editor)
  if (!node) return null
  const point = localPoint(editor, node, cx, cy)
  if (!point) return null
  const reach = HANDLE_HIT_RADIUS / editor.state.zoom
  const handle = cornerRadiusHandles(node, editor.state.zoom).find(
    (candidate) => Math.hypot(candidate.x - point.x, candidate.y - point.y) <= reach
  )
  return handle ? { node, corner: handle.corner } : null
}

/**
 * Shows the handles while the pointer is over the selected layer, as Figma does, and lights the
 * one under it; returns the cursor a handle asks for, or null off every handle.
 */
export function hoverCornerRadiusHandle(editor: Editor, cx: number, cy: number): string | null {
  const node = selectedRoundedNode(editor)
  const point = node ? localPoint(editor, node, cx, cy) : null
  const reach = HANDLE_HIT_RADIUS / editor.state.zoom
  const over =
    node &&
    point &&
    point.x >= -reach &&
    point.y >= -reach &&
    point.x <= node.width + reach &&
    point.y <= node.height + reach
  if (!node || !over) {
    editor.setCornerRadiusHandle(null)
    return null
  }
  const hit = hitCornerRadiusHandle(editor, cx, cy)
  editor.setCornerRadiusHandle({ nodeId: node.id, corner: hit?.corner ?? null, dragging: false })
  return hit ? 'pointer' : null
}

/** Starts dragging a radius handle under the press, if there is one. */
export function tryStartCornerRadius(
  editor: Editor,
  cx: number,
  cy: number,
  altKey: boolean
): DragCornerRadius | null {
  const hit = hitCornerRadiusHandle(editor, cx, cy)
  if (!hit) return null
  const { node, corner } = hit
  editor.setCornerRadiusHandle({ nodeId: node.id, corner, dragging: true })
  return {
    type: 'corner-radius',
    nodeId: node.id,
    corner,
    single: altKey,
    startDepth: handleDepth(node, corner, editor.state.zoom),
    startRadius: Math.min(cornerRadius(node, corner), maxCornerRadius(node)),
    original: {
      cornerRadius: node.cornerRadius,
      independentCorners: node.independentCorners,
      topLeftRadius: node.topLeftRadius,
      topRightRadius: node.topRightRadius,
      bottomRightRadius: node.bottomRightRadius,
      bottomLeftRadius: node.bottomLeftRadius
    }
  }
}

/**
 * The radius for a handle dragged to `depth`: past where it was pressed the radius follows the
 * pointer, and toward the corner it shrinks to nothing at the corner itself.
 */
export function radiusAtDepth(
  d: Pick<DragCornerRadius, 'startDepth' | 'startRadius'>,
  depth: number
) {
  if (depth >= d.startDepth) return d.startRadius + (depth - d.startDepth)
  return d.startDepth > 0 ? (d.startRadius * Math.max(0, depth)) / d.startDepth : 0
}

/** The corner fields for a radius: every corner, or one corner with the others kept. */
export function cornerRadiusChanges(
  original: CornerRadii,
  corner: CornerPosition,
  radius: number,
  single: boolean
): CornerRadii {
  if (!single) {
    return {
      cornerRadius: radius,
      independentCorners: false,
      topLeftRadius: radius,
      topRightRadius: radius,
      bottomRightRadius: radius,
      bottomLeftRadius: radius
    }
  }
  const each = (key: CornerPosition) => cornerRadius(original, key)
  return {
    cornerRadius: original.cornerRadius,
    independentCorners: true,
    topLeftRadius: each('nw'),
    topRightRadius: each('ne'),
    bottomRightRadius: each('se'),
    bottomLeftRadius: each('sw'),
    [CORNER_KEYS[corner]]: radius
  }
}

export function handleCornerRadiusMove(
  d: DragCornerRadius,
  cx: number,
  cy: number,
  editor: Editor
) {
  const node = editor.graph.getNode(d.nodeId)
  if (!node) return
  const point = localPoint(editor, node, cx, cy)
  if (!point) return
  const depth = depthFrom(node, d.corner, point)
  const radius = Math.round(Math.min(maxCornerRadius(node), Math.max(0, radiusAtDepth(d, depth))))
  editor.updateNode(d.nodeId, cornerRadiusChanges(d.original, d.corner, radius, d.single))
}

/** Records the drag as one undo step. */
export function commitCornerRadius(d: DragCornerRadius, editor: Editor) {
  editor.setCornerRadiusHandle(null)
  if (!editor.graph.getNode(d.nodeId)) return
  editor.commitNodeUpdate(d.nodeId, d.original, 'Change corner radius')
}

/** Puts the corners back as they were at the press. */
export function cancelCornerRadius(d: DragCornerRadius, editor: Editor) {
  editor.setCornerRadiusHandle(null)
  if (editor.graph.getNode(d.nodeId)) editor.updateNode(d.nodeId, d.original)
}
