import type { SceneNode } from '@kalka/scene-graph'

import type { DesignStyleDeclaration } from '../types'

/**
 * Device pixels to a CSS pixel where a page is drawn: a number when it is known, such as an
 * export's scale, or a CSS expression the page keeps current, such as the canvas zoom.
 */
export type HairlineScale = number | string

/** `<width> <style> <colour>`, as the stroke model writes an outline or a border. */
const LINE = /^\s*(\S+)\s+(solid|dashed|dotted)\s+(.+?)\s*$/

function round(value: number): number {
  return Math.round(value * 1000) / 1000
}

/**
 * A browser draws at least one device pixel of an outline or border, at full colour, however
 * thin it is; Figma draws a stroke thinner than a pixel as the part of the pixel it covers. Such
 * a stroke keeps its width and draws its colour faded by what it covers at `scale`, so a 0.25 px
 * border reads at a quarter strength at 1× and at full strength from 4×.
 */
export function hairlineStyle(
  node: SceneNode,
  style: DesignStyleDeclaration | undefined,
  scale: HairlineScale | undefined
): DesignStyleDeclaration {
  if (scale === undefined || !style || node.independentStrokeWeights) return {}
  const weight = node.strokes.at(0)?.weight ?? 0
  if (weight <= 0 || weight >= 1) return {}
  const property = style.outline ? 'outline' : style.border ? 'border' : null
  const color = property ? LINE.exec(style[property] ?? '')?.[3] : undefined
  if (!property || !color) return {}
  let share: string
  if (typeof scale === 'number') {
    const coverage = weight * scale
    if (coverage >= 1) return {}
    share = `${round(coverage * 100)}%`
  } else {
    share = `calc(min(1, ${round(weight)} * ${scale}) * 100%)`
  }
  return { [`${property}-color`]: `color-mix(in srgb, ${color} ${share}, transparent)` }
}
