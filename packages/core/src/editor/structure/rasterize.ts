import type { Fill, SceneNode } from '@kalka/scene-graph'
import { getWorldMatrix } from '@kalka/scene-graph/coordinate'
import Matrix from '@kalka/scene-graph/matrix'

import { TRANSPARENT } from '#core/constants'
import { getNodeEditCapability } from '#core/editor/capabilities'
import { captureDocumentChange, restoreDocumentChange } from '#core/editor/history/document-change'
import type { EditorContext } from '#core/editor/types'
import { computeImageHash } from '#core/figma-api'

import { selectedNodesInSharedParent } from './selection'

/** A region of the page, in page coordinates, as image export draws it. */
export interface RasterBounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

/**
 * Figma's Rasterize selection, once the selection has been drawn: the selected layers give way
 * to one image of them, "Image", where the lowest of them was, filling the region the drawing
 * covers. One undo step; null when the selection cannot be replaced, such as layers of different
 * parents, a locked layer or the fixed part of an instance.
 */
export function replaceSelectionWithImage(
  ctx: EditorContext,
  bytes: Uint8Array,
  bounds: RasterBounds
): string | null {
  const nodes = [...ctx.state.selectedIds]
    .map((id) => ctx.graph.getNode(id))
    .filter((node): node is SceneNode => node !== undefined)
  if (nodes.some((node) => !getNodeEditCapability(ctx.graph, node.id).editable)) return null
  const shared = selectedNodesInSharedParent(ctx, nodes)
  const width = bounds.maxX - bounds.minX
  const height = bounds.maxY - bounds.minY
  if (!shared || width <= 0 || height <= 0) return null
  const { topLevel, parentId, parent } = shared

  const pageId = ctx.state.currentPageId
  const before = new Set(ctx.state.selectedIds)
  const finish = captureDocumentChange(ctx.graph, pageId)
  const index = Math.min(...topLevel.map((node) => parent.childIds.indexOf(node.id)))
  const inverse = parent.type === 'CANVAS' ? null : Matrix.invert(getWorldMatrix(parent, ctx.graph))
  const origin = inverse
    ? Matrix.mapPoint(inverse, { x: bounds.minX, y: bounds.minY })
    : { x: bounds.minX, y: bounds.minY }
  const hash = computeImageHash(bytes)
  ctx.graph.images.set(hash, bytes)
  const fill: Fill = {
    type: 'IMAGE',
    imageHash: hash,
    imageScaleMode: 'FILL',
    color: TRANSPARENT,
    opacity: 1,
    visible: true
  }
  const image = ctx.graph.createNode('RECTANGLE', parentId, {
    name: 'Image',
    x: origin.x,
    y: origin.y,
    width,
    height,
    fills: [fill]
  })
  ctx.graph.insertChildAt(image.id, parentId, Math.max(0, index))
  for (const node of topLevel) ctx.graph.deleteNode(node.id)
  const change = finish()
  const after = new Set([image.id])
  ctx.setSelectedIds(new Set(after))
  ctx.undo.push({
    label: 'Rasterize selection',
    forward: () => {
      restoreDocumentChange(ctx, change, 'after')
      ctx.setSelectedIds(new Set(after))
    },
    inverse: () => {
      restoreDocumentChange(ctx, change, 'before')
      ctx.setSelectedIds(new Set(before))
    }
  })
  ctx.requestRender()
  return image.id
}
