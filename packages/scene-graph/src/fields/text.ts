import type { SceneNode } from '../types'

/** Fields shared by shaping, paragraph measurement, and auto-width invalidation. */
export const TEXT_METRIC_FIELDS = [
  'text',
  'fontSize',
  'fontFamily',
  'fontWeight',
  'italic',
  'letterSpacing',
  'styleRuns',
  'fontVariations',
  'fontFeatures',
  'paragraphSpacing',
  'paragraphIndent',
  'listLines'
] as const satisfies readonly (keyof SceneNode)[]

export const TEXT_SHAPING_FIELDS = [
  ...TEXT_METRIC_FIELDS,
  'lineHeight',
  'textCase',
  'textDirection',
  'textAlignHorizontal',
  'textAlignVertical'
] as const satisfies readonly (keyof SceneNode)[]

export const TEXT_LAYOUT_FIELDS = [
  'width',
  'height',
  'textAutoResize',
  'maxLines'
] as const satisfies readonly (keyof SceneNode)[]

export const TEXT_DECORATION_FIELDS = [
  'textDecoration',
  'textDecorationStyle',
  'textDecorationThickness',
  'textUnderlineOffset',
  'textDecorationFills',
  'textDecorationSkipInk'
] as const satisfies readonly (keyof SceneNode)[]

/** How text is styled, apart from its content and how its box sizes. */
export const TEXT_STYLE_FIELDS = [
  'fontFamily',
  'fontSize',
  'fontWeight',
  'italic',
  'lineHeight',
  'lineHeightUnit',
  'letterSpacing',
  'letterSpacingUnit',
  'paragraphSpacing',
  'paragraphIndent',
  'textAlignHorizontal',
  'textAlignVertical',
  'textCase',
  ...TEXT_DECORATION_FIELDS,
  'fontFeatures',
  'fontVariations'
] as const satisfies readonly (keyof SceneNode)[]

/**
 * What a shared text style holds and gives the layers that use it, as Figma's text styles do: the
 * font, its size and spacing, paragraph spacing and indent, decoration, case and OpenType features.
 * Alignment and how the box sizes stay with each layer.
 */
export const SHARED_TEXT_STYLE_FIELDS = [
  'fontFamily',
  'fontWeight',
  'italic',
  'fontSize',
  'lineHeight',
  'lineHeightUnit',
  'letterSpacing',
  'letterSpacingUnit',
  'paragraphSpacing',
  'paragraphIndent',
  'textDecoration',
  'textCase',
  'fontFeatures'
] as const satisfies readonly (keyof SceneNode)[]
