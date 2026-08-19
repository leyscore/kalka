import type { Canvas } from 'canvaskit-wasm'

import type { SceneGraph } from '@open-pencil/scene-graph'

import { SELECTION_COLOR } from '#core/constants'

import type { SkiaRenderer } from './renderer'

export function drawPageGuides(r: SkiaRenderer, canvas: Canvas, graph: SceneGraph): void {
  const page = graph.getNode(r.pageId ?? graph.rootId)
  if (!page || page.guides.length === 0) return

  r.auxStroke.setStrokeWidth(1)
  r.auxStroke.setColor(r.ck.Color4f(SELECTION_COLOR.r, SELECTION_COLOR.g, SELECTION_COLOR.b, 0.65))

  for (const guide of page.guides) {
    if (guide.axis === 'x') {
      const x = guide.position * r.zoom + r.panX
      canvas.drawRect(r.ck.LTRBRect(x, 0, x + 1, r.viewportHeight), r.auxStroke)
    } else {
      const y = guide.position * r.zoom + r.panY
      canvas.drawRect(r.ck.LTRBRect(0, y, r.viewportWidth, y + 1), r.auxStroke)
    }
  }
}
