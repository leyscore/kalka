import type { GroupFitOptions, SceneGraph, SceneNode } from '@kalka/scene-graph'

import type { SkiaRenderer } from '#core/canvas'
import { booleanOperationPaints, createBooleanOperation } from '#core/editor/structure/boolean'

import { flattenedVector } from './flatten'
import { INTERNAL_ID, type FigmaNodeProxy } from './proxy'

/** The scene node behind a plugin node, given as Figma's node type or as Kalka's proxy. */
export function nodeIdOf(node: BaseNode | FigmaNodeProxy): string {
  return (node as BaseNode & { [INTERNAL_ID]: string })[INTERNAL_ID]
}

export function rawNodeOf(graph: SceneGraph, node: BaseNode | FigmaNodeProxy): SceneNode {
  const id = nodeIdOf(node)
  const raw = graph.getNode(id)
  if (!raw) throw new Error(`Node ${id} not found`)
  return raw
}

export type BooleanOperationType = 'UNION' | 'SUBTRACT' | 'INTERSECT' | 'EXCLUDE'

/** `figma.union` and its siblings: the id of the boolean layer made of `nodes` in `parentId`. */
export function booleanOperationOf(
  graph: SceneGraph,
  operation: BooleanOperationType,
  nodes: ReadonlyArray<BaseNode | FigmaNodeProxy>,
  parentId: string,
  index: number | undefined,
  fit: GroupFitOptions
): string {
  if (nodes.length < 2) throw new Error('Need at least 2 nodes for boolean operation')
  const members = nodes.map((node) => rawNodeOf(graph, node))
  const { node } = createBooleanOperation(
    graph,
    members,
    parentId,
    operation,
    index,
    booleanOperationPaints(operation, members, 'script'),
    fit
  )
  return node.id
}

/** `figma.flatten`: the id of the vector that replaces `nodes` in `parentId`. */
export function flattenOf(
  graph: SceneGraph,
  renderer: SkiaRenderer | null,
  nodes: ReadonlyArray<BaseNode | FigmaNodeProxy>,
  parentId: string,
  index: number | undefined
): string {
  if (nodes.length === 0) throw new Error('Need at least 1 node to flatten')
  const sources: SceneNode[] = []
  for (const node of nodes) {
    const raw = graph.getNode(nodeIdOf(node))
    if (!raw) throw new Error('Node not found')
    sources.push(raw)
  }
  const vector = flattenedVector(graph, renderer, sources, parentId)
  if (index != null) graph.reorderChild(vector.id, parentId, index)
  for (const node of nodes) graph.deleteNode(nodeIdOf(node))
  return vector.id
}
