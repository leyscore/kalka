import type { TextSpacingUnit } from '@kalka/scene-graph'

/** What a line height or letter spacing field was given: Figma's Auto, or a number and unit. */
export type TypedSpacing = { auto: true } | { auto: false; value: number; unit: TextSpacingUnit }

/**
 * Reads `Auto`, `150%` or `24px` as Figma's spacing fields take them. A bare number is a valid
 * value the field handles itself, so it is not read here.
 */
export function parseTypedSpacing(expression: string): TypedSpacing | null {
  const source = expression.trim().toLowerCase()
  if (source === 'auto') return { auto: true }
  const match = /^(-?(?:\d+(?:\.\d*)?|\.\d+))\s*(%|px)$/.exec(source)
  if (!match) return null
  return { auto: false, value: Number(match[1]), unit: match[2] === '%' ? 'PERCENT' : 'PIXELS' }
}
