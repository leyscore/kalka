/**
 * Effects CSS has no function for, drawn by SVG filters the browser runs: image adjustments,
 * noise, texture, progressive blur and glass refraction. Each filter is a `data:` URL a `filter`
 * or `backdrop-filter` list refers to, so the layer stays one element with its own CSS, on the
 * canvas and in export alike. The CanvasKit renderer draws the same effects for raster exports
 * (`packages/core/src/canvas/effects.ts`).
 */
import { colorToCSS, colorToHex } from '../color'
import { CSS_BLEND_MODES } from '../css'
import { hasImageFilters, imageFilterMatrix } from '../image-filters'
import type { Color, Vector } from '../primitives'
import type { Effect, ImageFilters } from '../types'

const SVG_NS = 'http://www.w3.org/2000/svg'

const num = (value: number) => String(Math.round(value * 1000) / 1000)

/** A filter of `body` as a `url()` CSS can list beside its own filter functions. */
function filterURL(body: string, attrs = ''): string {
  const svg = `<svg xmlns='${SVG_NS}'><filter id='f' color-interpolation-filters='sRGB'${attrs}>${body}</filter></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}#f")`
}

/**
 * An SVG image as a `data:` URL, for `feImage`. Its quotes are escaped too: the URL sits in a
 * quoted attribute of the filter's own SVG.
 */
function imageURL(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg).replaceAll("'", '%27')}`
}

function flood(color: Color, result: string): string {
  return `<feFlood flood-color='${colorToHex({ ...color, a: 1 })}' flood-opacity='${num(color.a)}' result='${result}'/>`
}

/** Image adjustments as one color matrix (`@kalka/scene-graph/image-filters`). */
export function imageFiltersToCSS(filters: ImageFilters | undefined): string | undefined {
  if (!hasImageFilters(filters)) return undefined
  const values = imageFilterMatrix(filters).map(num).join(' ')
  return filterURL(`<feColorMatrix type='matrix' values='${values}'/>`)
}

/** A grain size as a turbulence frequency: a grain is about twice its size across. */
function grainFrequency(size: number | undefined): string {
  return num(1 / (2 * Math.max(0.25, size ?? DEFAULT_NOISE_SIZE)))
}

export const DEFAULT_NOISE_SIZE = 0.5
export const DEFAULT_NOISE_DENSITY = 0.5

/**
 * The cells of fractal noise above the level that leaves `density` of them, as an alpha mask.
 * Single-octave fractal noise gathers around 0.5, so the level moves within its usual spread.
 */
function grainMask(effect: Effect, seed: number, density: number, result: string): string {
  const level = 0.5 + 0.4 * (0.5 - density)
  const steps = 32
  const table = Array.from({ length: steps }, (_, step) =>
    (step + 0.5) / steps > level ? '1' : '0'
  ).join(' ')
  return (
    `<feTurbulence type='fractalNoise' baseFrequency='${grainFrequency(effect.noiseSize)}' numOctaves='1' seed='${seed}' result='${result}n'/>` +
    `<feColorMatrix in='${result}n' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0' result='${result}r'/>` +
    `<feComponentTransfer in='${result}r' result='${result}'><feFuncA type='discrete' tableValues='${table}'/></feComponentTransfer>`
  )
}

/**
 * Noise: grains over the layer's own pixels, in one color, two colors, or many colors at the
 * effect's opacity, blended with the layer by the effect's blend mode.
 */
function noiseFilter(effect: Effect, seed: number): string | undefined {
  const density = Math.max(0, Math.min(1, effect.density ?? DEFAULT_NOISE_DENSITY))
  if (density === 0) return undefined
  let grains: string
  if (effect.noiseType === 'MULTITONE') {
    const opacity = Math.max(0, Math.min(1, effect.opacity ?? 1))
    grains =
      grainMask(effect, seed, density, 'm') +
      `<feTurbulence type='fractalNoise' baseFrequency='${grainFrequency(effect.noiseSize)}' numOctaves='1' seed='${seed + 7}' result='c'/>` +
      `<feColorMatrix in='c' type='matrix' values='3 0 0 0 -1 0 3 0 0 -1 0 0 3 0 -1 0 0 0 0 ${num(opacity)}' result='cc'/>` +
      `<feComposite in='cc' in2='m' operator='in' result='g'/>`
  } else if (effect.noiseType === 'DUOTONE') {
    const second = effect.secondaryColor ?? { r: 1, g: 1, b: 1, a: 1 }
    grains =
      grainMask(effect, seed, density / 2, 'm') +
      grainMask(effect, seed + 1, density / 2, 'm2') +
      flood(effect.color, 'c1') +
      `<feComposite in='c1' in2='m' operator='in' result='g1'/>` +
      flood(second, 'c2') +
      `<feComposite in='c2' in2='m2' operator='in' result='g2'/>` +
      `<feMerge result='g'><feMergeNode in='g2'/><feMergeNode in='g1'/></feMerge>`
  } else {
    grains =
      grainMask(effect, seed, density, 'm') +
      flood(effect.color, 'c') +
      `<feComposite in='c' in2='m' operator='in' result='g'/>`
  }
  const mode = (effect.blendMode && CSS_BLEND_MODES[effect.blendMode]) ?? 'normal'
  return filterURL(
    `${grains}<feComposite in='g' in2='SourceAlpha' operator='in' result='k'/>` +
      `<feBlend in='k' in2='SourceGraphic' mode='${mode}' result='b'/>` +
      `<feComposite in='b' in2='SourceAlpha' operator='in'/>`
  )
}

/** Texture: the layer's pixels scattered by up to `radius`, kept to its shape when asked. */
function textureFilter(effect: Effect, seed: number): string | undefined {
  if (effect.radius <= 0) return undefined
  const scatter =
    `<feTurbulence type='fractalNoise' baseFrequency='${grainFrequency(effect.noiseSize)}' numOctaves='1' seed='${seed}' result='n'/>` +
    `<feDisplacementMap in='SourceGraphic' in2='n' scale='${num(effect.radius * 2)}' xChannelSelector='R' yChannelSelector='G' result='d'/>`
  const clip =
    effect.clipToShape === false ? '' : `<feComposite in='d' in2='SourceAlpha' operator='in'/>`
  return filterURL(scatter + clip)
}

const DEFAULT_START: Vector = { x: 0.5, y: 0 }
const DEFAULT_END: Vector = { x: 0.5, y: 1 }

/**
 * A progressive blur: the layer blurred by `startRadius` fading into it blurred by `radius`
 * along the line from `startOffset` to `endOffset`, both in the layer's unit box.
 */
function progressiveBlurFilter(effect: Effect, width: number, height: number): string {
  const start = effect.startOffset ?? DEFAULT_START
  const end = effect.endOffset ?? DEFAULT_END
  const pad = Math.ceil(Math.max(effect.radius, effect.startRadius ?? 0) * 3)
  const box = { x: -pad, y: -pad, width: width + pad * 2, height: height + pad * 2 }
  const ramp =
    `<svg xmlns='${SVG_NS}' width='${num(box.width)}' height='${num(box.height)}' viewBox='${num(box.x)} ${num(box.y)} ${num(box.width)} ${num(box.height)}'>` +
    `<linearGradient id='r' gradientUnits='userSpaceOnUse' x1='${num(start.x * width)}' y1='${num(start.y * height)}' x2='${num(end.x * width)}' y2='${num(end.y * height)}'>` +
    `<stop offset='0' stop-color='#fff' stop-opacity='0'/><stop offset='1' stop-color='#fff'/></linearGradient>` +
    `<rect x='${num(box.x)}' y='${num(box.y)}' width='${num(box.width)}' height='${num(box.height)}' fill='url(#r)'/></svg>`
  const region = `x='${num(box.x)}' y='${num(box.y)}' width='${num(box.width)}' height='${num(box.height)}'`
  return filterURL(
    `<feGaussianBlur in='SourceGraphic' stdDeviation='${num(effect.startRadius ?? 0)}' result='a'/>` +
      `<feGaussianBlur in='SourceGraphic' stdDeviation='${num(effect.radius)}' result='b'/>` +
      `<feImage href='${imageURL(ramp)}' ${region} preserveAspectRatio='none' result='m'/>` +
      `<feComposite in='b' in2='m' operator='in' result='bm'/>` +
      `<feComposite in='a' in2='m' operator='out' result='am'/>` +
      `<feComposite in='bm' in2='am' operator='arithmetic' k2='1' k3='1'/>`,
    ` filterUnits='userSpaceOnUse' primitiveUnits='userSpaceOnUse' ${region}`
  )
}

function blurToCSS(effect: Effect, width: number, height: number): string {
  return effect.blurType === 'PROGRESSIVE'
    ? progressiveBlurFilter(effect, width, height)
    : `blur(${num(effect.radius)}px)`
}

/** Keeps one colour channel of what it is given, and its alpha. */
const CHANNEL_MATRICES = {
  r: '1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0',
  g: '0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0',
  b: '0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0'
} as const

/**
 * The displacement of what lies behind a glass by the map `m`. With dispersion each colour
 * channel bends by its own amount, red least and blue most, as light through a prism, and the
 * three are added back together: the colour fringes Figma draws at a glass's edges.
 */
function glassDisplacement(scale: number, dispersion: number): string {
  const displace = (amount: number, result = '') =>
    `<feDisplacementMap in='SourceGraphic' in2='m' scale='${num(amount)}' xChannelSelector='R' yChannelSelector='G'${result}/>`
  if (dispersion <= 0) return displace(scale)
  const spread = 0.5 * dispersion
  const channel = (name: 'r' | 'g' | 'b', amount: number) =>
    displace(amount, ` result='d${name}'`) +
    `<feColorMatrix in='d${name}' type='matrix' values='${CHANNEL_MATRICES[name]}' result='${name}'/>`
  return (
    channel('r', scale * (1 - spread)) +
    channel('g', scale) +
    channel('b', scale * (1 + spread)) +
    `<feComposite in='r' in2='g' operator='arithmetic' k2='1' k3='1' result='rg'/>` +
    `<feComposite in='rg' in2='b' operator='arithmetic' k2='1' k3='1'/>`
  )
}

/**
 * A glass's refraction: what lies behind is pulled in from the edges over a band as deep as the
 * glass, as through the rim of a lens. One gradient per axis displaces it.
 */
function glassRefractionFilter(effect: Effect, width: number, height: number): string | undefined {
  const refraction = Math.max(0, Math.min(1, effect.refraction ?? 0))
  if (refraction === 0 || width <= 0 || height <= 0) return undefined
  const band = Math.max(1, Math.min(effect.depth ?? 20, width / 2, height / 2))
  const ramp = (length: number, channel: 'r' | 'g') => {
    const color = (value: number) =>
      colorToHex(channel === 'r' ? { r: value, g: 0, b: 0, a: 1 } : { r: 0, g: value, b: 0, a: 1 })
    const vertical = channel === 'g'
    const size = `width='${num(width)}' height='${num(height)}'`
    return imageURL(
      `<svg xmlns='${SVG_NS}' ${size}><linearGradient id='l' x1='0' y1='0' x2='${vertical ? 0 : 1}' y2='${vertical ? 1 : 0}'>` +
        `<stop offset='0' stop-color='${color(1)}'/><stop offset='${num(band / length)}' stop-color='${color(0.5)}'/>` +
        `<stop offset='${num(1 - band / length)}' stop-color='${color(0.5)}'/><stop offset='1' stop-color='${color(0)}'/>` +
        `</linearGradient><rect ${size} fill='url(#l)'/></svg>`
    )
  }
  const region = `x='0' y='0' width='${num(width)}' height='${num(height)}'`
  return filterURL(
    `<feImage href='${ramp(width, 'r')}' ${region} preserveAspectRatio='none' result='x'/>` +
      `<feImage href='${ramp(height, 'g')}' ${region} preserveAspectRatio='none' result='y'/>` +
      `<feComposite in='x' in2='y' operator='arithmetic' k2='1' k3='1' result='m'/>` +
      glassDisplacement(band * 2 * refraction, Math.max(0, Math.min(1, effect.dispersion ?? 0))),
    ` primitiveUnits='userSpaceOnUse'`
  )
}

/**
 * A glass's light as inner shadows: a bright rim on the side the light comes from and a faint
 * one opposite, each 1.5px in and softened by 1px. The canvas draws them as `box-shadow` insets
 * and raster exports as inner shadows, so both light the glass the same way.
 */
export function glassHighlights(effect: Effect): Effect[] {
  const intensity = Math.max(0, Math.min(1, effect.lightIntensity ?? 0))
  if (intensity === 0) return []
  const angle = ((effect.lightAngle ?? -45) * Math.PI) / 180
  const dx = -Math.cos(angle) * 1.5
  const dy = Math.sin(angle) * 1.5
  const light = (alpha: number, sign: 1 | -1): Effect => ({
    type: 'INNER_SHADOW',
    color: { r: 1, g: 1, b: 1, a: alpha },
    offset: { x: dx * sign, y: dy * sign },
    radius: 1,
    spread: 0,
    visible: true,
    blendMode: 'NORMAL'
  })
  return [light(intensity * 0.8, 1), light(intensity * 0.3, -1)]
}

function glassLightShadows(effect: Effect): string[] {
  return glassHighlights(effect).map(
    ({ offset, radius, color }) =>
      `inset ${num(offset.x)}px ${num(offset.y)}px ${num(radius)}px ${colorToCSS(color)}`
  )
}

/** What a layer's effects add to its `filter`, `backdrop-filter` and `box-shadow` lists. */
export interface EffectFilters {
  filter: string[]
  backdrop: string[]
  shadows: string[]
}

/**
 * The filters a layer's shown effects draw with, in the order Figma applies them: image
 * adjustments first, then the layer's effects in their list order.
 */
export function effectFilters(
  effects: readonly Effect[],
  size: { width: number; height: number },
  imageFilters?: ImageFilters
): EffectFilters {
  const result: EffectFilters = { filter: [], backdrop: [], shadows: [] }
  const adjust = imageFiltersToCSS(imageFilters)
  if (adjust) result.filter.push(adjust)
  effects.forEach((effect, index) => {
    if (!effect.visible) return
    const seed = index + 1
    switch (effect.type) {
      case 'LAYER_BLUR':
      case 'FOREGROUND_BLUR':
        result.filter.push(blurToCSS(effect, size.width, size.height))
        break
      case 'BACKGROUND_BLUR':
        result.backdrop.push(blurToCSS(effect, size.width, size.height))
        break
      case 'NOISE': {
        const noise = noiseFilter(effect, seed)
        if (noise) result.filter.push(noise)
        break
      }
      case 'TEXTURE': {
        const texture = textureFilter(effect, seed)
        if (texture) result.filter.push(texture)
        break
      }
      case 'GLASS': {
        const refraction = glassRefractionFilter(effect, size.width, size.height)
        if (refraction) result.backdrop.push(refraction)
        if (effect.radius > 0) result.backdrop.push(`blur(${num(effect.radius)}px)`)
        result.shadows.push(...glassLightShadows(effect))
        break
      }
      default:
        break
    }
  })
  return result
}
