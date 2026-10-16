import { TRANSPARENT } from '../constants'
import { parseCSSColor, parseCSSNumber, splitCSSValue } from '../css'
import type { Color } from '../primitives'
import type { BlendMode, Effect, Stroke } from '../types'
import type { CSSDeclarations } from './types'

const LINE_STYLES = new Set([
  'none',
  'hidden',
  'dotted',
  'dashed',
  'solid',
  'double',
  'groove',
  'ridge',
  'inset',
  'outset'
])

/** A `border` or `outline` value: a width, a line style, and a color, in any order. */
export interface LineShorthand {
  width: string | undefined
  style: string | undefined
  color: string | undefined
}

export function parseLineShorthand(value: string | undefined): LineShorthand | null {
  if (!value) return null
  const line: LineShorthand = { width: undefined, style: undefined, color: undefined }
  for (const part of splitCSSValue(value)) {
    const lower = part.toLowerCase()
    if (LINE_STYLES.has(lower)) line.style = lower
    else if (parseCSSNumber(part) !== null) line.width = part
    else line.color = part
  }
  return line
}

const BORDER_SIDES = ['top', 'right', 'bottom', 'left'] as const

/**
 * Border longhands from the `border` and `border-<side>` shorthands, which a `style` attribute
 * keeps as written. Longhands the element sets itself win.
 */
export function expandBorderShorthands(style: CSSDeclarations): CSSDeclarations {
  const expanded: CSSDeclarations = {}
  const all = parseLineShorthand(style.border)
  if (all) {
    if (all.width) expanded['border-width'] = all.width
    if (all.style) expanded['border-style'] = all.style
    if (all.color) expanded['border-color'] = all.color
  }
  for (const side of BORDER_SIDES) {
    const line = parseLineShorthand(style[`border-${side}`])
    if (!line) continue
    if (line.width) expanded[`border-${side}-width`] = line.width
    if (line.style) expanded[`border-${side}-style`] = line.style
    if (line.color) expanded[`border-${side}-color`] = line.color
  }
  return { ...expanded, ...style }
}

/** A solid paint as Figma keeps one: an opaque color, its alpha as the paint's opacity. */
export function paintColor(color: Color): { color: Color; opacity: number } {
  return { color: { ...color, a: 1 }, opacity: color.a }
}

/**
 * The stroke an `outline` draws: one that takes no room in auto layout, inside, centered on,
 * or outside the edge as `outline-offset` places it.
 */
export function outlineStroke(style: CSSDeclarations): { stroke: Stroke; dashed: boolean } | null {
  const line = parseLineShorthand(style.outline)
  const width = parseCSSNumber(style['outline-width'] ?? line?.width)
  const color = parseCSSColor(style['outline-color'] ?? line?.color)
  const lineStyle = style['outline-style'] ?? line?.style
  if (width === null || width <= 0 || !color || lineStyle === 'none') return null
  const offset = parseCSSNumber(style['outline-offset']) ?? 0
  let align: Stroke['align'] = 'OUTSIDE'
  if (offset === -width) align = 'INSIDE'
  else if (offset === -width / 2) align = 'CENTER'
  return {
    stroke: { type: 'SOLID', ...paintColor(color), weight: width, visible: true, align },
    dashed: lineStyle === 'dashed' || lineStyle === 'dotted'
  }
}

/** The blur in `blur(8px)`, or null. */
/** The radius of the `blur()` in a filter list, such as `blur(150px) brightness(1.1)`. */
function blurRadius(value: string | undefined): number | null {
  const match = value ? /(?:^|\s)blur\(([^)]*)\)/i.exec(value) : null
  return match ? parseCSSNumber(match[1]) : null
}

function blurEffect(type: Effect['type'], radius: number): Effect {
  return {
    type,
    color: { ...TRANSPARENT },
    offset: { x: 0, y: 0 },
    radius,
    spread: 0,
    visible: true
  }
}

/** Layer blur from `filter: blur()`, background blur from `backdrop-filter: blur()`. */
export function blurEffects(style: CSSDeclarations): Effect[] {
  const effects: Effect[] = []
  const layer = blurRadius(style.filter)
  if (layer !== null) effects.push(blurEffect('LAYER_BLUR', layer))
  const background = blurRadius(style['backdrop-filter'])
  if (background !== null) effects.push(blurEffect('BACKGROUND_BLUR', background))
  return effects
}

const BLEND_MODES: Record<string, BlendMode> = {
  normal: 'NORMAL',
  darken: 'DARKEN',
  multiply: 'MULTIPLY',
  'color-burn': 'COLOR_BURN',
  lighten: 'LIGHTEN',
  screen: 'SCREEN',
  'color-dodge': 'COLOR_DODGE',
  overlay: 'OVERLAY',
  'soft-light': 'SOFT_LIGHT',
  'hard-light': 'HARD_LIGHT',
  difference: 'DIFFERENCE',
  exclusion: 'EXCLUSION',
  hue: 'HUE',
  saturation: 'SATURATION',
  color: 'COLOR',
  luminosity: 'LUMINOSITY'
}

/** A `mix-blend-mode` as a layer blend mode; undefined for `normal` and unknown values. */
export function blendModeFromCSS(value: string | undefined): BlendMode | undefined {
  if (!value) return undefined
  const mode = BLEND_MODES[value.trim().toLowerCase()]
  return mode === 'NORMAL' ? undefined : mode
}

/** The angle of `transform: rotate(12deg)`, in degrees; null for any other transform. */
export function rotationFromCSS(value: string | undefined): number | null {
  const match = value ? /^rotate\(\s*([-+0-9.e]+)deg\s*\)$/i.exec(value.trim()) : null
  if (!match) return null
  const angle = Number(match[1])
  return Number.isFinite(angle) ? angle : null
}
