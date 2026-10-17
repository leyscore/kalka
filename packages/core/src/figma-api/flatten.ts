import type { SceneGraph, SceneNode } from '@kalka/scene-graph'
import { copyFills } from '@kalka/scene-graph/copy'

import type { SkiaRenderer } from '#core/canvas'
import { canMakeBooleanSourceNode } from '#core/canvas/boolean'
import { flattenNodesToVectorProps } from '#core/canvas/flatten'

/** Without a renderer there are no outlines to merge: the vector takes the first node's box. */
function placeholderVector(graph: SceneGraph, nodes: SceneNode[], parentId: string): SceneNode {
  const first = nodes[0]
  return graph.createNode('VECTOR', parentId, {
    name: 'Flatten',
    x: first.x,
    y: first.y,
    width: first.width,
    height: first.height,
    fills: copyFills(first.fills)
  })
}

/** The vector `figma.flatten` makes of `nodes` in `parentId`, before the nodes are removed. */
export function flattenedVector(
  graph: SceneGraph,
  renderer: SkiaRenderer | null,
  nodes: SceneNode[],
  parentId: string
): SceneNode {
  if (!renderer) return placeholderVector(graph, nodes, parentId)
  if (nodes.some((node) => !canMakeBooleanSourceNode(node, graph))) {
    throw new Error('Cannot flatten unsupported node type')
  }
  const vectorProps = flattenNodesToVectorProps(renderer, graph, nodes)
  if (!vectorProps) throw new Error('Cannot flatten empty node path')
  return graph.createNode('VECTOR', parentId, vectorProps)
}
