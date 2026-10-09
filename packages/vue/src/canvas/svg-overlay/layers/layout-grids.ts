import { hasLayoutGrids, layoutGridPaints } from '@open-pencil/core/canvas'
import { createSceneGeometry } from '@open-pencil/core/geometry'
import type { SceneGraph, SceneNode } from '@open-pencil/scene-graph'

import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import { css, type OverlayShape } from '#vue/canvas/svg-overlay/shapes'

interface GridFrames {
  graph: SceneGraph
  pageId: string
  sceneVersion: number
  ids: string[]
}

/** The page's frames with layout grids, found once per scene version rather than every frame. */
let cached: GridFrames | null = null

function gridFrames(graph: SceneGraph, pageId: string, sceneVersion: number): SceneNode[] {
  if (cached?.graph !== graph || cached.pageId !== pageId || cached.sceneVersion !== sceneVersion) {
    const ids: string[] = []
    const visit = (id: string) => {
      const node = graph.getNode(id)
      if (!node || !node.visible || node.internalOnly) return
      if (node.type !== 'CANVAS' && hasLayoutGrids(node)) ids.push(id)
      for (const child of node.childIds) visit(child)
    }
    visit(pageId)
    cached = { graph, pageId, sceneVersion, ids }
  }
  return cached.ids
    .map((id) => graph.getNode(id))
    .filter((node): node is SceneNode => node !== undefined)
}

/** Frames' layout grids, column, row, and square, over their content as Figma shows them. */
export function layoutGridsLayer(
  context: OverlayContext,
  pageId: string,
  sceneVersion: number
): OverlayShape[] {
  const frames = gridFrames(context.graph, pageId, sceneVersion)
  if (frames.length === 0) return []
  const geometry = createSceneGeometry(context.graph, context.overlays.rotationPreview)
  return frames.map((node) => ({
    type: 'group',
    matrix: geometry.screenMatrix(node, context.view),
    children: layoutGridPaints(node).flatMap(({ color, rects }) =>
      rects.map(([x, y, width, height]) => ({
        type: 'rect',
        x,
        y,
        width,
        height,
        fill: css(color)
      }))
    )
  }))
}
