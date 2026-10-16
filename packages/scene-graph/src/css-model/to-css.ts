import { colorToCSS, colorToHex } from '../color'
import { CSS_BLEND_MODES } from '../css'
import { IDENTITY_GRADIENT_TRANSFORM, gradientPoint } from '../gradient'
import type { Color } from '../primitives'
import type { BlendMode, Effect, Fill, Stroke } from '../types'
import type { CSSDeclarations } from './types'

/** Opaque colors as hex, which Tailwind matches to its palette; translucent ones as `rgba()`. */
export function cssColor(color: Color): string {
  return color.a >= 1 ? colorToHex(color) : colorToCSS(color)
}

/** A solid paint's color as drawn: its own alpha times the paint's opacity. */
function paintToCSS(paint: Fill): string {
  return cssColor({ ...paint.color, a: paint.color.a * paint.opacity })
}

export function fillToCSS(fill: Fill | undefined): string | undefined {
  if (fill?.type !== 'SOLID' || !fill.visible) return undefined
  return paintToCSS(fill)
}

export function strokeColorToCSS(stroke: Stroke | undefined): string | undefined {
  if (!stroke?.visible) return undefined
  return paintToCSS(stroke)
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
export function effectsToCSS(effects: Effect[]): CSSDeclarations {
  const style: CSSDeclarations = {}
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

/** A point of gradient space in the layer's pixels. */
function gradientPixel(fill: Fill, width: number, height: number, x: number, y: number) {
  const unit = gradientPoint(fill.gradientTransform ?? IDENTITY_GRADIENT_TRANSFORM, { x, y })
  return { x: unit.x * width, y: unit.y * height }
}

/**
 * A linear gradient as CSS. The fill's transform maps the layer's unit box onto gradient space,
 * as Figma stores it, where the gradient runs from (0, 0.5) to (1, 0.5) and its bands follow the
 * y axis. CSS gradients run along an angle through the box's center, so the stops are
 * re-projected onto that line.
 */
function linearGradientToCSS(fill: Fill, width: number, height: number): string | undefined {
  if (!fill.gradientTransform || width <= 0 || height <= 0) return undefined
  const start = gradientPixel(fill, width, height, 0, 0.5)
  const end = gradientPixel(fill, width, height, 1, 0.5)
  const bandEnd = gradientPixel(fill, width, height, 0, 1.5)
  const along = { x: end.x - start.x, y: end.y - start.y }
  // The direction CSS draws along is across the lines of equal color.
  const iso = { x: bandEnd.x - start.x, y: bandEnd.y - start.y }
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

/** A radial gradient: centred on (0.5, 0.5) of gradient space with radius 0.5, an ellipse on the layer. */
function radialGradientToCSS(fill: Fill, width: number, height: number): string | undefined {
  if (!fill.gradientTransform || width <= 0 || height <= 0) return undefined
  const center = gradientPixel(fill, width, height, 0.5, 0.5)
  const edgeX = gradientPixel(fill, width, height, 1, 0.5)
  const edgeY = gradientPixel(fill, width, height, 0.5, 1)
  const rx = Math.hypot(edgeX.x - center.x, edgeX.y - center.y)
  const ry = Math.hypot(edgeY.x - center.x, edgeY.y - center.y) || rx
  const stops = gradientStopsToCSS(fill, (offset) => `${round(offset * 100)}%`)
  return `radial-gradient(${round((rx / width) * 100)}% ${round((ry / height) * 100)}% at ${round((center.x / width) * 100)}% ${round((center.y / height) * 100)}%, ${stops})`
}

/** An angular gradient: CSS `conic-gradient`, starting along the gradient's x axis. */
function angularGradientToCSS(fill: Fill, width: number, height: number): string | undefined {
  if (!fill.gradientTransform || width <= 0 || height <= 0) return undefined
  const center = gradientPixel(fill, width, height, 0.5, 0.5)
  const edge = gradientPixel(fill, width, height, 1, 0.5)
  const angle = (Math.atan2(edge.x - center.x, -(edge.y - center.y)) * 180) / Math.PI
  const stops = gradientStopsToCSS(fill, (offset) => `${round(offset * 100)}%`)
  return `conic-gradient(from ${round((angle + 360) % 360)}deg at ${round((center.x / width) * 100)}% ${round((center.y / height) * 100)}%, ${stops})`
}

/** One fill as a CSS background layer; solid colors become a flat gradient so they can stack. */
export function fillLayerToCSS(fill: Fill, width: number, height: number): string | undefined {
  if (!fill.visible) return undefined
  if (fill.type === 'SOLID') {
    const color = paintToCSS(fill)
    return `linear-gradient(${color}, ${color})`
  }
  if (fill.type === 'GRADIENT_LINEAR') return linearGradientToCSS(fill, width, height)
  // CSS has no diamond gradient; a radial one is the nearest.
  if (fill.type === 'GRADIENT_RADIAL' || fill.type === 'GRADIENT_DIAMOND')
    return radialGradientToCSS(fill, width, height)
  if (fill.type === 'GRADIENT_ANGULAR') return angularGradientToCSS(fill, width, height)
  return undefined
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
): CSSDeclarations | undefined {
  const visible = fills.filter((fill) => fill.visible && fill.type !== 'IMAGE')
  if (visible.length === 0) return undefined
  if (visible.length === 1 && visible[0].type === 'SOLID') return undefined
  const layers = visible
    .map((fill) => ({ fill, css: fillLayerToCSS(fill, width, height) }))
    .filter((layer): layer is { fill: Fill; css: string } => layer.css !== undefined)
    .reverse()
  if (layers.length === 0) return undefined
  const style: CSSDeclarations = {
    'background-image': layers.map((layer) => layer.css).join(', ')
  }
  const blends = layers.map((layer) => blendModeToCSS(layer.fill.blendMode) ?? 'normal')
  if (blends.some((blend) => blend !== 'normal')) style['background-blend-mode'] = blends.join(', ')
  return style
}
