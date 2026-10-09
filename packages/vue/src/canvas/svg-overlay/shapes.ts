import { colorToCSS } from '@open-pencil/scene-graph/color'
import type { Mat3 } from '@open-pencil/scene-graph/matrix'
import type { Color } from '@open-pencil/scene-graph/primitives'

/**
 * Overlay drawings as plain data, in screen pixels unless a group places them with a matrix.
 * Layers are pure functions from editor state to these, so they test without a browser; one
 * Vue renderer turns them into SVG. Strokes never scale: a 1px line is 1px at every zoom.
 */
export interface Paint {
  stroke?: string
  /** Screen pixels. */
  strokeWidth?: number
  /** Dash and gap, in screen pixels. */
  dash?: readonly [number, number]
  fill?: string
  opacity?: number
}

export type OverlayShape =
  | ({ type: 'rect'; x: number; y: number; width: number; height: number; rx?: number } & Paint)
  | ({ type: 'ellipse'; cx: number; cy: number; rx: number; ry: number } & Paint)
  | ({ type: 'line'; x1: number; y1: number; x2: number; y2: number } & Paint)
  | ({ type: 'path'; d: string } & Paint)
  | ({ type: 'polygon'; points: readonly number[] } & Paint)
  | {
      type: 'text'
      x: number
      y: number
      text: string
      fill: string
      fontSize: number
      fontWeight?: number
      fontFamily?: string
      /** Where `x` sits along the text; its start by default. */
      anchor?: 'start' | 'middle' | 'end'
      /** Whether `y` is the text's baseline (default) or the top of its line. */
      baseline?: 'alphabetic' | 'top'
      opacity?: number
    }
  | { type: 'group'; matrix?: Mat3; opacity?: number; children: OverlayShape[] }

/** A color as CSS, with an optional alpha that replaces its own. */
export function css(color: Color, alpha = color.a): string {
  return colorToCSS({ ...color, a: alpha })
}

/** A row-major 3×3 matrix as an SVG transform. */
export function svgMatrix(m: Mat3): string {
  return `matrix(${m[0]} ${m[3]} ${m[1]} ${m[4]} ${m[2]} ${m[5]})`
}

/** Measures text as the overlay draws it, for pills sized to their label. */
export type MeasureText = (text: string, fontSize: number, fontWeight?: number) => number
