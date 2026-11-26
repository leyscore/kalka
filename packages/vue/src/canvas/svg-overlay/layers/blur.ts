import { SELECTION_COLOR } from '@kalka/core/constants'
import { createSceneGeometry } from '@kalka/core/geometry'
import Matrix from '@kalka/scene-graph/matrix'
import type { Vector } from '@kalka/scene-graph/primitives'

import { css, type OverlayShape } from '#vue/canvas/svg-overlay/shapes'
import { blurEnds } from '#vue/shared/input/blur'

import type { OverlayContext } from './selection'

const WHITE = css({ r: 1, g: 1, b: 1, a: 1 })
/** The soft dark edge that keeps the white line and handles visible on light layers. */
const SHADOW = css({ r: 0, g: 0, b: 0, a: 0.35 })
const ACCENT = css(SELECTION_COLOR)
/** Screen radius of the dots at the blur's ends. */
const END_RADIUS = 4.5

function dot(p: Vector, fill: string, lit: boolean): OverlayShape[] {
  return [
    { type: 'ellipse', cx: p.x, cy: p.y, rx: END_RADIUS + 1, ry: END_RADIUS + 1, fill: SHADOW },
    {
      type: 'ellipse',
      cx: p.x,
      cy: p.y,
      rx: END_RADIUS,
      ry: END_RADIUS,
      fill,
      stroke: lit ? ACCENT : WHITE,
      strokeWidth: 2
    }
  ]
}

/**
 * The progressive blur whose settings are open, drawn on its layer as Figma does: a line from
 * where the blur starts to where it is strongest, with a hollow dot at the start and a filled one
 * at the end. The hovered or dragged end is ringed in the selection color.
 */
export function blurLayer(context: OverlayContext): OverlayShape[] {
  const { graph, overlays, view, selectedIds } = context
  const edit = overlays.blurEdit
  if (!edit || overlays.editingTextId || overlays.nodeEditState) return []
  if (!selectedIds.has(edit.nodeId)) return []
  const node = graph.getNode(edit.nodeId)
  const effect = node?.effects[edit.index]
  if (!node || effect?.blurType !== 'PROGRESSIVE' || node.width <= 0 || node.height <= 0) return []

  const matrix = createSceneGeometry(graph, overlays.rotationPreview).screenMatrix(node, view)
  const toScreen = (p: Vector): Vector => {
    const [x, y] = Matrix.mapPoints(matrix, [p.x, p.y])
    return { x, y }
  }
  const ends = blurEnds(node, effect)
  const start = toScreen(ends.start)
  const end = toScreen(ends.end)
  return [
    {
      type: 'line',
      x1: start.x,
      y1: start.y,
      x2: end.x,
      y2: end.y,
      stroke: SHADOW,
      strokeWidth: 3
    },
    { type: 'line', x1: start.x, y1: start.y, x2: end.x, y2: end.y, stroke: WHITE, strokeWidth: 1 },
    ...dot(start, css({ r: 1, g: 1, b: 1, a: 0 }), edit.handle === 'start'),
    ...dot(end, WHITE, edit.handle === 'end')
  ]
}
