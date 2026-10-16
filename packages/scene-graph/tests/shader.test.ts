import { describe, expect, test } from 'bun:test'

import {
  createShaderLayer,
  parseShaderLayer,
  SHADER_PRESET_INFO,
  shaderParameter
} from '@kalka/scene-graph'

describe('shader layers', () => {
  test('a new layer has every parameter of its preset at its default', () => {
    const layer = createShaderLayer('warp')
    for (const parameter of SHADER_PRESET_INFO.warp.parameters) {
      expect(shaderParameter(layer, parameter.name)).toBe(parameter.defaultValue)
    }
  })

  test('a missing parameter reads as its default', () => {
    const layer = { ...createShaderLayer('mesh-gradient'), params: {} }
    expect(shaderParameter(layer, 'distortion')).toBe(0.8)
  })

  test('stored JSON reads back, and anything else is refused', () => {
    const layer = createShaderLayer('grain-gradient')
    expect(parseShaderLayer(JSON.stringify(layer))).toEqual(layer)
    expect(parseShaderLayer('{"preset":"unknown","colors":[],"speed":1,"params":{}}')).toBeNull()
    expect(parseShaderLayer('not json')).toBeNull()
  })
})
