import * as v from 'valibot'

import { parseColor } from '@kalka/scene-graph/color'

import { DEFAULT_SHADOW_COLOR } from '#core/constants'
import type { FigmaEffect } from '#core/figma-api/effects'
import { toolNumber, nodeIdInput } from '#core/tools/input'
import { defineTool, nodeNotFound } from '#core/tools/schema'

const optionalNumber = (description: string) =>
  v.optional(toolNumber(v.pipe(v.number(), v.description(description))))

const unitNumber = (description: string) =>
  v.optional(
    toolNumber(v.pipe(v.number(), v.minValue(0), v.maxValue(1), v.description(description)))
  )

const input = v.strictObject({
  id: nodeIdInput,
  type: v.pipe(
    v.picklist([
      'DROP_SHADOW',
      'INNER_SHADOW',
      'FOREGROUND_BLUR',
      'BACKGROUND_BLUR',
      'NOISE',
      'TEXTURE',
      'GLASS'
    ]),
    v.description('Effect type')
  ),
  replace: v.optional(
    v.pipe(v.boolean(), v.description('Replace the node effects instead of adding one')),
    false
  ),
  color: v.optional(
    v.pipe(v.string(), v.description('Shadow or noise color (hex). Ignored for other effects.'))
  ),
  offset_x: v.optional(toolNumber(v.pipe(v.number(), v.description('Shadow X offset'))), 0),
  offset_y: v.optional(toolNumber(v.pipe(v.number(), v.description('Shadow Y offset'))), 4),
  radius: v.optional(
    toolNumber(
      v.pipe(v.number(), v.minValue(0), v.description('Blur, texture or glass frost radius'))
    ),
    4
  ),
  spread: v.optional(toolNumber(v.pipe(v.number(), v.description('Shadow spread'))), 0),
  progressive: v.optional(
    v.pipe(
      v.boolean(),
      v.description('Blur from start_radius at the start point to radius at the end point')
    ),
    false
  ),
  start_radius: optionalNumber('Progressive blur radius at its start point, default 0'),
  start_x: unitNumber('Progressive blur start, as a fraction of the width; default 0.5'),
  start_y: unitNumber('Progressive blur start, as a fraction of the height; default 0'),
  end_x: unitNumber('Progressive blur end, as a fraction of the width; default 0.5'),
  end_y: unitNumber('Progressive blur end, as a fraction of the height; default 1'),
  noise_type: v.optional(
    v.pipe(v.picklist(['MONOTONE', 'DUOTONE', 'MULTITONE']), v.description('Noise grains')),
    'MONOTONE'
  ),
  secondary_color: v.optional(
    v.pipe(v.string(), v.description('Second grain color of a DUOTONE noise (hex)'))
  ),
  noise_size: optionalNumber('Grain size of a noise or texture, default 0.5'),
  density: unitNumber('Share of the layer a noise covers, default 0.5'),
  opacity: unitNumber('Opacity of a MULTITONE noise, default 1'),
  clip_to_shape: v.optional(v.pipe(v.boolean(), v.description('Keep a texture in its layer'))),
  refraction: unitNumber('How much glass bends what lies behind it, default 0.8'),
  depth: optionalNumber('Depth of the glass edge in pixels, default 20'),
  light_angle: optionalNumber('Angle the glass is lit from in degrees, default -45'),
  light_intensity: unitNumber('Strength of the glass highlight, default 0.8'),
  dispersion: unitNumber('Colour split at the glass edges, default 0.5')
})

type EffectInput = v.InferOutput<typeof input>

function blurEffect(args: EffectInput): FigmaEffect {
  const type = args.type === 'BACKGROUND_BLUR' ? 'BACKGROUND_BLUR' : 'LAYER_BLUR'
  if (!args.progressive) return { type, radius: args.radius, visible: true, blurType: 'NORMAL' }
  return {
    type,
    radius: args.radius,
    visible: true,
    blurType: 'PROGRESSIVE',
    startRadius: args.start_radius ?? 0,
    startOffset: { x: args.start_x ?? 0.5, y: args.start_y ?? 0 },
    endOffset: { x: args.end_x ?? 0.5, y: args.end_y ?? 1 }
  }
}

function noiseEffect(args: EffectInput): FigmaEffect {
  const base = {
    type: 'NOISE' as const,
    color: parseColor(args.color ?? '#00000040'),
    visible: true,
    blendMode: 'NORMAL' as const,
    noiseSize: args.noise_size ?? 0.5,
    density: args.density ?? 0.5
  }
  if (args.noise_type === 'DUOTONE') {
    const secondaryColor = parseColor(args.secondary_color ?? '#ffffff')
    return { ...base, noiseType: 'DUOTONE', secondaryColor }
  }
  if (args.noise_type === 'MULTITONE') {
    return { ...base, noiseType: 'MULTITONE', opacity: args.opacity ?? 1 }
  }
  return { ...base, noiseType: 'MONOTONE' }
}

/** The effect the arguments describe, with design JSX's defaults for what they leave out. */
function effectFromInput(args: EffectInput): FigmaEffect {
  switch (args.type) {
    case 'FOREGROUND_BLUR':
    case 'BACKGROUND_BLUR':
      return blurEffect(args)
    case 'NOISE':
      return noiseEffect(args)
    case 'TEXTURE':
      return {
        type: 'TEXTURE',
        visible: true,
        noiseSize: args.noise_size ?? 0.5,
        radius: args.radius,
        clipToShape: args.clip_to_shape ?? true
      }
    case 'GLASS':
      return {
        type: 'GLASS',
        visible: true,
        radius: args.radius,
        refraction: args.refraction ?? 0.8,
        depth: args.depth ?? 20,
        lightAngle: args.light_angle ?? -45,
        lightIntensity: args.light_intensity ?? 0.8,
        dispersion: args.dispersion ?? 0.5
      }
    case 'DROP_SHADOW':
    case 'INNER_SHADOW':
      return {
        type: args.type,
        color: args.color ? parseColor(args.color) : { ...DEFAULT_SHADOW_COLOR },
        offset: { x: args.offset_x, y: args.offset_y },
        radius: args.radius,
        spread: args.spread,
        visible: true,
        blendMode: 'NORMAL'
      }
    default: {
      const exhaustive: never = args.type
      return exhaustive
    }
  }
}

export const setEffects = defineTool({
  name: 'set_effects',

  description:
    'Add an effect to a node, or replace its effects with it: drop or inner shadow, layer or background blur (progressive with `progressive`), noise, texture, or glass.',
  execution: { kind: 'sync', mutation: 'properties' },
  input,
  execute: (figma, args) => {
    const node = figma.getNodeById(args.id)
    if (!node) return nodeNotFound(args.id)
    const effect = effectFromInput(args)
    node.effects = args.replace ? [effect] : [...node.effects, effect]
    return { id: args.id, effects: node.effects.length }
  }
})
