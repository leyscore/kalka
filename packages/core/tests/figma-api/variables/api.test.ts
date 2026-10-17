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

describe('unsupported Plugin API members', () => {
  test('are absent from the API, so scripts get the reason instead', () => {
    const { figma } = setup()
    for (const member of Object.keys(UNSUPPORTED_PLUGIN_API)) {
      expect(member in figma).toBe(false)
    }
  })
})
