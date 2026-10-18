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
function withUnhuggableAxisFixed(graph: SceneGraph, node: SceneNode): SceneNode {
  if (!isStack(node) || node.counterAxisSizing !== 'HUG') return node
  const across = node.layoutMode === 'HORIZONTAL' ? 'VERTICAL' : 'HORIZONTAL'
  const flow = inFlow(graph, node)
  const fills = (child: SceneNode) => layoutSizingInParent(node, child, across) === 'FILL'
  if (flow.length === 0 || !flow.every(fills)) return node
  return { ...node, counterAxisSizing: 'FIXED' }
}

/**
 * A frame spacing its children Auto shares the free space between them and keeps its item spacing
 * only to restore it; flexbox would add the gap to the shares and push the last child out. Rows
 * that wrap keep the spacing between them.
 */
function withoutAutoSpacingGap(node: SceneNode): SceneNode {
  if (!isStack(node) || node.primaryAxisAlign !== 'SPACE_BETWEEN' || node.itemSpacing === 0)
    return node
  const counterAxisSpacing = Number.isFinite(node.counterAxisSpacing)
    ? node.counterAxisSpacing
    : node.itemSpacing
  return { ...node, itemSpacing: 0, counterAxisSpacing }
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
function withoutOverflowingPadding(node: SceneNode): SceneNode {
  const overflowing = overflowingPadding(node)
  if (!overflowing) return node
  const unpadded = { ...node }
  if (overflowing.horizontal) {
    unpadded.paddingLeft = 0
    unpadded.paddingRight = 0
  }
  if (overflowing.vertical) {
    unpadded.paddingTop = 0
    unpadded.paddingBottom = 0
  }
  return unpadded
}

interface Margins {
  top: number
  right: number
  bottom: number
  left: number
}

/** The margins a child takes over from its parent's overflowing padding (`withoutOverflowingPadding`). */
function addOverflowingPadding(
  graph: SceneGraph,
  node: SceneNode,
  parent: SceneNode,
  margins: Margins
): void {
  const overflowing = overflowingPadding(parent)
  if (!overflowing) return
  const flow = inFlow(graph, parent)
  const first = flow.at(0)?.id === node.id
  const last = flow.at(-1)?.id === node.id
  const row = parent.layoutMode === 'HORIZONTAL'
  if (overflowing.horizontal) {
    if (!row || first) margins.left += parent.paddingLeft
    if (!row || last) margins.right += parent.paddingRight
  }
  if (overflowing.vertical) {
    if (row || first) margins.top += parent.paddingTop
    if (row || last) margins.bottom += parent.paddingBottom
  }
}

/**
 * Auto layout places a turned layer by the box around it, as it is drawn; a CSS transform leaves
 * the layer's space as it was. Margins grow that space to the turned box, which stays centered on
 * the layer as the layer turns about its center.
 */
function addTurnedBox(node: SceneNode, margins: Margins): void {
  if (node.rotation === 0 || node.type === 'LINE') return
  const angle = (node.rotation * Math.PI) / 180
  const cos = Math.abs(Math.cos(angle))
  const sin = Math.abs(Math.sin(angle))
  const horizontal = (node.width * cos + node.height * sin - node.width) / 2
  const vertical = (node.width * sin + node.height * cos - node.height) / 2
  margins.left += horizontal
  margins.right += horizontal
  margins.top += vertical
  margins.bottom += vertical
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000
}

/**
 * The margins a layer in its parent's flow takes where auto layout places it differently from
 * flexbox: its parent's overflowing padding, and the box it turns into.
 */
export function flowMargins(graph: SceneGraph, node: SceneNode): DesignStyleDeclaration {
  const parent = node.parentId ? graph.getNode(node.parentId) : undefined
  if (!parent || !isStack(parent) || node.layoutPositioning === 'ABSOLUTE') return {}
  const margins: Margins = { top: 0, right: 0, bottom: 0, left: 0 }
  addOverflowingPadding(graph, node, parent, margins)
  addTurnedBox(node, margins)
  const style: DesignStyleDeclaration = {}
  for (const side of ['top', 'right', 'bottom', 'left'] as const) {
    const value = round(margins[side])
    if (value !== 0) style[`margin-${side}`] = `${value}px`
  }
  return style
}

/** A frame as flexbox should lay it out to size and place its children as auto layout does. */
export function asAutoLayoutSizes(graph: SceneGraph, node: SceneNode): SceneNode {
  return withoutAutoSpacingGap(withoutOverflowingPadding(withUnhuggableAxisFixed(graph, node)))
}
