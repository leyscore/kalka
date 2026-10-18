import { layoutSizingInParent, type SceneGraph, type SceneNode } from '@kalka/scene-graph'

/**
 * Where Figma's auto layout and CSS flexbox size a frame differently, the frame as the browser
 * should lay it out, and what its children take over from it.
 */

function children(graph: SceneGraph, node: SceneNode): SceneNode[] {
  return node.childIds
    .map((id) => graph.getNode(id))
    .filter((child): child is SceneNode => child !== undefined)
}

function inFlow(graph: SceneGraph, node: SceneNode): SceneNode[] {
  return children(graph, node).filter(
    (child) => child.visible && child.layoutPositioning !== 'ABSOLUTE'
  )
}

function isStack(node: SceneNode): boolean {
  return node.layoutMode === 'HORIZONTAL' || node.layoutMode === 'VERTICAL'
}

/**
 * A frame that hugs across its flow while every child in the flow fills that axis has nothing to
 * hug: Figma keeps the size it has, as it turns such a frame Fixed when its last child is set to
 * fill, where CSS would shrink it to the children's content, to nothing for frames that place
 * their own children.
 */
export function withUnhuggableAxisFixed(graph: SceneGraph, node: SceneNode): SceneNode {
  if (!isStack(node) || node.counterAxisSizing !== 'HUG') return node
  const across = node.layoutMode === 'HORIZONTAL' ? 'VERTICAL' : 'HORIZONTAL'
  const flow = inFlow(graph, node)
  const fills = (child: SceneNode) => layoutSizingInParent(node, child, across) === 'FILL'
  if (flow.length === 0 || !flow.every(fills)) return node
  return { ...node, counterAxisSizing: 'FIXED' }
}
