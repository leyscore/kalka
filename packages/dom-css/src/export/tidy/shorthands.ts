import type { DesignStyleDeclaration } from '#dom-css/types'

import { pickStyle } from '@kalka/scene-graph/css-model'

export const ZERO: ReadonlySet<string> = new Set(['0', '0px'])

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
  const side = (longhand: string, logical: string) =>
    pickStyle(style, longhand) ?? pickStyle(style, logical) ?? '0'
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
  const grow = pickStyle(style, 'flex-grow')
  const basis = pickStyle(style, 'flex-basis')
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

/** Tags with a browser border of their own, which a side left out of `border` keeps. */
const BROWSER_BORDER_TAGS: ReadonlySet<string> = new Set([
  'button',
  'fieldset',
  'hr',
  'iframe',
  'input',
  'select',
  'table',
  'td',
  'textarea',
  'th'
])

const BORDER_SIDES = ['top', 'right', 'bottom', 'left'] as const

const BORDER_LONGHANDS = [
  'border-style',
  'border-color',
  ...BORDER_SIDES.map((side) => `border-${side}-width`)
]

/** Whether a value is one token, spaces inside parentheses aside, as `rgba(0, 0, 0, 0.5)` is. */
function singleToken(value: string): boolean {
  let depth = 0
  for (const character of value.trim()) {
    if (character === '(') depth++
    else if (character === ')') depth--
    else if (depth === 0 && /\s/.test(character)) return false
  }
  return true
}

/** Whether the element sets a border property beyond the style, color and side widths. */
function hasOtherBorder(style: DesignStyleDeclaration): boolean {
  return Object.keys(style).some(
    (name) =>
      name.startsWith('border') &&
      !name.startsWith('border-radius') &&
      !BORDER_LONGHANDS.includes(name)
  )
}

/**
 * A border drawn on its sides, as the projection writes one with weights of its own, as one
 * `border` when every side has the same width, or as the one side that has any.
 */
function combineBorder(style: DesignStyleDeclaration, tagName: string): DesignStyleDeclaration {
  const borderStyle = pickStyle(style, 'border-style')
  const color = pickStyle(style, 'border-color')
  if (borderStyle === undefined || color === undefined || hasOtherBorder(style)) return style
  if (!singleToken(borderStyle) || !singleToken(color)) return style
  const widths = BORDER_SIDES.map((side) => pickStyle(style, `border-${side}-width`) ?? '')
  if (widths.includes('')) return style
  const drawn = BORDER_SIDES.filter((_, index) => !ZERO.has(widths[index] ?? '0'))
  const width = drawn[0] ? widths[BORDER_SIDES.indexOf(drawn[0])] : undefined
  if (!width) return style
  const value = `${width} ${borderStyle} ${color}`
  if (drawn.length === 4 && widths.every((side) => side === width))
    return replaceDeclarations(style, BORDER_LONGHANDS, 'border', value)
  if (drawn.length !== 1 || BROWSER_BORDER_TAGS.has(tagName)) return style
  return replaceDeclarations(style, BORDER_LONGHANDS, `border-${drawn[0]}`, value)
}

/** Longhands as the shorthands a developer writes, which set exactly what they did. */
export function combineShorthands(
  style: DesignStyleDeclaration,
  tagName: string
): DesignStyleDeclaration {
  return combineBorder(combineFlex(combinePadding(style, tagName)), tagName)
}
