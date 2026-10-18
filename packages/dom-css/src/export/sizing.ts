import { layoutSizingInParent, type SceneGraph, type SceneNode } from '@kalka/scene-graph'
import { hugs } from '@kalka/scene-graph/css-model'

import type { DesignStyleDeclaration } from '../types'

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

interface OverflowingPadding {
  horizontal: boolean
  vertical: boolean
}

/**
 * The axes on which a frame of fixed size has more padding than size. Figma keeps the size and
 * lets the content overflow; a browser grows the box to hold its padding.
 */
function overflowingPadding(node: SceneNode): OverflowingPadding | null {
  if (!isStack(node) || node.layoutWrap === 'WRAP' || node.layoutDirection === 'RTL') return null
  const horizontal = !hugs(node, 'width') && node.paddingLeft + node.paddingRight > node.width + 0.5
  const vertical = !hugs(node, 'height') && node.paddingTop + node.paddingBottom > node.height + 0.5
  return horizontal || vertical ? { horizontal, vertical } : null
}

/**
 * A frame without the padding it cannot hold, which its children carry as margins instead: a
 * margin, unlike padding, does not grow a box of fixed size, and places the children where the
 * padding would have.
 */
export function withoutOverflowingPadding(node: SceneNode): SceneNode {
  const overflowing = overflowingPadding(node)
  if (!overflowing) return node
  return {
    ...node,
    ...(overflowing.horizontal ? { paddingLeft: 0, paddingRight: 0 } : {}),
    ...(overflowing.vertical ? { paddingTop: 0, paddingBottom: 0 } : {})
  }
}

/** The margins a child takes over from its parent's overflowing padding (`withoutOverflowingPadding`). */
export function overflowingPaddingMargins(
  graph: SceneGraph,
  node: SceneNode
): DesignStyleDeclaration {
  const parent = node.parentId ? graph.getNode(node.parentId) : undefined
  if (!parent || !node.visible || node.layoutPositioning === 'ABSOLUTE') return {}
  const overflowing = overflowingPadding(parent)
  if (!overflowing) return {}
  const flow = inFlow(graph, parent)
  const first = flow.at(0)?.id === node.id
  const last = flow.at(-1)?.id === node.id
  const row = parent.layoutMode === 'HORIZONTAL'
  const margins: DesignStyleDeclaration = {}
  const set = (property: string, value: number, applies: boolean) => {
    if (applies && value !== 0) margins[property] = `${value}px`
  }
  if (overflowing.horizontal) {
    set('margin-left', parent.paddingLeft, !row || first)
    set('margin-right', parent.paddingRight, !row || last)
  }
  if (overflowing.vertical) {
    set('margin-top', parent.paddingTop, row || first)
    set('margin-bottom', parent.paddingBottom, row || last)
  }
  return margins
}
