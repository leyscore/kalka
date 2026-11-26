import { SELECTION_COLOR } from '@kalka/core/constants'
import type { Color } from '@kalka/scene-graph/primitives'

import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import { css, type OverlayShape } from '#vue/canvas/svg-overlay/shapes'

/** rgb(242,72,34), the red Figma shows regions in that Option/Alt removes. */
const REMOVE_COLOR: Color = { r: 0.949, g: 0.282, b: 0.133, a: 1 }

/**
 * The Shape builder: every region outlined with a dashed line, the hovered one tinted, and those a
 * drag has picked filled, in blue to merge or red to remove.
 */
export function shapeBuilderLayer(context: OverlayContext): OverlayShape[] {
  const state = context.overlays.shapeBuilder
  if (!state || state.outlines.length === 0) return []
  const { panX, panY, zoom } = context.view
  const color = state.removing ? REMOVE_COLOR : SELECTION_COLOR
  const children: OverlayShape[] = state.outlines.map((d, i) => {
    const picked = state.picked.includes(i)
    const marked = picked || state.hovered === i
    const outline: OverlayShape = {
      type: 'path',
      d,
      stroke: css(color, marked ? 1 : 0.6),
      strokeWidth: 1,
      dash: marked ? undefined : [3, 3]
    }
    return marked ? { ...outline, fill: css(color, picked ? 0.35 : 0.18) } : outline
  })
  return [{ type: 'group', matrix: [zoom, 0, panX, 0, zoom, panY, 0, 0, 1], children }]
}
