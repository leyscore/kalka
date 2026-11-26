import type { SceneNode } from '@kalka/scene-graph'

import { FONT_WEIGHT_NAMES } from '#core/text/font/style'

/** Which way a text shortcut steps a value: Figma's `>` keys go up, its `<` keys down. */
export type TextStep = 1 | -1

/** A text layer's fields the stepping shortcuts read. */
type TextFields = Pick<
  SceneNode,
  | 'fontSize'
  | 'fontWeight'
  | 'lineHeight'
  | 'lineHeightUnit'
  | 'letterSpacing'
  | 'letterSpacingUnit'
>

const NAMED_WEIGHTS = Object.keys(FONT_WEIGHT_NAMES)
  .map(Number)
  .toSorted((a, b) => a - b)

/** The smallest size Figma's font size shortcut goes down to. */
const MIN_FONT_SIZE = 1

/** Rounds away the binary noise of decimal steps, such as 0.30000000000000004. */
function tidy(value: number): number {
  return Math.round(value * 100) / 100
}

/** The font size one step up or down, as Figma's Cmd+Shift+> and Cmd+Shift+< (1 px). */
export function steppedFontSize(fields: Pick<TextFields, 'fontSize'>, step: TextStep): number {
  return Math.max(MIN_FONT_SIZE, Math.round(fields.fontSize) + step)
}

/** The next named weight up or down, as Figma's Cmd+Alt+> and Cmd+Alt+<; the same at the ends. */
export function steppedFontWeight(fields: Pick<TextFields, 'fontWeight'>, step: TextStep): number {
  const { fontWeight } = fields
  const next =
    step > 0
      ? NAMED_WEIGHTS.find((weight) => weight > fontWeight)
      : NAMED_WEIGHTS.findLast((weight) => weight < fontWeight)
  return next ?? fontWeight
}

/**
 * The line height one step up or down, as Figma's Alt+Shift+> and Alt+Shift+<: 1 px, or 1 % of
 * the font size when set as a percentage. Auto starts from the font's usual 1.2 line height.
 */
export function steppedLineHeight(
  fields: Pick<TextFields, 'fontSize' | 'lineHeight' | 'lineHeightUnit'>,
  step: TextStep
): number {
  const current = fields.lineHeight ?? Math.round(fields.fontSize * 1.2)
  const amount = fields.lineHeightUnit === 'PERCENT' ? fields.fontSize / 100 : 1
  return Math.max(0, tidy(current + step * amount))
}

/**
 * The letter spacing one step up or down, as Figma's Alt+> and Alt+<: 1 % of the font size when
 * set as a percentage, otherwise a tenth of a pixel.
 */
export function steppedLetterSpacing(
  fields: Pick<TextFields, 'fontSize' | 'letterSpacing' | 'letterSpacingUnit'>,
  step: TextStep
): number {
  const amount = fields.letterSpacingUnit === 'PERCENT' ? fields.fontSize / 100 : 0.1
  return tidy(fields.letterSpacing + step * amount)
}
