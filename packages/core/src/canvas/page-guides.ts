import type { Canvas } from 'canvaskit-wasm'

import type { SceneGraph, SceneNode } from '@open-pencil/scene-graph'
import { getWorldMatrix } from '@open-pencil/scene-graph/coordinate'
import Matrix from '@open-pencil/scene-graph/matrix'

import type { RenderOverlays, SkiaRenderer } from './renderer'

const GUIDE_COLOR = { r: 0.85, g: 0.29, b: 0.2, a: 0.78 }
const GUIDE_DASH = [3, 4]

function drawOwnedGuide(
  r: SkiaRenderer,
  canvas: Canvas,
  owner: SceneNode,
  graph: SceneGraph,
  axis: 'x' | 'y',
  position: number,
  preview: boolean
): void {
  const matrix = getWorldMatrix(owner, graph)
  const start = Matrix.mapPoint(
    matrix,
    axis === 'x' ? { x: position, y: 0 } : { x: 0, y: position }
  )
  const end = Matrix.mapPoint(
    matrix,
    axis === 'x' ? { x: position, y: owner.height } : { x: owner.width, y: position }
  )
  const sx1 = start.x * r.zoom + r.panX
  const sy1 = start.y * r.zoom + r.panY
  const sx2 = end.x * r.zoom + r.panX
  const sy2 = end.y * r.zoom + r.panY
  canvas.drawLine(sx1, sy1, sx2, sy2, r.auxStroke)

  if (!preview || owner.type === 'CANVAS') return
  r.auxStroke.setPathEffect(r.ck.PathEffect.MakeDash(GUIDE_DASH, 0))
  if (axis === 'x') canvas.drawLine(sx1, 0, sx1, r.viewportHeight, r.auxStroke)
  else canvas.drawLine(0, sy1, r.viewportWidth, sy1, r.auxStroke)
  r.auxStroke.setPathEffect(null)
}

export function drawPageGuides(
  r: SkiaRenderer,
  canvas: Canvas,
  graph: SceneGraph,
  preview?: RenderOverlays['guidePreview']
): void {
  const page = graph.getNode(r.pageId ?? graph.rootId)
  if (!page) return

  r.auxStroke.setStrokeWidth(1)
  r.auxStroke.setColor(r.ck.Color4f(GUIDE_COLOR.r, GUIDE_COLOR.g, GUIDE_COLOR.b, GUIDE_COLOR.a))

  for (const guide of page.guides) {
    if (guide.axis === 'x') {
      const x = guide.position * r.zoom + r.panX
      canvas.drawRect(r.ck.LTRBRect(x, 0, x + 1, r.viewportHeight), r.auxStroke)
    } else {
      const y = guide.position * r.zoom + r.panY
      canvas.drawRect(r.ck.LTRBRect(0, y, r.viewportWidth, y + 1), r.auxStroke)
    }
  }

  for (const childId of page.childIds) {
    const node = graph.getNode(childId)
    if (!node) continue
    if (node.id === page.id || node.guides.length === 0) continue
    for (const guide of node.guides) {
      drawOwnedGuide(r, canvas, node, graph, guide.axis, guide.position, false)
    }
  }

  if (preview) {
    const owner = graph.getNode(preview.ownerId)
    if (owner) drawOwnedGuide(r, canvas, owner, graph, preview.axis, preview.position, true)
  }
}
