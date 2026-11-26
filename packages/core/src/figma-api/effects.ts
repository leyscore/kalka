import * as v from 'valibot'

import {
  EFFECT_BINDING_PROPERTIES,
  effectBindingField,
  type BlendMode,
  type Effect,
  type EffectBindingProperty
} from '@kalka/scene-graph'
import { WHITE } from '@kalka/scene-graph/constants'
import type { Vector } from '@kalka/scene-graph/primitives'

import { TRANSPARENT } from '#core/constants'

const BLEND_MODE_KEYS = {
  NORMAL: true,
  DARKEN: true,
  MULTIPLY: true,
  COLOR_BURN: true,
  LIGHTEN: true,
  SCREEN: true,
  COLOR_DODGE: true,
  OVERLAY: true,
  SOFT_LIGHT: true,
  HARD_LIGHT: true,
  DIFFERENCE: true,
  EXCLUSION: true,
  HUE: true,
  SATURATION: true,
  COLOR: true,
  LUMINOSITY: true,
  PASS_THROUGH: true
} satisfies Record<BlendMode, true>

const BLEND_MODES = Object.keys(BLEND_MODE_KEYS) as BlendMode[]

/** Effect kinds Figma's plugin API accepts that Kalka does not model yet. */
const UNSUPPORTED_EFFECT_TYPES = new Set(['SHADER'])

// Figma rejects Infinity as well as NaN ("Number must be finite").
const finite = v.pipe(v.number(), v.finite())
const unit = v.pipe(finite, v.minValue(0), v.maxValue(1))
const nonNegative = v.pipe(finite, v.minValue(0))

const color = v.strictObject({ r: unit, g: unit, b: unit, a: unit })
const vector = v.strictObject({ x: finite, y: finite })
const alias = v.object({ type: v.literal('VARIABLE_ALIAS'), id: v.string() })
// A shadow binds its colour, blur, spread and offsets; a blur only its radius.
const boundVariables = v.optional(
  v.strictObject({
    color: v.optional(alias),
    radius: v.optional(alias),
    spread: v.optional(alias),
    offsetX: v.optional(alias),
    offsetY: v.optional(alias)
  })
)

const shadowEntries = {
  color,
  offset: vector,
  radius: nonNegative,
  spread: v.optional(finite),
  visible: v.boolean(),
  blendMode: v.picklist(BLEND_MODES),
  boundVariables
}

const effectSchema = v.variant('type', [
  v.strictObject({
    type: v.literal('DROP_SHADOW'),
    ...shadowEntries,
    showShadowBehindNode: v.optional(v.boolean())
  }),
  v.strictObject({ type: v.literal('INNER_SHADOW'), ...shadowEntries }),
  v.strictObject({
    type: v.picklist(['LAYER_BLUR', 'BACKGROUND_BLUR']),
    radius: nonNegative,
    visible: v.boolean(),
    blurType: v.optional(v.picklist(['NORMAL', 'PROGRESSIVE']), 'NORMAL'),
    startRadius: v.optional(nonNegative),
    startOffset: v.optional(vector),
    endOffset: v.optional(vector),
    boundVariables
  }),
  v.strictObject({
    type: v.literal('NOISE'),
    noiseType: v.picklist(['MONOTONE', 'DUOTONE', 'MULTITONE']),
    color,
    secondaryColor: v.optional(color),
    opacity: v.optional(unit),
    visible: v.boolean(),
    blendMode: v.optional(v.picklist(BLEND_MODES)),
    noiseSize: nonNegative,
    density: unit,
    boundVariables
  }),
  v.strictObject({
    type: v.literal('TEXTURE'),
    visible: v.boolean(),
    noiseSize: nonNegative,
    radius: nonNegative,
    clipToShape: v.boolean(),
    boundVariables
  }),
  v.strictObject({
    type: v.literal('GLASS'),
    visible: v.boolean(),
    lightIntensity: unit,
    lightAngle: finite,
    refraction: unit,
    depth: nonNegative,
    dispersion: unit,
    radius: nonNegative,
    boundVariables
  })
])

const effectsSchema = v.array(effectSchema)

/** An effect as a script writes it, checked: optional parts not yet filled in. */
type ParsedEffect = v.InferOutput<typeof effectSchema>

type ParsedOf<T extends ParsedEffect['type']> = Extract<ParsedEffect, { type: T }>
type FigmaColor = ParsedOf<'NOISE'>['color']

interface FigmaBlur {
  type: 'LAYER_BLUR' | 'BACKGROUND_BLUR'
  radius: number
  visible: boolean
  boundVariables?: { radius?: { type: 'VARIABLE_ALIAS'; id: string } }
}

interface FigmaNoise {
  type: 'NOISE'
  color: FigmaColor
  visible: boolean
  blendMode: BlendMode
  noiseSize: number
  density: number
  boundVariables?: Record<string, never>
}

/** An effect as Figma's plugin API reads it (`Effect` in `@figma/plugin-typings`). */
export type FigmaEffect =
  | ParsedOf<'DROP_SHADOW'>
  | ParsedOf<'INNER_SHADOW'>
  | (FigmaBlur & { blurType: 'NORMAL' })
  | (FigmaBlur & {
      blurType: 'PROGRESSIVE'
      startRadius: number
      startOffset: Vector
      endOffset: Vector
    })
  | (FigmaNoise & { noiseType: 'MONOTONE' })
  | (FigmaNoise & { noiseType: 'DUOTONE'; secondaryColor: FigmaColor })
  | (FigmaNoise & { noiseType: 'MULTITONE'; opacity: number })
  | {
      type: 'TEXTURE'
      visible: boolean
      noiseSize: number
      radius: number
      clipToShape: boolean
      boundVariables?: Record<string, never>
    }
  | {
      type: 'GLASS'
      visible: boolean
      lightIntensity: number
      lightAngle: number
      refraction: number
      depth: number
      dispersion: number
      radius: number
      boundVariables?: Record<string, never>
    }

function issuePath(issue: v.BaseIssue<unknown>): string {
  return (issue.path ?? [])
    .map((item) => (typeof item.key === 'number' ? `[${item.key}]` : `.${String(item.key)}`))
    .join('')
}

function unsupportedEffect(value: unknown): string | null {
  if (!Array.isArray(value)) return null
  for (const [index, effect] of value.entries()) {
    const type: unknown = v.is(v.object({ type: v.unknown() }), effect) ? effect.type : undefined
    if (typeof type === 'string' && UNSUPPORTED_EFFECT_TYPES.has(type)) {
      return `${type} effects are not supported at [${index}].type`
    }
  }
  return null
}

/**
 * Check `value` against Figma's effect shapes and convert it to scene effects.
 * Throws with the first problem, as Figma's `effects` setter does.
 */
export function parseFigmaEffects(value: unknown): Effect[] {
  const unsupported = unsupportedEffect(value)
  if (unsupported) throw new Error(`Property "effects" failed validation: ${unsupported}`)
  const result = v.safeParse(effectsSchema, value)
  if (!result.success) {
    const [issue] = result.issues
    throw new Error(
      `Property "effects" failed validation: ${issue.message} at ${issuePath(issue) || 'effects'}`
    )
  }
  return result.output.map(toSceneEffect)
}

/** `value` as scene effects when it holds valid Figma effects, or null. */
export function tryParseFigmaEffects(value: unknown): Effect[] | null {
  if (unsupportedEffect(value)) return null
  const result = v.safeParse(effectsSchema, value)
  return result.success ? result.output.map(toSceneEffect) : null
}

function toSceneEffect(effect: ParsedEffect): Effect {
  if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
    return {
      type: effect.type,
      color: { ...effect.color },
      offset: { ...effect.offset },
      radius: effect.radius,
      spread: effect.spread ?? 0,
      visible: effect.visible,
      // Figma accepts PASS_THROUGH on shadows but stores NORMAL; it is a layer blend mode.
      blendMode: effect.blendMode === 'PASS_THROUGH' ? 'NORMAL' : effect.blendMode,
      ...(effect.type === 'DROP_SHADOW' && effect.showShadowBehindNode !== undefined
        ? { showShadowBehindNode: effect.showShadowBehindNode }
        : {})
    }
  }
  const base = {
    color: { ...TRANSPARENT },
    offset: { x: 0, y: 0 },
    radius: 0,
    spread: 0,
    visible: effect.visible
  }
  if (effect.type === 'NOISE') {
    const noise: Effect = {
      ...base,
      type: 'NOISE',
      color: { ...effect.color },
      blendMode: effect.blendMode ?? 'NORMAL',
      noiseType: effect.noiseType,
      noiseSize: effect.noiseSize,
      density: effect.density
    }
    if (effect.secondaryColor) noise.secondaryColor = { ...effect.secondaryColor }
    if (effect.opacity !== undefined) noise.opacity = effect.opacity
    return noise
  }
  if (effect.type === 'TEXTURE') {
    const { noiseSize, radius, clipToShape } = effect
    return { ...base, type: 'TEXTURE', noiseSize, radius, clipToShape }
  }
  if (effect.type === 'GLASS') {
    const { lightIntensity, lightAngle, refraction, depth, dispersion, radius } = effect
    return {
      ...base,
      type: 'GLASS',
      radius,
      lightIntensity,
      lightAngle,
      refraction,
      depth,
      dispersion
    }
  }
  const blur: Effect = { ...base, type: effect.type, radius: effect.radius }
  if (effect.blurType !== 'PROGRESSIVE') return blur
  return {
    ...blur,
    blurType: 'PROGRESSIVE',
    startRadius: effect.startRadius ?? 0,
    startOffset: { ...(effect.startOffset ?? { x: 0.5, y: 0 }) },
    endOffset: { ...(effect.endOffset ?? { x: 0.5, y: 1 }) }
  }
}

/** The variables an effect's parts are bound to, as Figma's `Effect.boundVariables` names them. */
export type FigmaEffectBindings = NonNullable<v.InferOutput<typeof boundVariables>>

/** The bindings of the layer's effect at `index`, read from the layer's `boundVariables`. */
export function effectBindings(
  bindings: Readonly<Record<string, string>>,
  index: number
): FigmaEffectBindings {
  const result: FigmaEffectBindings = {}
  for (const property of EFFECT_BINDING_PROPERTIES) {
    const id = bindings[effectBindingField(index, property)]
    if (id) result[property] = { type: 'VARIABLE_ALIAS', id }
  }
  return result
}

/** The variable ids an effect read from a script binds, by part. */
export function effectBindingIds(effect: unknown): Partial<Record<EffectBindingProperty, string>> {
  const result = v.safeParse(v.object({ boundVariables }), effect)
  if (!result.success || !result.output.boundVariables) return {}
  const ids: Partial<Record<EffectBindingProperty, string>> = {}
  for (const property of EFFECT_BINDING_PROPERTIES) {
    const id = result.output.boundVariables[property]?.id
    if (id) ids[property] = id
  }
  return ids
}

function toFigmaBlur(effect: Effect, bindings: FigmaEffectBindings): FigmaEffect {
  const blur = {
    // `.fig` files call a layer blur FOREGROUND_BLUR; the plugin API calls it LAYER_BLUR.
    type: effect.type === 'BACKGROUND_BLUR' ? 'BACKGROUND_BLUR' : 'LAYER_BLUR',
    visible: effect.visible,
    radius: effect.radius,
    boundVariables: bindings.radius ? { radius: bindings.radius } : {}
  } as const
  if (effect.blurType !== 'PROGRESSIVE') return { ...blur, blurType: 'NORMAL' }
  return {
    ...blur,
    blurType: 'PROGRESSIVE',
    startRadius: effect.startRadius ?? 0,
    startOffset: { ...(effect.startOffset ?? { x: 0.5, y: 0 }) },
    endOffset: { ...(effect.endOffset ?? { x: 0.5, y: 1 }) }
  }
}

function toFigmaNoise(effect: Effect): FigmaEffect {
  const noise = {
    type: 'NOISE',
    visible: effect.visible,
    color: { ...effect.color },
    blendMode: effect.blendMode ?? 'NORMAL',
    noiseSize: effect.noiseSize ?? 0.5,
    density: effect.density ?? 0.5,
    boundVariables: {}
  } as const
  if (effect.noiseType === 'DUOTONE') {
    const secondaryColor = { ...(effect.secondaryColor ?? WHITE) }
    return { ...noise, noiseType: 'DUOTONE', secondaryColor }
  }
  if (effect.noiseType === 'MULTITONE')
    return { ...noise, noiseType: 'MULTITONE', opacity: effect.opacity ?? 1 }
  return { ...noise, noiseType: 'MONOTONE' }
}

function toFigmaGlass(effect: Effect): FigmaEffect {
  return {
    type: 'GLASS',
    visible: effect.visible,
    radius: effect.radius,
    lightIntensity: effect.lightIntensity ?? 0.5,
    lightAngle: effect.lightAngle ?? -45,
    refraction: effect.refraction ?? 0.5,
    depth: effect.depth ?? 20,
    dispersion: effect.dispersion ?? 0,
    boundVariables: {}
  }
}

/** A scene effect in the shape Figma's `effects` getter returns. */
export function toFigmaEffect(effect: Effect, bindings: FigmaEffectBindings = {}): FigmaEffect {
  switch (effect.type) {
    case 'LAYER_BLUR':
    case 'FOREGROUND_BLUR':
    case 'BACKGROUND_BLUR':
      return toFigmaBlur(effect, bindings)
    case 'NOISE':
      return toFigmaNoise(effect)
    case 'GLASS':
      return toFigmaGlass(effect)
    case 'TEXTURE':
      return {
        type: 'TEXTURE',
        visible: effect.visible,
        noiseSize: effect.noiseSize ?? 0.5,
        radius: effect.radius,
        clipToShape: effect.clipToShape ?? true,
        boundVariables: {}
      }
    default:
      return toFigmaShadow(effect, bindings)
  }
}

function toFigmaShadow(effect: Effect, bindings: FigmaEffectBindings): FigmaEffect {
  const shadow = {
    visible: effect.visible,
    radius: effect.radius,
    boundVariables: bindings,
    color: { ...effect.color },
    offset: { ...effect.offset },
    spread: effect.spread,
    blendMode: effect.blendMode ?? 'NORMAL'
  }
  return effect.type === 'DROP_SHADOW'
    ? {
        type: 'DROP_SHADOW',
        ...shadow,
        // The renderer draws the shadow behind the node unless this is `false`.
        showShadowBehindNode: effect.showShadowBehindNode ?? true
      }
    : { type: 'INNER_SHADOW', ...shadow }
}
