import { describe, expect, test } from 'bun:test'

import { FigmaAPI, UNSUPPORTED_PLUGIN_API } from '@kalka/core/figma-api'
import { SceneGraph } from '@kalka/scene-graph'

function setup() {
  const graph = new SceneGraph()
  return { graph, figma: new FigmaAPI(graph) }
}

describe('figma.variables', () => {
  test('collections keep at least one mode and name the modes they lack', () => {
    const { figma } = setup()
    const collection = figma.variables.createVariableCollection('Theme')
    expect(() => collection.removeMode(collection.defaultModeId)).toThrow('at least one mode')
    expect(() => collection.renameMode('missing', 'X')).toThrow('Invalid modeId "missing"')
    const dark = collection.addMode('Dark')
    collection.removeMode(dark)
    expect(collection.modes).toHaveLength(1)
  })

  test('variables are live handles on the document', () => {
    const { graph, figma } = setup()
    const collection = figma.variables.createVariableCollection('Theme')
    const variable = figma.variables.createVariable('radius', collection, 'FLOAT')
    variable.name = 'radius/md'
    variable.scopes = ['CORNER_RADIUS']
    expect(graph.variables.get(variable.id)).toMatchObject({
      name: 'radius/md',
      scopes: ['CORNER_RADIUS']
    })
    expect(figma.variables.getVariableById(variable.id)?.resolvedType).toBe('FLOAT')
    variable.remove()
    expect(figma.variables.getVariableById(variable.id)).toBeNull()
  })

  test('a paint binds only a color variable', () => {
    const { figma } = setup()
    const collection = figma.variables.createVariableCollection('Theme')
    const size = figma.variables.createVariable('size', collection, 'FLOAT')
    const paint = { type: 'SOLID', color: { r: 0, g: 0, b: 0 } }
    expect(() => figma.variables.setBoundVariableForPaint(paint, 'color', size)).toThrow(
      'Cannot bind FLOAT variable to a paint color'
    )
  })
})

describe('figma.variables.setBoundVariableForEffect', () => {
  test('binds a shadow on the layer it is assigned to, and reads back as Figma does', () => {
    const { graph, figma } = setup()
    const collection = figma.variables.createVariableCollection('Elevation')
    const blur = figma.variables.createVariable('blur', collection, 'FLOAT')
    blur.setValueForMode(collection.defaultModeId, 20)
    const rect = figma.createRectangle()
    const [shadow] = (rect.effects = [
      {
        type: 'DROP_SHADOW',
        color: { r: 0, g: 0, b: 0, a: 0.25 },
        offset: { x: 0, y: 4 },
        radius: 4,
        spread: 0,
        visible: true,
        blendMode: 'NORMAL'
      }
    ])
    const bound = figma.variables.setBoundVariableForEffect(shadow, 'radius', blur)
    expect(bound.radius).toBe(20)
    rect.effects = [bound]
    expect(graph.getNode(rect.id)?.boundVariables['effects/0/radius']).toBe(blur.id)
    expect(rect.effects[0]?.boundVariables).toEqual({
      radius: { type: 'VARIABLE_ALIAS', id: blur.id }
    })

    rect.effects = [figma.variables.setBoundVariableForEffect(bound, 'radius', null)]
    expect(graph.getNode(rect.id)?.boundVariables['effects/0/radius']).toBeUndefined()
  })

  test('a blur binds only its radius, and a colour only a colour variable', () => {
    const { figma } = setup()
    const collection = figma.variables.createVariableCollection('Theme')
    const size = figma.variables.createVariable('size', collection, 'FLOAT')
    const blur = { type: 'LAYER_BLUR', radius: 4, visible: true }
    expect(() => figma.variables.setBoundVariableForEffect(blur, 'color', size)).toThrow(
      'Cannot bind "color" on a LAYER_BLUR effect'
    )
    const shadow = { type: 'DROP_SHADOW', color: { r: 0, g: 0, b: 0, a: 1 } }
    expect(() => figma.variables.setBoundVariableForEffect(shadow, 'color', size)).toThrow(
      "Cannot bind FLOAT variable to an effect's color"
    )
  })
})

describe('unsupported Plugin API members', () => {
  test('are absent from the API, so scripts get the reason instead', () => {
    const { figma } = setup()
    for (const member of Object.keys(UNSUPPORTED_PLUGIN_API)) {
      expect(member in figma).toBe(false)
    }
  })
})
