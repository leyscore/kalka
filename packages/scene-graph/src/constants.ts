import type { Color } from './primitives'
import type { InterVersion } from './types'

export const BLACK: Color = { r: 0, g: 0, b: 0, a: 1 }
export const WHITE: Color = { r: 1, g: 1, b: 1, a: 1 }
export const TRANSPARENT: Color = { r: 0, g: 0, b: 0, a: 0 }
export const DEFAULT_FONT_FAMILY = 'Inter'
/** The Inter a document made in Kalka uses. */
export const DEFAULT_INTER_VERSION = '4' satisfies InterVersion
/** The Inter Figma lays text out with, which documents from Figma keep. */
export const FIGMA_INTER_VERSION = '3.19' satisfies InterVersion
export const DEFAULT_STROKE_MITER_LIMIT = 4
export const DEFAULT_STROKE_WEIGHT = 1
