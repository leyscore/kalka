import { hasLayoutGrids, layoutGridPaints, PageIndex } from '@kalka/core/canvas'
import { createSceneGeometry } from '@kalka/core/geometry'
import type { SceneGraph, SceneNode } from '@kalka/scene-graph'

import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import { css, type OverlayShape } from '#vue/canvas/svg-overlay/shapes'

/** Fields that hide a layer and its frames from the walk, which takes it again. */
const WALK_FIELDS = new Set<string>(['visible', 'internalOnly', 'type'])
/** Fields a frame's grids are read from. */
const GRID_FIELDS = new Set<string>(['layoutGrids', 'source'])

function findGridFrames(graph: SceneGraph, pageId: string): Set<string> {
  const ids = new Set<string>()
  const visit = (id: string) => {
    const node = graph.getNode(id)
    if (!node || !node.visible || node.internalOnly) return
    if (node.type !== 'CANVAS' && hasLayoutGrids(node)) ids.add(id)
    for (const child of node.childIds) visit(child)
  }
  visit(pageId)
  return ids
}

/**
 * The page's frames with layout grids, found by walking the page once and again only after an
 * edit that adds, removes, hides or moves a layer, or gives a layer grids or takes them away.
 */
export function createGridFrames(): PageIndex<Set<string>> {
  return new PageIndex({
    build: findGridFrames,
    affects: (change, ids, graph) => {
      if (change.kind === 'structure') return true
      const keys = Object.keys(change.changes)
      if (keys.some((key) => WALK_FIELDS.has(key))) return true
      if (!keys.some((key) => GRID_FIELDS.has(key))) return false
      const node = graph.getNode(change.id)
      return !!node && hasLayoutGrids(node) !== ids.has(change.id)
    }
  })
}

/** Frames' layout grids, column, row, and square, over their content as Figma shows them. */
export function layoutGridsLayer(
  context: OverlayContext,
  pageId: string,
  gridFrames: PageIndex<Set<string>>
): OverlayShape[] {
  const ids = gridFrames.get(context.graph, pageId)
  if (ids.size === 0) return []
  const frames = [...ids]
    .map((id) => context.graph.getNode(id))
    .filter((node): node is SceneNode => node !== undefined)
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
