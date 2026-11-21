import { colorToCSS } from '@kalka/scene-graph/color'

/**
 * The colour roles Fresh components paint with. Each is a CSS custom property named as the
 * design guide names variables (`ground`, `ink`, `accent`, `muted`, `line` in a colour
 * collection become `--color-ground` and so on), so a component takes the document's colours
 * on the canvas and in exported code, and these fallbacks when the document has none.
 */
export const COLOR_ROLES = {
  ground: '#f1f1ec',
  ink: '#141413',
  accent: '#2f5bea',
  muted: '#6b6b66',
  line: '#d4d3cc'
} as const

export type ColorRole = keyof typeof COLOR_ROLES

/** The role as CSS, `var(--color-accent, #2f5bea)`. */
export function role(name: ColorRole): string {
  return `var(--color-${name}, ${COLOR_ROLES[name]})`
}

/** The role mixed with another colour, by the role's share in percent. */
export function mix(name: ColorRole, percent: number, other = 'transparent'): string {
  return `color-mix(in oklab, ${role(name)} ${percent}%, ${other})`
}

/** White at an opacity, for highlights that stay light in every palette. */
export function white(alpha: number): string {
  return colorToCSS({ r: 1, g: 1, b: 1, a: alpha })
}

/** Black at an opacity, for shading that stays dark in every palette. */
export function black(alpha: number): string {
  return colorToCSS({ r: 0, g: 0, b: 0, a: alpha })
}
