import type { DesignStyleDeclaration } from '../../types'
import { pixelValue } from './lengths'

/** How the parent lays an element out, which decides what some declarations do. */
export interface ParentLayout {
  /** The parent's style, or undefined for a root, whose page the export cannot know. */
  style: DesignStyleDeclaration | undefined
}

/** Tags with browser padding of their own, which a side left out of `padding` keeps. */
const BROWSER_PADDING_TAGS: ReadonlySet<string> = new Set([
  'button',
  'details',
  'dialog',
  'dir',
  'fieldset',
  'input',
  'legend',
  'menu',
  'ol',
  'optgroup',
  'option',
  'select',
  'td',
  'textarea',
  'th',
  'ul'
])

/** Tags whose minimum size is not `auto`, such as a fieldset's content width. */
const BROWSER_MINIMUM_TAGS: ReadonlySet<string> = new Set(['fieldset'])

const ZERO = new Set(['0', '0px'])

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
): void {
  if (BROWSER_MINIMUM_TAGS.has(tagName)) return
  for (const axis of ['width', 'height'] as const) {
    const property = `min-${axis}`
    const value = style[property]
    if (value !== undefined && ZERO.has(value) && zeroMinimumIsDefault(style, axis, parent))
      delete style[property]
  }
}

/**
 * `aspect-ratio` says nothing once both sizes are set and nothing can change either: no size
 * limits, and no flex line that may shrink the box.
 */
function dropIdleAspectRatio(style: DesignStyleDeclaration, parent: DesignStyleDeclaration): void {
  if (!('aspect-ratio' in style)) return
  if (pixelValue(style.width) === null || pixelValue(style.height) === null) return
  if (Object.keys(style).some((name) => /^(min|max)-(width|height)$/.test(name))) return
  const flexItem = isFlex(parent.display) && !placedOutOfFlow(style)
  if (flexItem && !keepsMainSize(style, mainSize(parent))) return
  delete style['aspect-ratio']
}

/** Entries in their order with `replaced` written where the first of `names` was. */
function replaceDeclarations(
  style: DesignStyleDeclaration,
  names: readonly string[],
  property: string,
  value: string
): DesignStyleDeclaration {
  const result: DesignStyleDeclaration = {}
  let written = false
  for (const [name, current] of Object.entries(style)) {
    if (!names.includes(name)) result[name] = current
    else if (!written) {
      result[property] = value
      written = true
    }
  }
  return result
}

const PADDING_SIDES = ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'] as const

/** `padding` with its sides as few as say the same: `18px 20px 0` rather than three longhands. */
function paddingShorthand(top: string, right: string, bottom: string, left: string): string {
  if (top === right && right === bottom && bottom === left) return top
  if (top === bottom && right === left) return `${top} ${right}`
  if (right === left) return `${top} ${right} ${bottom}`
  return `${top} ${right} ${bottom} ${left}`
}

/**
 * The padding longhands as one `padding`. A side the projection leaves out is zero, as it is on
 * every tag without browser padding.
 */
function combinePadding(style: DesignStyleDeclaration, tagName: string): DesignStyleDeclaration {
  if (BROWSER_PADDING_TAGS.has(tagName) || 'padding' in style) return style
  if (Object.keys(style).some((name) => name.startsWith('writing-mode'))) return style
  const names = Object.keys(style).filter((name) => name.startsWith('padding-'))
  if (names.length === 0) return style
  const side = (longhand: string, logical: string) => style[longhand] ?? style[logical] ?? '0'
  const [top, right, bottom, left] = PADDING_SIDES.map((longhand) =>
    side(
      longhand,
      longhand === 'padding-top' || longhand === 'padding-bottom'
        ? 'padding-block'
        : 'padding-inline'
    )
  ).map((value) => (ZERO.has(value) ? '0' : value))
  return replaceDeclarations(style, names, 'padding', paddingShorthand(top, right, bottom, left))
}

/**
 * Growing from a zero basis as one `flex`: `flex: 1 1 0` is `flex-grow: 1; flex-basis: 0`, the
 * shrink factor being its initial one unless the layer set its own.
 */
function combineFlex(style: DesignStyleDeclaration): DesignStyleDeclaration {
  const grow = style['flex-grow']
  const basis = style['flex-basis']
  if (grow === undefined || basis === undefined || 'flex' in style) return style
  const shrink = style['flex-shrink'] ?? '1'
  const names = ['flex-grow', 'flex-shrink', 'flex-basis'].filter((name) => name in style)
  return replaceDeclarations(
    style,
    names,
    'flex',
    `${grow} ${shrink} ${ZERO.has(basis) ? '0' : basis}`
  )
}

export interface DeclarationContext {
  tagName: string
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
  { tagName, classed, parent, responsive, shorthands }: DeclarationContext
): DesignStyleDeclaration {
  const tidy = { ...style }
  const tag = tagName.toLowerCase()
  // A class rule may set what a declaration here overrides, or a shorthand would.
  if (responsive || classed) return tidy
  if (parent.style) {
    dropDefaultMinimums(tidy, tag, parent.style)
    dropIdleAspectRatio(tidy, parent.style)
  }
  return shorthands ? combineFlex(combinePadding(tidy, tag)) : tidy
}
