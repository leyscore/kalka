import type { Color, CSSDeclarations } from '@kalka/scene-graph'
import { colorDistance, tryParseColor } from '@kalka/scene-graph/color'
import { parseCSSNumber, splitCSSValue } from '@kalka/scene-graph/css'

/** How far apart two colors may be and still match: Euclidean distance in 0–255 RGB. */
export const DEFAULT_COLOR_TOLERANCE = 1
/** How far apart two lengths may be and still match, in pixels. */
export const DEFAULT_NUMBER_TOLERANCE = 0.01

export interface Tolerance {
  color: number
  number: number
}

/** A pattern with `*` (any run) or `?` (one character), matched whole and case-insensitively. */
export function hasWildcard(pattern: string): boolean {
  return /[*?]/.test(pattern)
}

function globRegExp(pattern: string): RegExp {
  const source = pattern.replace(/[.+^${}()|[\]\\*?]/g, (char) => {
    if (char === '*') return '.*'
    if (char === '?') return '.'
    return `\\${char}`
  })
  return new RegExp(`^${source}$`, 'isu')
}

/**
 * Whether `text` matches `pattern`: a whole-text glob when the pattern has a wildcard, else a
 * case-insensitive substring, as `find_nodes` matched names before it took wildcards.
 */
export function textMatches(text: string, pattern: string): boolean {
  if (hasWildcard(pattern)) return globRegExp(pattern).test(text)
  return text.toLowerCase().includes(pattern.toLowerCase())
}

/** Whether two colors are the same within the tolerance, alpha included. */
export function colorsEqual(left: Color, right: Color, tolerance: number): boolean {
  const alphaTolerance = Math.max(0.005, tolerance / 255)
  return (
    Math.abs(left.a - right.a) <= alphaTolerance && colorDistance(left, right) <= tolerance + 1e-9
  )
}

/** A CSS value part as a color, unless it is a bare number such as `0`. */
function partColor(part: string): Color | null {
  if (parseCSSNumber(part) !== null) return null
  try {
    return tryParseColor(part)
  } catch {
    // culori throws on some functions that are not colors, such as `blur(4px)`.
    return null
  }
}

/** Every color a CSS value names, including inside functions such as gradients and shadows. */
export function colorsIn(value: string): Color[] {
  const colors: Color[] = []
  for (const part of splitCSSValue(value)) {
    const color = partColor(part)
    if (color) {
      colors.push(color)
      continue
    }
    const open = part.indexOf('(')
    if (open > 0 && part.endsWith(')')) colors.push(...colorsIn(part.slice(open + 1, -1)))
  }
  return colors
}

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase()
}

const unquote = (value: string) => value.trim().replace(/^(['"])(.*)\1$/, '$2')

function partMatches(declared: string, query: string, tolerance: Tolerance): boolean {
  const queryNumber = parseCSSNumber(query)
  if (queryNumber !== null) {
    const declaredNumber = parseCSSNumber(declared)
    if (declaredNumber !== null) return Math.abs(declaredNumber - queryNumber) <= tolerance.number
  }
  const queryColor = partColor(query)
  const declaredColor = partColor(declared)
  if (queryColor && declaredColor) return colorsEqual(declaredColor, queryColor, tolerance.color)
  return normalize(unquote(declared)) === normalize(unquote(query))
}

/**
 * Whether a declared CSS value matches the value searched for. A wildcard pattern matches the
 * whole value as text. A single color matches any color the value names, in any notation, so
 * `#2F5BEA` finds `rgb(47 91 234)` and the color of `border: 1px solid #2f5bea`; a single length
 * matches a value whose lengths all equal it, so `16px` finds `1rem` and `padding: 16px 16px`.
 * Several parts match part by part; anything else compares as text, ignoring case and quotes, and
 * a font family matches one entry of a font list.
 */
export function cssValueMatches(declared: string, query: string, tolerance: Tolerance): boolean {
  if (hasWildcard(query)) return globRegExp(query.trim()).test(declared.trim())
  const queryParts = splitCSSValue(query)
  const declaredParts = splitCSSValue(declared)
  if (queryParts.length === 1) {
    const [part] = queryParts
    const color = partColor(part)
    if (color) return colorsIn(declared).some((found) => colorsEqual(found, color, tolerance.color))
    const number = parseCSSNumber(part)
    if (number !== null) {
      const numbers = declaredParts.map(parseCSSNumber).filter((found) => found !== null)
      if (numbers.length > 0)
        return numbers.every((found) => Math.abs(found - number) <= tolerance.number)
    }
    if (declared.includes(','))
      return declared.split(',').some((item) => partMatches(item, part, tolerance))
  }
  if (queryParts.length === declaredParts.length)
    return queryParts.every((part, index) => partMatches(declaredParts[index], part, tolerance))
  return normalize(declared) === normalize(query)
}

/**
 * Longhands a layer's CSS may carry in a shorthand instead: the shorthand and which of its parts,
 * for one, two, three or four parts, is the longhand's value.
 */
const LONGHAND_SOURCES: Partial<Record<string, ReadonlyArray<[string, readonly number[]]>>> = {
  'padding-top': [
    ['padding-block', [0, 0]],
    ['padding', [0, 0, 0, 0]]
  ],
  'padding-right': [
    ['padding-inline', [0, 1]],
    ['padding', [0, 1, 1, 1]]
  ],
  'padding-bottom': [
    ['padding-block', [0, 1]],
    ['padding', [0, 0, 2, 2]]
  ],
  'padding-left': [
    ['padding-inline', [0, 0]],
    ['padding', [0, 1, 1, 3]]
  ],
  'margin-top': [['margin', [0, 0, 0, 0]]],
  'margin-right': [['margin', [0, 1, 1, 1]]],
  'margin-bottom': [['margin', [0, 0, 2, 2]]],
  'margin-left': [['margin', [0, 1, 1, 3]]],
  'row-gap': [['gap', [0, 0]]],
  'column-gap': [['gap', [0, 1]]],
  'border-top-left-radius': [['border-radius', [0, 0, 0, 0]]],
  'border-top-right-radius': [['border-radius', [0, 1, 1, 1]]],
  'border-bottom-right-radius': [['border-radius', [0, 0, 2, 2]]],
  'border-bottom-left-radius': [['border-radius', [0, 1, 1, 3]]]
}

/**
 * The value a layer's CSS gives a property: its own declaration, else its part of a shorthand
 * the layer declares, so `padding-left` reads from `padding-inline` or `padding`.
 */
export function declaredValue(css: CSSDeclarations, property: string): string | undefined {
  if (Object.hasOwn(css, property)) return css[property]
  for (const [shorthand, indexes] of LONGHAND_SOURCES[property] ?? []) {
    if (!Object.hasOwn(css, shorthand)) continue
    // `border-radius: 8px / 4px` gives horizontal radii before the slash.
    const parts = splitCSSValue(css[shorthand].split('/')[0])
    if (parts.length > 0 && parts.length <= indexes.length) return parts[indexes[parts.length - 1]]
  }
  return undefined
}
