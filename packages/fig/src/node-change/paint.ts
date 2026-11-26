import type { Paint, PaintFilter, Effect as KiwiEffect } from '@kalka/kiwi/fig/codec'
import { guidToString, stringToGuid } from '@kalka/kiwi/fig/guid'
import {
  hasImageFilters,
  imageFilterValue,
  type BlendMode,
  type Effect,
  type Fill,
  type FillType,
  type GradientTransform,
  type ImageFilterKey,
  type ImageFilters,
  type ImageScaleMode,
  type NoiseType,
  type Stroke,
  type StrokeCap,
  type StrokeJoin
} from '@kalka/scene-graph'
import { BLACK } from '@kalka/scene-graph/constants'
import type { Color, Matrix } from '@kalka/scene-graph/primitives'

import { hexToBytes } from './bytes'

/**
 * Figma's Crop is `STRETCH` in the file: the image stretched over the part of the layer its
 * transform selects. The scene graph and the Plugin API call it `CROP`.
 */
function sceneScaleMode(mode: string | undefined): ImageScaleMode {
  if (mode === 'STRETCH') return 'CROP'
  if (mode === 'FIT' || mode === 'TILE') return mode
  return 'FILL'
}

function kiwiScaleMode(mode: ImageScaleMode): string {
  return mode === 'CROP' ? 'STRETCH' : mode
}

export function safeColor(color: Color | Omit<Color, 'a'>): Color {
  return { r: color.r, g: color.g, b: color.b, a: 'a' in color ? color.a : 1 }
}

export function fillToKiwiPaint(fill: Fill): Paint {
  const paint: Paint = {
    type: fill.type,
    color: safeColor(fill.color),
    opacity: fill.opacity,
    visible: fill.visible,
    blendMode: fill.blendMode ?? 'NORMAL'
  }
  if (fill.gradientStops) {
    paint.stops = fill.gradientStops.map((stop) => ({
      color: safeColor(stop.color),
      position: stop.position
    }))
  }
  if (fill.gradientTransform) paint.transform = fill.gradientTransform
  if (fill.imageHash) paint.image = { hash: hexToBytes(fill.imageHash) }
  if (fill.videoHash) paint.video = { hash: hexToBytes(fill.videoHash) }
  if (fill.imageScaleMode) paint.imageScaleMode = kiwiScaleMode(fill.imageScaleMode)
  if (fill.imageTransform) paint.transform = fill.imageTransform
  if (fill.sourceNodeId) paint.sourceNodeId = stringToGuid(fill.sourceNodeId)
  if (fill.scale) paint.scale = fill.scale
  if (fill.spacing) paint.spacing = fill.spacing
  if (fill.patternSpacing) paint.patternSpacing = fill.patternSpacing
  if (fill.patternTileType) paint.patternTileType = fill.patternTileType
  if (fill.verticalAlignment) paint.verticalAlignment = fill.verticalAlignment
  if (fill.horizontalAlignment) paint.horizontalAlignment = fill.horizontalAlignment
  if (fill.noiseType) paint.noiseType = fill.noiseType
  if (fill.density !== undefined) paint.density = fill.density
  if (fill.noiseSize) paint.noiseSize = fill.noiseSize
  if (fill.customEffectId) paint.customEffectId = { guid: stringToGuid(fill.customEffectId) }
  const filter = kiwiPaintFilter(fill.filters)
  if (filter) paint.paintFilter = filter
  return paint
}

/** Image adjustments as `.fig` files keep them, where saturation is `vibrance`. */
function kiwiPaintFilter(filters: ImageFilters | undefined): PaintFilter | undefined {
  if (!hasImageFilters(filters)) return undefined
  const value = (key: ImageFilterKey) => imageFilterValue(filters, key)
  return {
    exposure: value('exposure'),
    contrast: value('contrast'),
    vibrance: value('saturation'),
    temperature: value('temperature'),
    tint: value('tint'),
    highlights: value('highlights'),
    shadows: value('shadows')
  }
}

/**
 * Image adjustments from a paint: `paintFilter`, or the older `filterColorAdjust` that has no
 * contrast. Brightness, detail and vignette have no field in Figma's panel or plugin API.
 */
function sceneImageFilters(p: Paint): ImageFilters | undefined {
  const source = p.paintFilter ?? p.filterColorAdjust
  if (!source) return undefined
  const filters: ImageFilters = {}
  const pairs: [ImageFilterKey, number | undefined][] = [
    ['exposure', source.exposure],
    ['contrast', p.paintFilter?.contrast],
    ['saturation', source.vibrance],
    ['temperature', source.temperature],
    ['tint', source.tint],
    ['highlights', source.highlights],
    ['shadows', source.shadows]
  ]
  for (const [key, value] of pairs) if (value) filters[key] = value
  return hasImageFilters(filters) ? filters : undefined
}

function convertColor(color?: Partial<Color>): Color {
  if (!color) return { ...BLACK }
  return { r: color.r ?? 0, g: color.g ?? 0, b: color.b ?? 0, a: color.a ?? 1 }
}

function imageHashToString(hash: Record<string, number>): string {
  const bytes = Object.keys(hash)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => hash[Number(k)])
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('')
}

function convertGradientTransform(t?: Matrix): GradientTransform | undefined {
  if (!t) return undefined
  return { m00: t.m00, m01: t.m01, m02: t.m02, m10: t.m10, m11: t.m11, m12: t.m12 }
}

type VariableAliasRef = NonNullable<NonNullable<NonNullable<Paint['colorVar']>['value']>['alias']>

let variableColorResolver: ((alias: VariableAliasRef) => Color | null) | null = null

export function setVariableColorResolver(
  resolver: ((alias: VariableAliasRef) => Color | null) | null
): void {
  variableColorResolver = resolver
}

function resolveColorVar(paint: Paint): Color | undefined {
  const alias = paint.colorVar?.value?.alias
  if (!alias || !variableColorResolver) return undefined
  return variableColorResolver(alias) ?? undefined
}

function resolvedPaintColor(paint: Paint): { color: Color; opacity: number } {
  const resolved = resolveColorVar(paint)
  if (!resolved) return { color: convertColor(paint.color), opacity: paint.opacity ?? 1 }
  return {
    color: { ...resolved, a: paint.color?.a ?? 1 },
    opacity: paint.opacity ?? resolved.a
  }
}

function convertBaseFill(p: Paint): Fill {
  const { color, opacity } = resolvedPaintColor(p)
  return {
    type: p.type as FillType,
    color,
    opacity,
    visible: p.visible ?? true,
    blendMode: (p.blendMode ?? 'NORMAL') as BlendMode
  }
}

function applyGradientPaintFields(fill: Fill, p: Paint): void {
  if (!p.type.startsWith('GRADIENT') || !p.stops) return
  fill.gradientStops = p.stops.map((s) => ({
    color: convertColor(s.color),
    position: s.position
  }))
  if (p.transform) fill.gradientTransform = convertGradientTransform(p.transform)
}

function mediaHash(source: unknown): string | undefined {
  if (!source || typeof source !== 'object') return undefined
  const { hash } = source as { hash?: string | Record<string, number> }
  if (typeof hash === 'object') return imageHashToString(hash)
  return typeof hash === 'string' ? hash : undefined
}

/** An image paint's image; a video paint's clip and the poster frame Figma draws in its place. */
function applyImagePaintFields(fill: Fill, p: Paint): void {
  if (p.type !== 'IMAGE' && p.type !== 'VIDEO') return
  const image = mediaHash(p.image)
  if (image) fill.imageHash = image
  const video = p.type === 'VIDEO' ? mediaHash(p.video) : undefined
  if (video) fill.videoHash = video
  fill.imageScaleMode = sceneScaleMode(p.imageScaleMode)
  if (p.transform) fill.imageTransform = convertGradientTransform(p.transform)
  const filters = sceneImageFilters(p)
  if (filters) fill.filters = filters
}

function applySchemaPaintFields(fill: Fill, p: Paint): void {
  if (p.sourceNodeId) fill.sourceNodeId = guidToString(p.sourceNodeId)
  if (p.scale) fill.scale = p.scale
  if (p.spacing) fill.spacing = p.spacing
  if (p.patternSpacing) fill.patternSpacing = p.patternSpacing
  if (p.patternTileType) fill.patternTileType = p.patternTileType as Fill['patternTileType']
  if (p.verticalAlignment) fill.verticalAlignment = p.verticalAlignment as Fill['verticalAlignment']
  if (p.horizontalAlignment)
    fill.horizontalAlignment = p.horizontalAlignment as Fill['horizontalAlignment']
  if (p.noiseType) fill.noiseType = p.noiseType as Fill['noiseType']
  if (p.density !== undefined) fill.density = p.density
  if (p.noiseSize) fill.noiseSize = p.noiseSize
  if (p.customEffectId?.guid) fill.customEffectId = guidToString(p.customEffectId.guid)
}

/** One Figma paint as a Scene Graph paint, whether it ends up a fill or a stroke. */
function convertPaint(p: Paint): Fill {
  const fill = convertBaseFill(p)
  applyGradientPaintFields(fill, p)
  applyImagePaintFields(fill, p)
  applySchemaPaintFields(fill, p)
  return fill
}

export function convertFills(paints?: Paint[]): Fill[] {
  if (!paints) return []
  return paints.map(convertPaint)
}

/** A Kiwi stroke alignment; Figma leaves out the centered default. */
export function convertStrokeAlign(align?: string): Stroke['align'] {
  return align === 'INSIDE' || align === 'OUTSIDE' ? align : 'CENTER'
}

export function convertStrokes(
  paints?: Paint[],
  weight?: number,
  align?: string,
  cap?: StrokeCap,
  join?: StrokeJoin,
  dashPattern?: number[]
): Stroke[] {
  if (!paints) return []
  const strokeAlign = convertStrokeAlign(align)

  return paints.map((p) => ({
    ...convertPaint(p),
    weight: weight ?? 1,
    align: strokeAlign,
    cap: cap ?? 'NONE',
    join: join ?? 'MITER',
    dashPattern: dashPattern ?? []
  }))
}

/** Figma effect kinds a scene effect draws; repeat, symmetry and custom effects stay raw. */
const SCENE_EFFECT_TYPES: Partial<Record<KiwiEffect['type'], Effect['type']>> = {
  DROP_SHADOW: 'DROP_SHADOW',
  INNER_SHADOW: 'INNER_SHADOW',
  LAYER_BLUR: 'LAYER_BLUR',
  FOREGROUND_BLUR: 'FOREGROUND_BLUR',
  BACKGROUND_BLUR: 'BACKGROUND_BLUR',
  NOISE: 'NOISE',
  GRAIN: 'TEXTURE',
  GLASS: 'GLASS'
}

const NOISE_TYPES = new Set(['MONOTONE', 'DUOTONE', 'MULTITONE'])

function progressiveBlurFields(e: KiwiEffect): Partial<Effect> {
  if (e.blurOpType !== 'PROGRESSIVE') return {}
  const fields: Partial<Effect> = { blurType: 'PROGRESSIVE', startRadius: e.startRadius ?? 0 }
  if (e.startOffset) fields.startOffset = { x: e.startOffset.x, y: e.startOffset.y }
  if (e.endOffset) fields.endOffset = { x: e.endOffset.x, y: e.endOffset.y }
  return fields
}

function noiseFields(e: KiwiEffect): Partial<Effect> {
  const fields: Partial<Effect> = {
    noiseType: e.noiseType && NOISE_TYPES.has(e.noiseType) ? (e.noiseType as NoiseType) : 'MONOTONE'
  }
  if (e.density !== undefined) fields.density = e.density
  if (e.secondaryColor) fields.secondaryColor = convertColor(e.secondaryColor)
  if (e.opacity !== undefined) fields.opacity = e.opacity
  return fields
}

/** A glass, from the names `.fig` files give its parts to the plugin API's. */
function glassFields(e: KiwiEffect): Partial<Effect> {
  const fields: Partial<Effect> = {}
  if (e.refractionIntensity !== undefined) fields.refraction = e.refractionIntensity
  if (e.refractionRadius !== undefined) fields.depth = e.refractionRadius
  if (e.specularAngle !== undefined) fields.lightAngle = e.specularAngle
  if (e.specularIntensity !== undefined) fields.lightIntensity = e.specularIntensity
  if (e.chromaticAberration !== undefined) fields.dispersion = e.chromaticAberration
  if (e.bevelSize !== undefined) fields.bevelSize = e.bevelSize
  if (e.reflectionDistance !== undefined) fields.reflectionDistance = e.reflectionDistance
  return fields
}

/** The fields only some kinds of effect have, as the plugin API names them. */
function effectKindFields(type: Effect['type'], e: KiwiEffect): Partial<Effect> {
  if (type.endsWith('_BLUR')) return progressiveBlurFields(e)
  const size = e.noiseSize ? { noiseSize: e.noiseSize.x } : {}
  if (type === 'NOISE') return { ...size, ...noiseFields(e) }
  if (type === 'TEXTURE') return { ...size, clipToShape: e.clipToShape ?? true }
  if (type === 'GLASS') return glassFields(e)
  return {}
}

export function convertEffects(effects?: KiwiEffect[]): Effect[] {
  if (!effects) return []
  return effects.flatMap((e) => {
    const type = SCENE_EFFECT_TYPES[e.type]
    if (!type) return []
    return [
      {
        type,
        color: convertColor(e.color),
        offset: e.offset ?? { x: 0, y: 0 },
        radius: e.radius ?? 0,
        spread: e.spread ?? 0,
        visible: e.visible ?? true,
        blendMode: (e.blendMode ?? 'NORMAL') as BlendMode,
        showShadowBehindNode: e.showShadowBehindNode ?? true,
        ...effectKindFields(type, e)
      }
    ]
  })
}

/** A glass's settings as `.fig` files name them. */
function kiwiGlassFields(effect: Effect): Partial<KiwiEffect> {
  const fields: Partial<KiwiEffect> = {}
  if (effect.refraction !== undefined) fields.refractionIntensity = effect.refraction
  if (effect.depth !== undefined) fields.refractionRadius = effect.depth
  if (effect.lightAngle !== undefined) fields.specularAngle = effect.lightAngle
  if (effect.lightIntensity !== undefined) fields.specularIntensity = effect.lightIntensity
  if (effect.dispersion !== undefined) fields.chromaticAberration = effect.dispersion
  if (effect.bevelSize !== undefined) fields.bevelSize = effect.bevelSize
  if (effect.reflectionDistance !== undefined) fields.reflectionDistance = effect.reflectionDistance
  return fields
}

/** A scene effect's kind-specific fields as `.fig` files keep them. */
export function kiwiEffectKindFields(effect: Effect): Partial<KiwiEffect> {
  const fields: Partial<KiwiEffect> = {}
  if (effect.blurType === 'PROGRESSIVE') {
    fields.blurOpType = 'PROGRESSIVE'
    fields.startRadius = effect.startRadius ?? 0
    fields.startOffset = effect.startOffset ?? { x: 0.5, y: 0 }
    fields.endOffset = effect.endOffset ?? { x: 0.5, y: 1 }
  }
  if (effect.noiseSize !== undefined)
    fields.noiseSize = { x: effect.noiseSize, y: effect.noiseSize }
  if (effect.type === 'NOISE') {
    fields.noiseType = effect.noiseType ?? 'MONOTONE'
    if (effect.density !== undefined) fields.density = effect.density
    if (effect.secondaryColor) fields.secondaryColor = safeColor(effect.secondaryColor)
    if (effect.opacity !== undefined) fields.opacity = effect.opacity
  }
  if (effect.type === 'TEXTURE') fields.clipToShape = effect.clipToShape ?? true
  if (effect.type === 'GLASS') Object.assign(fields, kiwiGlassFields(effect))
  return fields
}

/** A scene effect type as `.fig` files name it. */
export function kiwiEffectType(type: Effect['type']): KiwiEffect['type'] {
  if (type === 'LAYER_BLUR') return 'FOREGROUND_BLUR'
  if (type === 'TEXTURE') return 'GRAIN'
  return type
}
