import type { DesignElement, DesignNode, DesignStyleDeclaration } from '#dom-css/types'
import { omit } from 'es-toolkit/object'

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
  const first = boxes.at(0)
  const second = boxes.at(1)
  if (!first || !second || first[start] !== 0) return null
  const gap = second[start] - first[start] - first[size]
  if (gap < 0) return null
  let end = -gap
  for (const box of boxes) {
    if (box[across] !== 0 || box[start] !== end + gap) return null
    end = box[start] + box[size]
  }
  return gap
}

interface FlexLine {
  direction: 'row' | 'column'
  /** The gap between boxes, in sixty-fourths of a pixel. */
  gap: number
}

/** The row or column the boxes sit in within a frame of that size, or null. */
function flexLine(boxes: readonly Box[], width: number, height: number): FlexLine | null {
  const rowGap = lineGap(boxes, 'left', 'top')
  const gap = rowGap ?? lineGap(boxes, 'top', 'left')
  if (gap === null) return null
  const direction = rowGap === null ? 'column' : 'row'
  const last = boxes.at(-1)
  const end = last ? (direction === 'row' ? last.left + last.width : last.top + last.height) : 0
  // A line longer than the frame would shrink its items, where free children overflow.
  if (end > layoutUnits(direction === 'row' ? width : height)) return null
  return { direction, gap }
}

/**
 * Whether a frame could lay its children out as one flex line: it places them itself, has more
 * than one, no padding that would offset them, and nothing that styles it beyond its own CSS.
 */
function holdsLine(
  element: DesignElement,
  style: DesignStyleDeclaration,
  parent: DesignStyleDeclaration | undefined
): boolean {
  if (element.children.length < 2 || style.display || element.mediaStyles?.length) return false
  if ((element.sourceSceneNode?.htmlClasses.length ?? 0) > 0) return false
  if (Object.keys(style).some((name) => name.startsWith('padding'))) return false
  return blockLevel(element, style, parent)
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
  const style = child.inlineStyle ?? {}
  // Zero minimums were free placement's `auto`; the line has room, so nothing shrinks.
  const zero = ['min-width', 'min-height'].filter((name) => /^0(px)?$/.test(style[name] ?? ''))
  return {
    ...child,
    inlineStyle: { position: 'relative', ...omit(style, [...PLACEMENT, ...zero]) }
  }
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
  const width = pixelValue(style.width)
  const height = pixelValue(style.height)
  if (!holdsLine(element, style, parent) || width === null || height === null) return element
  const boxes = element.children.map(placedBox)
  const placed = boxes.filter((box): box is Box => box !== null)
  if (placed.length !== boxes.length) return element
  const line = flexLine(placed, width, height)
  if (!line) return element
  const container: DesignStyleDeclaration = { ...style, display: 'flex' }
  if (line.direction === 'column') container['flex-direction'] = 'column'
  if (line.gap > 0) container.gap = `${layoutLength(line.gap / 64)}px`
  const children = element.children.map((child) =>
    child.type === 'element' ? flexItem(child) : child
  )
  return { ...element, inlineStyle: container, children }
}
