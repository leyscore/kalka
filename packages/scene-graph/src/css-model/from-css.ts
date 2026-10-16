import { parseCSSColor, parseCSSNumber } from '../css'
import type { Fill, Stroke } from '../types'
import { paintColor } from './paint-from-css'
import type { CSSDeclarations } from './types'

export function colorToFillFromCSS(value: string | undefined): Fill[] {
  const color = parseCSSColor(value)
  if (!color) return []
  return [{ type: 'SOLID', ...paintColor(color), visible: true }]
}

export function colorToStrokeFromCSS(
  colorValue: string | undefined,
  weightValue: string | undefined
): Stroke[] {
  const color = parseCSSColor(colorValue)
  const weight = parseCSSNumber(weightValue)
  if (!color || weight === null || weight <= 0) return []
  return [{ type: 'SOLID', ...paintColor(color), weight, visible: true, align: 'INSIDE' }]
}

export function pickStyle(elementStyle: CSSDeclarations | undefined, property: string) {
  return elementStyle?.[property]
}

export function mergedStyle(node: {
  inlineStyle?: CSSDeclarations
  computedStyle?: CSSDeclarations
}) {
  return { ...node.inlineStyle, ...node.computedStyle }
}

/** Whether a background is clipped to the text, which then paints the letters, not the box. */
export function clipsBackgroundToText(style: CSSDeclarations): boolean {
  return [pickStyle(style, 'background-clip'), pickStyle(style, '-webkit-background-clip')].some(
    (value) => value?.trim() === 'text'
  )
}
