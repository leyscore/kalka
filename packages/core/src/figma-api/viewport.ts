import { computeBounds } from '@kalka/scene-graph/geometry'
import type { Rect, Vector } from '@kalka/scene-graph/primitives'

import { IS_BROWSER } from '#core/constants'

/** Where `figma.viewport` looks: its centre and zoom. */
export interface ViewportState {
  x: number
  y: number
  zoom: number
}

export interface FigmaViewport {
  center: Vector
  zoom: number
  scrollAndZoomIntoView: (nodes: readonly { absoluteBoundingBox: Rect }[]) => void
}

const PADDING = 80

/** `figma.viewport` over `state`; scrolling to layers hands the new state to `update`. */
export function figmaViewport(
  state: ViewportState,
  update: (next: ViewportState) => void
): FigmaViewport {
  return {
    center: { x: state.x, y: state.y },
    zoom: state.zoom,
    scrollAndZoomIntoView: (nodes) => {
      const b = computeBounds(nodes.map((n) => n.absoluteBoundingBox))
      if (b.width === 0 && b.height === 0 && nodes.length === 0) return

      const contentW = b.width + PADDING * 2
      const contentH = b.height + PADDING * 2
      const viewW = IS_BROWSER ? window.innerWidth : 1280
      const viewH = IS_BROWSER ? window.innerHeight : 720
      const zoom = Math.min(viewW / contentW, viewH / contentH, 1)
      update({ x: b.x + b.width / 2, y: b.y + b.height / 2, zoom })
    }
  }
}
