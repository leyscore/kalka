import type { SceneGraph, SceneNode } from '@kalka/scene-graph'
import { getWorldMatrix } from '@kalka/scene-graph/coordinate'
import { effectOverflow, strokeOverflow, type VisualBounds } from '@kalka/scene-graph/geometry'
import Matrix from '@kalka/scene-graph/matrix'

export function worldNodeVisualBounds(graph: SceneGraph, node: SceneNode): VisualBounds {
  const stroke = strokeOverflow(node.strokes, node.strokeCap, node.vectorNetwork)
  const effects = effectOverflow(node.effects)
  const points = Matrix.mapPoints(getWorldMatrix(node, graph), [
    -stroke - effects.left,
    -stroke - effects.top,
    node.width + stroke + effects.right,
    -stroke - effects.top,
    node.width + stroke + effects.right,
    node.height + stroke + effects.bottom,
    -stroke - effects.left,
    node.height + stroke + effects.bottom
  ])
  const xs = [points[0], points[2], points[4], points[6]]
  const ys = [points[1], points[3], points[5], points[7]]
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys)
  }
}
