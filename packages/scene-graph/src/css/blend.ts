import type { BlendMode } from '../types'

/**
 * The CSS `mix-blend-mode` for each blend mode CSS and SVG can draw. Normal, pass-through and the
 * linear modes have none.
 */
export const CSS_BLEND_MODES: Partial<Record<BlendMode, string>> = {
  DARKEN: 'darken',
  MULTIPLY: 'multiply',
  COLOR_BURN: 'color-burn',
  LIGHTEN: 'lighten',
  SCREEN: 'screen',
  COLOR_DODGE: 'color-dodge',
  OVERLAY: 'overlay',
  SOFT_LIGHT: 'soft-light',
  HARD_LIGHT: 'hard-light',
  DIFFERENCE: 'difference',
  EXCLUSION: 'exclusion',
  HUE: 'hue',
  SATURATION: 'saturation',
  COLOR: 'color',
  LUMINOSITY: 'luminosity'
}
