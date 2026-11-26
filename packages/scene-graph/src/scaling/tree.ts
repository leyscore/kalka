import type { SceneGraph } from '../index'
import { findInstanceAncestor } from '../instances'
import type { SceneNode } from '../types'
import { scaleVariableBindingUnits } from '../variables/units'
import { scaleNodeChanges } from './node'

const MIN_SCALE = 0.01
const RESCALABLE_NODE_TYPES = new Set<SceneNode['type']>([
  'BOOLEAN_OPERATION',
  'COMPONENT',
  'COMPONENT_SET',
  'ELLIPSE',
  'FRAME',
  'GROUP',
  'INSTANCE',
  'LINE',
  'POLYGON',
  'RECTANGLE',
  'STAR',
  'TEXT',
  'VECTOR'
])

/** The root and every layer under it, in tree order. */
export function collectScaleTree(graph: SceneGraph, rootId: string): SceneNode[] {
  const root = graph.getNode(rootId)
  if (!root) return []
  const nodes: SceneNode[] = [root]
  const collect = (node: SceneNode): void => {
    for (const childId of node.childIds) {
      const child = graph.getNode(childId)
      if (!child) continue
      nodes.push(child)
      collect(child)
    }
  }
  collect(root)
  return nodes
}

/**
 * Writes `originals`, the root's tree as it was, scaled by `scale` from the root's top-left. A
 * Scale tool drag calls it on every move with the copies taken at the press, so each step scales
 * from the start rather than compounding.
 */
export function rescaleNodeTreeFrom(
  graph: SceneGraph,
  originals: readonly SceneNode[],
  rootId: string,
  scale: number
): void {
  if (!Number.isFinite(scale)) throw new TypeError('Scale must be a finite number')
  if (scale < MIN_SCALE) throw new RangeError(`Scale must be at least ${MIN_SCALE}`)
  for (const node of originals) {
    graph.updateNode(node.id, {
      ...scaleNodeChanges(node, scale, node.id !== rootId),
      ...scaleVariableBindingUnits(node, scale),
      componentScale: findInstanceAncestor(graph, node.id)
        ? node.componentScale * scale
        : node.componentScale
    })
  }
}

/** Whether the Scale tool and `rescale()` take this layer. */
export function canRescaleNode(node: SceneNode): boolean {
  return RESCALABLE_NODE_TYPES.has(node.type)
}

/** Scale a node tree from the root node's top-left, matching Figma's Scale tool. */
export function rescaleNodeTree(graph: SceneGraph, rootId: string, scale: number): void {
  if (!Number.isFinite(scale)) throw new TypeError('Scale must be a finite number')
  if (scale < MIN_SCALE) throw new RangeError(`Scale must be at least ${MIN_SCALE}`)
  const root = graph.getNode(rootId)
  if (!root || !RESCALABLE_NODE_TYPES.has(root.type))
    throw new Error('rescale() is not supported on this node')
  rescaleNodeTreeFrom(graph, collectScaleTree(graph, rootId), rootId, scale)
}
