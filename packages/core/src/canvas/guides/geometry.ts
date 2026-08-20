import type { SceneGraph, SceneNode } from '@open-pencil/scene-graph'
import { getWorldMatrix } from '@open-pencil/scene-graph/coordinate'
import type { CanvasGuide } from '@open-pencil/scene-graph/guides'
import Matrix from '@open-pencil/scene-graph/matrix'

export interface GuideViewport {
  panX: number
  panY: number
  zoom: number
  width: number
  height: number
}

export interface GuideScreenSegment {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface GuideHit {
  ownerId: string
  guideId: string
  axis: CanvasGuide['axis']
  position: number
  distance: number
}

export function getGuideScreenSegment(
  graph: SceneGraph,
  owner: SceneNode,
  guide: Pick<CanvasGuide, 'axis' | 'position'>,
  viewport: GuideViewport
): GuideScreenSegment {
  if (owner.type === 'CANVAS') {
    if (guide.axis === 'x') {
      const x = guide.position * viewport.zoom + viewport.panX
      return { x1: x, y1: 0, x2: x, y2: viewport.height }
    }
    const y = guide.position * viewport.zoom + viewport.panY
    return { x1: 0, y1: y, x2: viewport.width, y2: y }
  }

  const matrix = getWorldMatrix(owner, graph)
  const start = Matrix.mapPoint(
    matrix,
    guide.axis === 'x' ? { x: guide.position, y: 0 } : { x: 0, y: guide.position }
  )
  const end = Matrix.mapPoint(
    matrix,
    guide.axis === 'x'
      ? { x: guide.position, y: owner.height }
      : { x: owner.width, y: guide.position }
  )
  return {
    x1: start.x * viewport.zoom + viewport.panX,
    y1: start.y * viewport.zoom + viewport.panY,
    x2: end.x * viewport.zoom + viewport.panX,
    y2: end.y * viewport.zoom + viewport.panY
  }
}

export function distanceToGuideSegment(x: number, y: number, segment: GuideScreenSegment): number {
  const dx = segment.x2 - segment.x1
  const dy = segment.y2 - segment.y1
  const lengthSquared = dx * dx + dy * dy
  const t =
    lengthSquared === 0
      ? 0
      : Math.max(0, Math.min(1, ((x - segment.x1) * dx + (y - segment.y1) * dy) / lengthSquared))
  return Math.hypot(x - (segment.x1 + t * dx), y - (segment.y1 + t * dy))
}

export function hitTestGuides(
  graph: SceneGraph,
  pageId: string,
  viewport: GuideViewport,
  x: number,
  y: number,
  tolerance = 5
): GuideHit | null {
  const page = graph.getNode(pageId)
  if (!page) return null
  let closest: GuideHit | null = null

  const visit = (owner: SceneNode) => {
    for (const guide of owner.guides) {
      const distance = distanceToGuideSegment(
        x,
        y,
        getGuideScreenSegment(graph, owner, guide, viewport)
      )
      if (distance <= tolerance && (!closest || distance < closest.distance)) {
        closest = {
          ownerId: owner.id,
          guideId: guide.id,
          axis: guide.axis,
          position: guide.position,
          distance
        }
      }
    }
    for (const childId of owner.childIds) {
      const child = graph.getNode(childId)
      if (child) visit(child)
    }
  }

  visit(page)
  return closest
}
