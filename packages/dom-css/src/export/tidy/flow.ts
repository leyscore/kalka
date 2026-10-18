import { omit } from 'es-toolkit/object'

import type { DesignElement, DesignNode, DesignStyleDeclaration } from '../../types'
import { layoutLength, layoutUnits, pixelValue } from './lengths'

/** Tags that are blocks by default, which stay blocks as flex containers. */
const BLOCK_CONTAINERS: ReadonlySet<string> = new Set([
  'article',
  'aside',
  'div',
  'figure',
  'footer',
  'form',
  'header',
  'main',
  'nav',
  'ol',
  'section',
  'ul'
])

/** What a freely placed child may set beside its place and size, which a flex item keeps. */
const PLACEMENT = ['position', 'left', 'top']

/** A child's box in sixty-fourths of a pixel, as the browser lays it out. */
interface Box {
  left: number
  top: number
  width: number
  height: number
}

/** A freely placed child's box, or null for one a flex line could not hold as it is. */
function placedBox(child: DesignNode): Box | null {
  if (child.type === 'text' || child.mediaStyles?.length) return null
  if ((child.sourceSceneNode?.htmlClasses.length ?? 0) > 0) return null
  const style = child.inlineStyle ?? {}
  if (style.position !== 'absolute') return null
  // Padding and borders would make the box larger than its CSS size where sizes are content
  // sizes, as they are without a reset, and move the boxes after it.
  if (
    Object.keys(style).some((name) =>
      /^(right|bottom|inset|margin|transform|float|padding|border(?!-radius))/.test(name)
    )
  )
    return null
  const values = [style.left, style.top, style.width, style.height].map(pixelValue)
  if (values.some((value) => value === null)) return null
  const [left = 0, top = 0, width = 0, height = 0] = values.map((value) => layoutUnits(value ?? 0))
  return { left, top, width, height }
}

/**
 * The gap between boxes laid out one after another from the start of a line along `start`, or
 * null when they are not: each starts where the one before it ends, plus the same gap, and every
 * one sits at the start of the line across it.
 */
function lineGap(boxes: readonly Box[], start: 'left' | 'top', across: 'left' | 'top') {
  const size = start === 'left' ? 'width' : 'height'
  const [first, second] = boxes
  if (!first || !second || first[start] !== 0) return null
  const gap = second[start] - first[start] - first[size]
  if (gap < 0) return null
  for (let index = 0; index < boxes.length; index++) {
    const box = boxes[index]
    const previous = boxes[index - 1]
    if (!box || box[across] !== 0) return null
    if (previous && box[start] !== previous[start] + previous[size] + gap) return null
  }
  return gap
}

/** Whether the element lays out as a block box, as a flex container it does too. */
function blockLevel(
  element: DesignElement,
  style: DesignStyleDeclaration,
  parent: DesignStyleDeclaration | undefined
): boolean {
  if (style.position === 'absolute' || style.position === 'fixed') return true
  const display = parent?.display ?? ''
  if (/^(inline-)?(flex|grid)$/.test(display)) return true
  return BLOCK_CONTAINERS.has(element.tagName.toLowerCase())
}

/** A child as the flex item it becomes: positioned still, so it paints where it did. */
function flexItem(child: DesignElement): DesignElement {
  const style = omit(child.inlineStyle ?? {}, PLACEMENT)
  for (const minimum of ['min-width', 'min-height'])
    if (style[minimum] === '0' || style[minimum] === '0px') delete style[minimum]
  return { ...child, inlineStyle: { position: 'relative', ...style } }
}

/**
 * A frame without auto layout whose children already sit in a row or a column, one after
 * another from its corner with the same gap and nothing past its edge, as the flex layout that
 * places them there. The children stay positioned, so they paint in the same order; the frame
 * keeps its size, and the layer keeps its free layout in the document.
 */
export function asFlexLayout(
  element: DesignElement,
  parent: DesignStyleDeclaration | undefined
): DesignElement {
  const style = element.inlineStyle ?? {}
  if (element.children.length < 2 || style.display || element.mediaStyles?.length) return element
  if ((element.sourceSceneNode?.htmlClasses.length ?? 0) > 0) return element
  if (Object.keys(style).some((name) => name.startsWith('padding'))) return element
  if (!blockLevel(element, style, parent)) return element
  const width = pixelValue(style.width)
  const height = pixelValue(style.height)
  if (width === null || height === null) return element
  const boxes = element.children.map(placedBox)
  if (boxes.some((box) => box === null)) return element
  const placed = boxes.filter((box): box is Box => box !== null)

  const rowGap = lineGap(placed, 'left', 'top')
  const columnGap = rowGap === null ? lineGap(placed, 'top', 'left') : null
  const gap = rowGap ?? columnGap
  if (gap === null) return element
  const last = placed.at(-1)
  const end = last ? (rowGap !== null ? last.left + last.width : last.top + last.height) : 0
  // A line longer than the frame would shrink its items, where free children overflow.
  if (end > layoutUnits(rowGap !== null ? width : height)) return element

  const container: DesignStyleDeclaration = { ...style, display: 'flex' }
  if (rowGap === null) container['flex-direction'] = 'column'
  if (gap > 0) container.gap = `${layoutLength(gap / 64)}px`
  const children = element.children.map((child) =>
    child.type === 'element' ? flexItem(child) : child
  )
  return { ...element, inlineStyle: container, children }
}
