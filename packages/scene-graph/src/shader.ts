import * as v from 'valibot'

import type { Color } from './primitives'

/**
 * Shader layers: a live WebGL drawing behind a layer's content, from Paper Shaders. The layer
 * keeps a preset, its colors, a speed and the preset's parameters; renderers that cannot run
 * shaders draw the colors as a gradient instead.
 */
export const SHADER_PRESETS = ['mesh-gradient', 'grain-gradient', 'warp'] as const
export type ShaderPreset = (typeof SHADER_PRESETS)[number]

export interface ShaderLayer {
  preset: ShaderPreset
  colors: Color[]
  /** Animation speed; 0 holds a still frame. */
  speed: number
  /** The preset's own parameters, each from 0 to 1, by name. */
  params: Record<string, number>
}

const finite = v.pipe(v.number(), v.finite())

/** A stored shader layer, from a file or an exported page; the shape a reader accepts. */
export const shaderLayerSchema: v.GenericSchema<unknown, ShaderLayer> = v.object({
  preset: v.picklist(SHADER_PRESETS),
  colors: v.pipe(
    v.array(v.object({ r: finite, g: finite, b: finite, a: finite })),
    v.maxLength(10)
  ),
  speed: finite,
  params: v.record(v.string(), finite)
})

/** Reads a shader layer from the JSON an exported page carries, or null. */
export function parseShaderLayer(json: string): ShaderLayer | null {
  const parsed = v.safeParse(v.pipe(v.string(), v.parseJson(), shaderLayerSchema), json)
  return parsed.success ? parsed.output : null
}

export interface ShaderParameter {
  name: string
  defaultValue: number
}

/** Each preset's parameters and how many colors it blends. */
export const SHADER_PRESET_INFO: Record<
  ShaderPreset,
  { maxColors: number; parameters: readonly ShaderParameter[] }
> = {
  'mesh-gradient': {
    maxColors: 10,
    parameters: [
      { name: 'distortion', defaultValue: 0.8 },
      { name: 'swirl', defaultValue: 0.1 },
      { name: 'grainOverlay', defaultValue: 0 }
    ]
  },
  'grain-gradient': {
    maxColors: 7,
    parameters: [
      { name: 'softness', defaultValue: 0.5 },
      { name: 'intensity', defaultValue: 0.5 },
      { name: 'noise', defaultValue: 0.25 }
    ]
  },
  warp: {
    maxColors: 10,
    parameters: [
      { name: 'proportion', defaultValue: 0.45 },
      { name: 'softness', defaultValue: 1 },
      { name: 'distortion', defaultValue: 0.25 },
      { name: 'swirl', defaultValue: 0.8 }
    ]
  }
}

/** A new shader layer: a mesh gradient in Kalka's blues, moving slowly. */
export function createShaderLayer(preset: ShaderPreset = 'mesh-gradient'): ShaderLayer {
  return {
    preset,
    colors: [
      { r: 0.184, g: 0.357, b: 0.918, a: 1 },
      { r: 0.616, g: 0.718, b: 0.961, a: 1 },
      { r: 0.071, g: 0.071, b: 0.078, a: 1 },
      { r: 0.937, g: 0.937, b: 0.925, a: 1 }
    ],
    speed: 0.5,
    params: Object.fromEntries(
      SHADER_PRESET_INFO[preset].parameters.map((parameter) => [
        parameter.name,
        parameter.defaultValue
      ])
    )
  }
}

/** A parameter's value, its preset default when the layer has none. */
export function shaderParameter(layer: ShaderLayer, name: string): number {
  const parameter = SHADER_PRESET_INFO[layer.preset].parameters.find(
    (candidate) => candidate.name === name
  )
  return Object.hasOwn(layer.params, name) ? layer.params[name] : (parameter?.defaultValue ?? 0)
}
