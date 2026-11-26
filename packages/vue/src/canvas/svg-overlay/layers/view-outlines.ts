import { createSceneGeometry } from '@kalka/core/geometry'
import type { SceneGraph, SceneNode } from '@kalka/scene-graph'
import type { Color } from '@kalka/scene-graph/primitives'

import { nodeShape, type OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import { css, type OverlayShape, type Paint } from '#vue/canvas/svg-overlay/shapes'

/** Outlines of what the design does not draw: lines of the canvas, not of the design. */
const HIDDEN_LAYER_INK: Color = { r: 0, g: 0, b: 0, a: 0.4 }
const FRAME_OUTLINE_INK: Color = { r: 0, g: 0, b: 0, a: 0.2 }
const MASK_OUTLINE_INK: Color = { r: 0.05, g: 0.6, b: 1, a: 1 }
const HIDDEN_LAYER_DASH = [3, 3] as const

const FRAME_TYPES = new Set<SceneNode['type']>(['FRAME', 'COMPONENT', 'COMPONENT_SET', 'INSTANCE'])

/** Every layer under `rootId` that `take` keeps, walking into those `enter` allows. */
function collect(
  graph: SceneGraph,
  rootId: string,
  take: (node: SceneNode, hidden: boolean) => boolean,
  enter: (node: SceneNode, hidden: boolean) => boolean = () => true
): { node: SceneNode; hidden: boolean }[] {
  const found: { node: SceneNode; hidden: boolean }[] = []
  const walk = (id: string, hiddenAbove: boolean) => {
    const node = graph.getNode(id)
    if (!node || node.internalOnly) return
    const hidden = hiddenAbove || !node.visible
    if (node.id !== rootId && take(node, hidden)) found.push({ node, hidden })
    if (node.id === rootId || enter(node, hidden))
      for (const childId of node.childIds) walk(childId, hidden)
  }
  walk(rootId, false)
  return found
}

function inNodes(
  context: OverlayContext,
  nodes: readonly SceneNode[],
  paint: Paint
): OverlayShape[] {
  const geometry = createSceneGeometry(context.graph, context.overlays.rotationPreview)
  return nodes.map((node) => ({
    type: 'group',
    matrix: geometry.screenMatrix(node, context.view),
    children: [nodeShape(node, paint)]
  }))
}

/**
 * Outline mode's hidden layers, which the design leaves out of its DOM: dashed outlines where
 * they would be, under the selection in selection-only mode.
 */
export function hiddenLayerOutlinesLayer(context: OverlayContext, pageId: string): OverlayShape[] {
  const outlines = context.overlays.outlines
  if (!outlines?.hiddenLayers) return []
  const roots = outlines.mode === 'selection' ? [...context.selectedIds] : [pageId]
  const hidden = roots.flatMap((rootId) => {
    const root = context.graph.getNode(rootId)
    const rootHidden = root ? !root.visible : false
    const below = collect(context.graph, rootId, (_node, isHidden) => isHidden).map(
      ({ node }) => node
    )
    return rootHidden && root ? [root, ...below] : below
  })
  return inNodes(context, hidden, {
    stroke: css(HIDDEN_LAYER_INK),
    strokeWidth: 1,
    dash: HIDDEN_LAYER_DASH
  })
}

/** Figma's View › Frame outlines: a faint line around every shown frame, filled or not. */
export function frameOutlinesLayer(context: OverlayContext, pageId: string): OverlayShape[] {
  if (!context.overlays.showFrameOutlines) return []
  const frames = collect(
    context.graph,
    pageId,
    (node, hidden) => !hidden && FRAME_TYPES.has(node.type),
    (_node, hidden) => !hidden
  ).map(({ node }) => node)
  return inNodes(context, frames, { stroke: css(FRAME_OUTLINE_INK), strokeWidth: 1 })
}

/** Figma's View › Mask outlines: the shape of every shown mask, which draws nothing itself. */
export function maskOutlinesLayer(context: OverlayContext, pageId: string): OverlayShape[] {
  if (!context.overlays.showMaskOutlines) return []
  const masks = collect(
    context.graph,
    pageId,
    (node, hidden) => !hidden && node.isMask,
    (_node, hidden) => !hidden
  ).map(({ node }) => node)
  return inNodes(context, masks, { stroke: css(MASK_OUTLINE_INK), strokeWidth: 1 })
}
