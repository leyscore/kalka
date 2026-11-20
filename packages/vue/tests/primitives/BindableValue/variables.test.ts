import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import { createStableVariableList } from '#vue/primitives/BindableValue/variables'

function variables() {
  const graph = new SceneGraph()
  const collection = graph.createCollection('Spacing')
  const small = graph.createVariable('Small', 'FLOAT', collection.id, 4)
  const large = graph.createVariable('Large', 'FLOAT', collection.id, 16)
  return { small, large }
}

describe('the variable list a bindable field shows', () => {
  test('keeps its identity while the same variables show under the same names', () => {
    const { small, large } = variables()
    const stable = createStableVariableList()
    const shown = stable([small, large])
    expect(stable([small, large])).toBe(shown)
  })

  test('changes when a variable is renamed in place, added or left out', () => {
    const { small, large } = variables()
    const stable = createStableVariableList()
    const shown = stable([small, large])
    small.name = 'Tiny'
    const renamed = stable([small, large])
    expect(renamed).not.toBe(shown)
    expect(renamed.map((variable) => variable.name)).toEqual(['Tiny', 'Large'])
    expect(stable([large])).toEqual([large])
  })
})
