import { describe, expect, test } from 'bun:test'

import { reconcileVariableBindings, SceneGraph } from '@kalka/scene-graph'

function setup() {
  const graph = new SceneGraph()
  const collection = graph.createCollection('Theme')
  const dark = 'dark'
  graph.addMode(collection.id, dark, 'Dark')
  const shadow = graph.createVariable('shadow', 'COLOR', collection.id, {
    r: 0,
    g: 0,
    b: 0,
    a: 0.2
  })
  graph.variables.set(shadow.id, {
    ...shadow,
    valuesByMode: { ...shadow.valuesByMode, [dark]: { r: 1, g: 1, b: 1, a: 0.4 } }
  })
  const blur = graph.createVariable('blur', 'FLOAT', collection.id, 12)
  const card = graph.createNode('RECTANGLE', graph.getPages()[0].id, {
    effects: [
      {
        type: 'DROP_SHADOW',
        color: { r: 0, g: 0, b: 0, a: 0.25 },
        offset: { x: 0, y: 4 },
        radius: 4,
        spread: 0,
        visible: true
      }
    ]
  })
  return { graph, collection, dark, shadow, blur, card }
}

describe('variables bound to effects', () => {
  test('a shadow takes its colour, blur, spread and offsets from its variables', () => {
    const { graph, shadow, blur, card } = setup()
    graph.bindVariable(card.id, 'effects/0/color', shadow.id)
    graph.bindVariable(card.id, 'effects/0/radius', blur.id)
    graph.bindVariable(card.id, 'effects/0/spread', blur.id)
    graph.bindVariable(card.id, 'effects/0/offsetY', blur.id)
    reconcileVariableBindings(graph)
    expect(graph.getNode(card.id)?.effects[0]).toMatchObject({
      color: { r: 0, g: 0, b: 0, a: 0.2 },
      radius: 12,
      spread: 12,
      offset: { x: 0, y: 12 }
    })
  })

  test('a bound effect follows the mode', () => {
    const { graph, collection, dark, shadow, card } = setup()
    graph.bindVariable(card.id, 'effects/0/color', shadow.id)
    graph.setActiveMode(collection.id, dark)
    reconcileVariableBindings(graph)
    expect(graph.getNode(card.id)?.effects[0]?.color).toEqual({ r: 1, g: 1, b: 1, a: 0.4 })
  })

  test('an effect part takes only a variable of its type, on an effect that exists', () => {
    const { graph, shadow, blur, card } = setup()
    expect(() => graph.bindVariable(card.id, 'effects/0/color', blur.id)).toThrow(
      'Cannot bind FLOAT variable to effect field'
    )
    expect(() => graph.bindVariable(card.id, 'effects/0/radius', shadow.id)).toThrow(
      'Cannot bind COLOR variable to effect field'
    )
    expect(() => graph.bindVariable(card.id, 'effects/3/radius', blur.id)).toThrow('out of range')
  })
})
