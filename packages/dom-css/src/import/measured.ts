import type { SceneNode } from '@kalka/scene-graph'
import { mergedStyle, pickStyle } from '@kalka/scene-graph/css-model'

import type { DesignElement, DesignNode, DesignStyleDeclaration, LayoutBox } from '../types'

/**
 * Import from a measured render: where a browser laid each element out is known, so layers the
 * layer model cannot lay out the same way (block flow, grids, flex children with margins) are
 * placed where the browser put them, and flex containers it can express stay auto layout.
 */

/** How a parent places a child: by its own auto layout, or at the box the browser measured. */
export interface Placement {
  parentBox: LayoutBox
  byMeasure: boolean
}

const ZERO = /^(?:0|0px|auto)?$/

function hasMargins(element: DesignElement): boolean {
  const style = mergedStyle(element)
  return ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'].some(
    (side) => !ZERO.test(pickStyle(style, side) ?? '')
  )
}

function isOutOfFlow(element: DesignElement): boolean {
  const position = pickStyle(mergedStyle(element), 'position')
  return position === 'absolute' || position === 'fixed'
}

/** Whether an element takes no room and draws nothing. */
export function isNotRendered(node: DesignNode): boolean {
  if (node.type === 'text') return false
  return pickStyle(mergedStyle(node), 'display') === 'none'
}

/**
 * Whether a flex container's children land where auto layout would put them: the model has
 * no margins, so a child with margins is placed by measure instead, and with it its siblings.
 */
export function keepsAutoLayout(node: SceneNode, element: DesignElement): boolean {
  if (node.layoutMode === 'NONE' || !element.layoutBox) return node.layoutMode !== 'NONE'
  return element.children.every(
    (child) => child.type === 'text' || isOutOfFlow(child) || !hasMargins(child)
  )
}

/** How a container places one of its children. */
export function placementOf(
  parent: SceneNode,
  parentBox: LayoutBox | undefined,
  child: DesignNode
): Placement | undefined {
  if (!parentBox) return undefined
  const byMeasure = parent.layoutMode === 'NONE' || (child.type === 'element' && isOutOfFlow(child))
  // A border that takes room is drawn as one, and CSS places a child from inside it.
  if (!parent.strokesIncludedInLayout || parent.strokes.length === 0)
    return { parentBox, byMeasure }
  const left = parent.independentStrokeWeights ? parent.borderLeftWeight : parent.strokeWeight
  const top = parent.independentStrokeWeights ? parent.borderTopWeight : parent.strokeWeight
  return {
    parentBox: { ...parentBox, x: parentBox.x + left, y: parentBox.y + top },
    byMeasure
  }
}

/** Puts a layer at the box the browser measured, at that size. */
export function placeAtMeasure(node: SceneNode, box: LayoutBox, placement: Placement): void {
  node.x = box.x - placement.parentBox.x
  node.y = box.y - placement.parentBox.y
  if (node.type === 'TEXT') {
    const lineHeight = node.lineHeight ?? node.fontSize * 1.3
    if (node.textAutoResize === 'WIDTH_AND_HEIGHT' && box.height < lineHeight * 1.5) {
      // Loose text on one line takes the width of its words, so a font's slightly wider
      // metrics cannot push its last word onto a line of its own.
      node.height = box.height
      return
    }
    // A block's text wraps where the browser wrapped it: on one line with a little room, so a
    // slightly wider font cannot wrap its last word; over several at its width, rounded up, so
    // it wraps there and a fraction of a pixel cannot wrap its widest line.
    node.width =
      box.height < lineHeight * 1.5 ? Math.ceil(box.width * 1.01) + 1 : Math.ceil(box.width) + 1
    node.height = box.height
    node.textAutoResize = 'HEIGHT'
    return
  }
  node.width = Math.max(box.width, 0.01)
  node.height = Math.max(box.height, 0.01)
  if (node.layoutMode !== 'NONE') {
    node.primaryAxisSizing = 'FIXED'
    node.counterAxisSizing = 'FIXED'
  }
}

/** Properties text takes from the element around it, without the element's own box. */
const TEXT_PROPERTIES = [
  'color',
  'direction',
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'letter-spacing',
  'line-height',
  'text-align',
  'text-decoration-line',
  'text-shadow',
  'text-transform',
  'white-space'
]

/** Whether a line of text sits away from the start of the box it is written in. */
export function alignsAwayFromStart(style: DesignStyleDeclaration): boolean {
  const align = pickStyle(style, 'text-align')
  return align === 'center' || align === 'right' || align === 'end' || align === '-webkit-center'
}

export function inheritedTextStyle(style: DesignStyleDeclaration): DesignStyleDeclaration {
  return Object.fromEntries(
    TEXT_PROPERTIES.flatMap((property) => {
      const value = pickStyle(style, property)
      return value === undefined ? [] : [[property, value]]
    })
  )
}

function zIndexOf(node: DesignNode): number {
  if (node.type === 'text') return 0
  const value = Number.parseInt(pickStyle(mergedStyle(node), 'z-index') ?? '', 10)
  return Number.isFinite(value) ? value : 0
}

function leavesFlow(node: DesignNode): boolean {
  if (node.type === 'text') return false
  const position = pickStyle(mergedStyle(node), 'position')
  return position === 'absolute' || position === 'fixed'
}

/** The z-index a box stacks by, or null for one the page stacks where it is written. */
function stackLevel(node: DesignNode): number | null {
  if (node.type === 'text') return null
  const style = mergedStyle(node)
  const position = pickStyle(style, 'position')
  if (position === undefined || position === 'static') return null
  const value = Number.parseInt(pickStyle(style, 'z-index') ?? '', 10)
  return Number.isFinite(value) ? value : null
}

/** Whether a box keeps what is in it together when the page stacks: nothing in it gets out. */
function stacksItsOwn(node: DesignNode): boolean {
  if (node.type === 'text') return true
  if (stackLevel(node) !== null) return true
  const style = mergedStyle(node)
  const set = (property: string, plain: string) => (pickStyle(style, property) ?? plain) !== plain
  return (
    Number.parseFloat(pickStyle(style, 'opacity') ?? '1') < 1 ||
    set('transform', 'none') ||
    set('filter', 'none') ||
    set('isolation', 'auto') ||
    set('mix-blend-mode', 'normal')
  )
}

/**
 * The highest z-index among what a box holds and does not keep to itself: a page paints those
 * boxes over a later box with a lower z-index, though they sit inside an earlier one.
 */
function reach(node: DesignNode): number {
  if (node.type === 'text' || stacksItsOwn(node)) return 0
  let highest = 0
  for (const child of node.children) {
    if (isNotRendered(child)) continue
    highest = Math.max(highest, stackLevel(child) ?? 0, reach(child))
  }
  return highest
}

/** Just under what stacks where it is written, and over every negative z-index. */
const UNDER_THE_FLOW = -0.5

/**
 * Children in the order they paint: by z-index, lowest first, and in document order among
 * equals, as layers paint in their order. Where the parent lays its children out, the ones in
 * the flow keep their document order, since moving one would move what follows it. A layer
 * holds its children, so a box taken out of the flow goes under its siblings when one of them
 * holds a box the page paints over it: a hero's drawn background under the hero's text.
 */
export function paintOrder(children: readonly DesignNode[], flows = false): DesignNode[] {
  const over = Math.max(0, ...children.map(reach))
  const rank = (node: DesignNode) => {
    if (flows && !leavesFlow(node)) return 0
    const level = zIndexOf(node)
    return leavesFlow(node) && level > 0 && over > level ? UNDER_THE_FLOW : level
  }
  return [...children].sort((a, b) => rank(a) - rank(b))
}

/**
 * The turn of a `transform` that only rotates, plus a `rotate`, in degrees as the layer's `rotation` holds them,
 * which the projection writes back as `rotate()`. Null for no transform, or one that also
 * scales or skews.
 */
export function rotationFromTransform(
  transform: string | undefined,
  rotate?: string
): number | null {
  const own = /^(-?[\d.]+)deg$/.exec(rotate?.trim() ?? '')
  const turn = own ? Number.parseFloat(own[1]) : 0
  const match = /^matrix\(([^)]+)\)$/.exec(transform?.trim() ?? '')
  let degrees = turn
  if (match) {
    const [a, b, c, d] = match[1].split(',').map((part) => Number.parseFloat(part))
    if ([a, b, c, d].some((part) => !Number.isFinite(part))) return null
    const scale = Math.hypot(a, b)
    if (Math.abs(scale - 1) > 0.02 || Math.abs(a - d) > 0.02 || Math.abs(b + c) > 0.02) return null
    degrees += (Math.atan2(b, a) * 180) / Math.PI
  }
  return Math.abs(degrees) < 0.05 ? null : degrees
}
