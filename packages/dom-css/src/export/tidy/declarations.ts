import type { DesignStyleDeclaration } from '#dom-css/types'
import { omit } from 'es-toolkit/object'

import { pickStyle } from '@kalka/scene-graph/css-model'

import { pixelValue } from './lengths'
import { combineShorthands, ZERO } from './shorthands'

/** How the parent lays an element out, which decides what some declarations do. */
export interface ParentLayout {
  /** The parent's style, or undefined for a root, whose page the export cannot know. */
  style: DesignStyleDeclaration | undefined
}

/** Tags whose minimum size is not `auto`, such as a fieldset's content width. */
const BROWSER_MINIMUM_TAGS: ReadonlySet<string> = new Set(['fieldset'])

const isFlex = (display: string | undefined) => display === 'flex' || display === 'inline-flex'
const isGrid = (display: string | undefined) => display === 'grid' || display === 'inline-grid'

function placedOutOfFlow(style: DesignStyleDeclaration): boolean {
  return style.position === 'absolute' || style.position === 'fixed'
}

/** The size property along a flex parent's main axis. */
function mainSize(parent: DesignStyleDeclaration): 'width' | 'height' {
  return parent['flex-direction']?.startsWith('column') ? 'height' : 'width'
}

/**
 * Whether a flex item's main size is its CSS size whatever its minimum: it may not shrink and
 * starts from that size, so neither `min-width: auto`'s content minimum nor zero can bind.
 */
function keepsMainSize(style: DesignStyleDeclaration, main: 'width' | 'height'): boolean {
  return (
    style['flex-shrink'] === '0' && !('flex-basis' in style) && pixelValue(style[main]) !== null
  )
}

/**
 * Whether `min-width: 0` or `min-height: 0` does what `auto` does: `auto` is zero outside flex and
 * grid layout, and across a flex line; along it, only a box that may shrink below its size sees
 * the difference.
 */
function zeroMinimumIsDefault(
  style: DesignStyleDeclaration,
  axis: 'width' | 'height',
  parent: DesignStyleDeclaration
): boolean {
  if (placedOutOfFlow(style)) return true
  if (isGrid(parent.display)) return false
  if (!isFlex(parent.display)) return true
  const main = mainSize(parent)
  return axis !== main || keepsMainSize(style, main)
}

function dropDefaultMinimums(
  style: DesignStyleDeclaration,
  tagName: string,
  parent: DesignStyleDeclaration
): DesignStyleDeclaration {
  if (BROWSER_MINIMUM_TAGS.has(tagName)) return style
  const defaults = (['width', 'height'] as const).filter((axis) => {
    const value = pickStyle(style, `min-${axis}`)
    return value !== undefined && ZERO.has(value) && zeroMinimumIsDefault(style, axis, parent)
  })
  return omit(
    style,
    defaults.map((axis) => `min-${axis}`)
  )
}

/**
 * `aspect-ratio` says nothing once both sizes are set and nothing can change either: no size
 * limits, and no flex line that may shrink the box.
 */
function dropIdleAspectRatio(
  style: DesignStyleDeclaration,
  parent: DesignStyleDeclaration
): DesignStyleDeclaration {
  if (!('aspect-ratio' in style)) return style
  if (pixelValue(style.width) === null || pixelValue(style.height) === null) return style
  if (Object.keys(style).some((name) => /^(min|max)-(width|height)$/.test(name))) return style
  const flexItem = isFlex(parent.display) && !placedOutOfFlow(style)
  if (flexItem && !keepsMainSize(style, mainSize(parent))) return style
  return omit(style, ['aspect-ratio'])
}

/** Block boxes by default, which stay block boxes without `display: flex`. */
const BLOCK_TAGS: ReadonlySet<string> = new Set([
  'article',
  'aside',
  'div',
  'figure',
  'footer',
  'form',
  'header',
  'main',
  'nav',
  'section'
])

/** What only a flex container's children read. */
const FLEX_CONTAINER_PROPERTIES = [
  'display',
  'flex-direction',
  'justify-content',
  'align-items',
  'flex-wrap',
  'align-content',
  'gap',
  'row-gap',
  'column-gap'
]

/**
 * An auto layout frame with nothing inside draws as the box it is: its flex layout has no
 * children to place. The box stays a block, and its margins could only collapse in a parent
 * without flex layout, or a baseline line asks for its first line, which only stays when the
 * box keeps flex layout.
 */
function dropEmptyFlexLayout(
  style: DesignStyleDeclaration,
  tagName: string,
  parent: DesignStyleDeclaration
): DesignStyleDeclaration {
  if (style.display !== 'flex' || !BLOCK_TAGS.has(tagName)) return style
  if (!placedOutOfFlow(style) && !isFlex(parent.display) && !isGrid(parent.display)) return style
  if (parent['align-items'] === 'baseline' || style['align-self'] === 'baseline') return style
  return omit(style, FLEX_CONTAINER_PROPERTIES)
}

export interface DeclarationContext {
  tagName: string
  /** Whether the element has no children, text included. */
  empty: boolean
  /** Whether the element has class rules of its own, which its declarations may be overriding. */
  classed: boolean
  parent: ParentLayout
  /** Whether a breakpoint may restyle the element or its parent, changing what is a default. */
  responsive: boolean
  /** Write longhands as their shorthand, for CSS; Tailwind has a utility for each longhand. */
  shorthands: boolean
}

/**
 * A layer's declarations without those that say what the browser does anyway, and with
 * longhands as their shorthand, laying out exactly as before.
 */
export function tidyDeclarations(
  style: DesignStyleDeclaration,
  { tagName, empty, classed, parent, responsive, shorthands }: DeclarationContext
): DesignStyleDeclaration {
  const tag = tagName.toLowerCase()
  // A class rule may set what a declaration here overrides, or a shorthand would.
  if (responsive || classed) return { ...style }
  let tidy = style
  if (parent.style) {
    tidy = dropIdleAspectRatio(dropDefaultMinimums(tidy, tag, parent.style), parent.style)
    if (empty) tidy = dropEmptyFlexLayout(tidy, tag, parent.style)
  }
  return shorthands ? combineShorthands(tidy, tag) : { ...tidy }
}
