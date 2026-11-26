import type { BlendMode, BlurType, Effect, NoiseType } from '@kalka/scene-graph'
import { parseColor } from '@kalka/scene-graph/color'
import { TRANSPARENT } from '@kalka/scene-graph/constants'
import type { Color, Vector } from '@kalka/scene-graph/primitives'

export type EffectColor = string | Color

export interface ShadowEffectOptions {
  color?: EffectColor
  x?: number
  y?: number
  offset?: Vector
  radius?: number
  spread?: number
  visible?: boolean
  blendMode?: BlendMode
  showShadowBehindNode?: boolean
}

export interface BlurEffectOptions {
  radius?: number
  visible?: boolean
  /** `PROGRESSIVE` blurs from `startRadius` at `startOffset` to `radius` at `endOffset`. */
  blurType?: BlurType
  startRadius?: number
  startOffset?: Vector
  endOffset?: Vector
}

export interface NoiseEffectOptions {
  noiseType?: NoiseType
  color?: EffectColor
  secondaryColor?: EffectColor
  opacity?: number
  noiseSize?: number
  density?: number
  blendMode?: BlendMode
  visible?: boolean
}

export interface TextureEffectOptions {
  noiseSize?: number
  radius?: number
  clipToShape?: boolean
  visible?: boolean
}

export interface GlassEffectOptions {
  radius?: number
  refraction?: number
  depth?: number
  lightAngle?: number
  lightIntensity?: number
  dispersion?: number
  visible?: boolean
}

/** Radius of a shadow or blur that does not set one. */
const DEFAULT_EFFECT_RADIUS = 8

function toColor(color: EffectColor | undefined): Color {
  if (color === undefined) return { ...TRANSPARENT }
  return typeof color === 'string' ? parseColor(color) : color
}

function shadowEffect(type: 'DROP_SHADOW' | 'INNER_SHADOW', options: ShadowEffectOptions): Effect {
  return {
    type,
    color: toColor(options.color ?? 'rgba(0, 0, 0, 0.25)'),
    offset: options.offset ?? { x: options.x ?? 0, y: options.y ?? 4 },
    radius: options.radius ?? DEFAULT_EFFECT_RADIUS,
    spread: options.spread ?? 0,
    visible: options.visible ?? true,
    blendMode: options.blendMode,
    showShadowBehindNode: options.showShadowBehindNode
  }
}

function blurEffect(
  type: 'LAYER_BLUR' | 'BACKGROUND_BLUR' | 'FOREGROUND_BLUR',
  radiusOrOptions: number | BlurEffectOptions = {}
): Effect {
  const options =
    typeof radiusOrOptions === 'number' ? { radius: radiusOrOptions } : radiusOrOptions
  const effect: Effect = {
    type,
    color: { ...TRANSPARENT },
    offset: { x: 0, y: 0 },
    radius: options.radius ?? DEFAULT_EFFECT_RADIUS,
    spread: 0,
    visible: options.visible ?? true
  }
  if (options.blurType !== 'PROGRESSIVE') return effect
  return {
    ...effect,
    blurType: 'PROGRESSIVE',
    startRadius: options.startRadius ?? 0,
    startOffset: options.startOffset ?? { x: 0.5, y: 0 },
    endOffset: options.endOffset ?? { x: 0.5, y: 1 }
  }
}

/** The parts every effect has, for those that use few of them. */
function plainEffect(type: Effect['type'], visible: boolean | undefined): Effect {
  return {
    type,
    color: { ...TRANSPARENT },
    offset: { x: 0, y: 0 },
    radius: 0,
    spread: 0,
    visible: visible ?? true
  }
}

export function dropShadow(options: ShadowEffectOptions = {}): Effect {
  return shadowEffect('DROP_SHADOW', options)
}

export function innerShadow(options: ShadowEffectOptions = {}): Effect {
  return shadowEffect('INNER_SHADOW', options)
}

export function layerBlur(radiusOrOptions?: number | BlurEffectOptions): Effect {
  return blurEffect('LAYER_BLUR', radiusOrOptions)
}

export function backgroundBlur(radiusOrOptions?: number | BlurEffectOptions): Effect {
  return blurEffect('BACKGROUND_BLUR', radiusOrOptions)
}

export function foregroundBlur(radiusOrOptions?: number | BlurEffectOptions): Effect {
  return blurEffect('FOREGROUND_BLUR', radiusOrOptions)
}

/** Grains over the layer: one color, two (`DUOTONE`), or many (`MULTITONE`) at `opacity`. */
export function noise(options: NoiseEffectOptions = {}): Effect {
  const noiseType = options.noiseType ?? 'MONOTONE'
  const effect: Effect = {
    ...plainEffect('NOISE', options.visible),
    color: toColor(options.color ?? 'rgba(0, 0, 0, 0.25)'),
    noiseType,
    noiseSize: options.noiseSize ?? 0.5,
    density: options.density ?? 0.5,
    blendMode: options.blendMode
  }
  if (noiseType === 'DUOTONE') effect.secondaryColor = toColor(options.secondaryColor ?? '#fff')
  if (noiseType === 'MULTITONE') effect.opacity = options.opacity ?? 1
  return effect
}

/** The layer's pixels scattered by up to `radius`. */
export function texture(options: TextureEffectOptions = {}): Effect {
  return {
    ...plainEffect('TEXTURE', options.visible),
    radius: options.radius ?? 4,
    noiseSize: options.noiseSize ?? 0.5,
    clipToShape: options.clipToShape ?? true
  }
}

/** Glass: what lies behind refracted at the edges and frosted by `radius`, lit from `lightAngle`. */
export function glass(options: GlassEffectOptions = {}): Effect {
  return {
    ...plainEffect('GLASS', options.visible),
    radius: options.radius ?? 4,
    refraction: options.refraction ?? 0.8,
    depth: options.depth ?? 20,
    lightAngle: options.lightAngle ?? -45,
    lightIntensity: options.lightIntensity ?? 0.8,
    dispersion: options.dispersion ?? 0.5
  }
}
