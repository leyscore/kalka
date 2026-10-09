import type { BlendMode, Effect, Fill, Stroke } from '@open-pencil/scene-graph'
import { colorToCSS, colorToHex } from '@open-pencil/scene-graph/color'
import type { Color } from '@open-pencil/scene-graph/primitives'

import type { DesignStyleDeclaration } from '../types'

/** Opaque colors as hex, which Tailwind matches to its palette; translucent ones as `rgba()`. */
export function cssColor(color: Color): string {
  return color.a >= 1 ? colorToHex(color) : colorToCSS(color)
}

export function fillToCSS(fill: Fill | undefined): string | undefined {
  if (fill?.type !== 'SOLID' || !fill.visible) return undefined
  return cssColor({ ...fill.color, a: fill.opacity })
}

export function strokeColorToCSS(stroke: Stroke | undefined): string | undefined {
  if (!stroke?.visible) return undefined
  return cssColor({ ...stroke.color, a: stroke.opacity })
}

function shadowToCSS(effect: Effect): string {
  const inset = effect.type === 'INNER_SHADOW' ? 'inset ' : ''
  return `${inset}${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px ${effect.spread}px ${cssColor(effect.color)}`
}

export function dropShadowToCSS(effect: Effect | undefined): string | undefined {
  if (effect?.type !== 'DROP_SHADOW' || !effect.visible) return undefined
  return shadowToCSS(effect)
}

/** Every visible shadow, in order, plus layer and background blur. */
export function effectsToCSS(effects: Effect[]): DesignStyleDeclaration {
  const style: DesignStyleDeclaration = {}
  const visible = effects.filter((effect) => effect.visible)
  const shadows = visible.filter(
    (effect) => effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW'
  )
  if (shadows.length > 0) style['box-shadow'] = shadows.map(shadowToCSS).join(', ')
  for (const effect of visible) {
    if (effect.type === 'LAYER_BLUR' || effect.type === 'FOREGROUND_BLUR')
      style.filter = `blur(${effect.radius}px)`
    if (effect.type === 'BACKGROUND_BLUR') style['backdrop-filter'] = `blur(${effect.radius}px)`
  }
  return style
}

const round = (value: number, digits = 2) => {
  const scale = 10 ** digits
  return Math.round(value * scale) / scale
}

function gradientStopsToCSS(fill: Fill, position: (offset: number) => string): string {
  return (fill.gradientStops ?? [])
    .map(
      (stop) =>
        `${cssColor({ ...stop.color, a: stop.color.a * fill.opacity })} ${position(stop.position)}`
    )
    .join(', ')
}

/**
 * A linear gradient as CSS. The fill's transform maps gradient space onto the layer's unit box:
 * the gradient runs from its image of (0, 0) to its image of (1, 0). CSS gradients run along an
 * angle through the box's center, so the stops are re-projected onto that line.
 */
function linearGradientToCSS(fill: Fill, width: number, height: number): string | undefined {
  const t = fill.gradientTransform
  if (!t || width <= 0 || height <= 0) return undefined
  const start = { x: t.m02 * width, y: t.m12 * height }
  const end = { x: (t.m00 + t.m02) * width, y: (t.m10 + t.m12) * height }
  const along = { x: end.x - start.x, y: end.y - start.y }
  // The direction CSS draws along is across the lines of equal color.
  const iso = { x: t.m01 * width, y: t.m11 * height }
  let ux = along.x
  let uy = along.y
  if (Math.hypot(iso.x, iso.y) > 1e-9) {
    ux = -iso.y
    uy = iso.x
    if (ux * along.x + uy * along.y < 0) {
      ux = -ux
      uy = -uy
    }
  }
  const length = Math.hypot(ux, uy)
  if (length < 1e-9) return undefined
  ux /= length
  uy /= length
  const angle = (Math.atan2(ux, -uy) * 180) / Math.PI
  const line = Math.abs(width * ux) + Math.abs(height * uy)
  const startOnLine = (start.x - width / 2) * ux + (start.y - height / 2) * uy + line / 2
  const span = along.x * ux + along.y * uy
  const stops = gradientStopsToCSS(
    fill,
    (offset) => `${round(((startOnLine + offset * span) / line) * 100)}%`
  )
  return `linear-gradient(${round((angle + 360) % 360)}deg, ${stops})`
}

/** A radial gradient: a unit circle in gradient space, an ellipse on the layer. */
function radialGradientToCSS(fill: Fill, width: number, height: number): string | undefined {
  const t = fill.gradientTransform
  if (!t || width <= 0 || height <= 0) return undefined
  const rx = Math.hypot(t.m00 * width, t.m10 * height)
  const ry = Math.hypot(t.m01 * width, t.m11 * height) || rx
  const stops = gradientStopsToCSS(fill, (offset) => `${round(offset * 100)}%`)
  return `radial-gradient(${round((rx / width) * 100)}% ${round((ry / height) * 100)}% at ${round(t.m02 * 100)}% ${round(t.m12 * 100)}%, ${stops})`
}

/** An angular gradient: CSS `conic-gradient`, starting along the gradient's x axis. */
function angularGradientToCSS(fill: Fill, width: number, height: number): string | undefined {
  const t = fill.gradientTransform
  if (!t || width <= 0 || height <= 0) return undefined
  const angle = (Math.atan2(t.m00 * width, -(t.m10 * height)) * 180) / Math.PI
  const stops = gradientStopsToCSS(fill, (offset) => `${round(offset * 100)}%`)
  return `conic-gradient(from ${round((angle + 360) % 360)}deg at ${round(t.m02 * 100)}% ${round(t.m12 * 100)}%, ${stops})`
}

/** One fill as a CSS background layer; solid colors become a flat gradient so they can stack. */
export function fillLayerToCSS(fill: Fill, width: number, height: number): string | undefined {
  if (!fill.visible) return undefined
  if (fill.type === 'SOLID') {
    const color = cssColor({ ...fill.color, a: fill.opacity })
    return `linear-gradient(${color}, ${color})`
  }
  if (fill.type === 'GRADIENT_LINEAR') return linearGradientToCSS(fill, width, height)
  // CSS has no diamond gradient; a radial one is the nearest.
  if (fill.type === 'GRADIENT_RADIAL' || fill.type === 'GRADIENT_DIAMOND')
    return radialGradientToCSS(fill, width, height)
  if (fill.type === 'GRADIENT_ANGULAR') return angularGradientToCSS(fill, width, height)
  return undefined
}

const CSS_BLEND_MODES: Partial<Record<BlendMode, string>> = {
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

/** A blend mode CSS can draw, or undefined for normal, pass-through, and the linear modes. */
export function blendModeToCSS(mode: BlendMode | undefined): string | undefined {
  return mode ? CSS_BLEND_MODES[mode] : undefined
}

/**
 * Fills that a single `background-color` cannot draw: gradients, or several layers. Figma lists
 * fills bottom to top, CSS backgrounds top to bottom. Undefined when one solid color is enough.
 */
export function fillsToBackground(
  fills: readonly Fill[],
  width: number,
  height: number
): DesignStyleDeclaration | undefined {
  const visible = fills.filter((fill) => fill.visible && fill.type !== 'IMAGE')
  if (visible.length === 0) return undefined
  if (visible.length === 1 && visible[0].type === 'SOLID') return undefined
  const layers = visible
    .map((fill) => ({ fill, css: fillLayerToCSS(fill, width, height) }))
    .filter((layer): layer is { fill: Fill; css: string } => layer.css !== undefined)
    .reverse()
  if (layers.length === 0) return undefined
  const style: DesignStyleDeclaration = {
    'background-image': layers.map((layer) => layer.css).join(', ')
  }
  const blends = layers.map((layer) => blendModeToCSS(layer.fill.blendMode) ?? 'normal')
  if (blends.some((blend) => blend !== 'normal')) style['background-blend-mode'] = blends.join(', ')
  return style
}
