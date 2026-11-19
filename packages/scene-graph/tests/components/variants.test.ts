import { describe, expect, test } from 'bun:test'

import {
  defaultVariant,
  SceneGraph,
  variantDefaultValue,
  variantOptions
} from '@kalka/scene-graph'

/** A set of sizes laid out with Large first in its children but Small in the top-left corner. */
function sizes(defaultValue: string) {
  const graph = new SceneGraph()
  const definition = {
    id: 'size',
    name: 'Size',
    type: 'VARIANT' as const,
    defaultValue,
    variantOptions: ['Small', 'Large']
  }
  const set = graph.createNode('COMPONENT_SET', graph.getPages()[0].id, {
    name: 'Button',
    componentPropertyDefinitions: [definition]
  })
  graph.createNode('COMPONENT', set.id, {
    name: 'Size=Large',
    x: 0,
    y: 60,
    componentPropertyValues: { Size: 'Large' }
  })
  graph.createNode('COMPONENT', set.id, {
    name: 'Size=Small',
    x: 0,
    y: 0,
    componentPropertyValues: { Size: 'Small' }
  })
  return { graph, set, definition }
}

describe('default variants', () => {
  test('are the variant in the top-left corner, whatever the order of the children', () => {
    const { graph, set } = sizes('')
    expect(defaultVariant(graph, set)?.name).toBe('Size=Small')
  })

  // Figma reports the default variant's value whatever default the file records, and follows
  // the variant moved to the top left.
  test('give a property the default variant’s value, whatever the document records', () => {
    const empty = sizes('')
    expect(variantDefaultValue(empty.graph, empty.set, empty.definition)).toBe('Small')
    const recorded = sizes('Large')
    expect(variantDefaultValue(recorded.graph, recorded.set, recorded.definition)).toBe('Small')
    const [large, small] = recorded.graph.getChildren(recorded.set.id)
    recorded.graph.updateNode(large.id, { y: 0 })
    recorded.graph.updateNode(small.id, { y: 60 })
    expect(variantDefaultValue(recorded.graph, recorded.set, recorded.definition)).toBe('Large')
  })

  test('keep the recorded default while the default variant has no value for the property', () => {
    const { graph, set, definition } = sizes('Large')
    const small = graph.getChildren(set.id).find((variant) => variant.name === 'Size=Small')
    graph.updateNode(small?.id ?? '', { componentPropertyValues: { Size: '' } })
    expect(variantDefaultValue(graph, set, definition)).toBe('Large')
  })
})

describe('variant options', () => {
  test('keep the recorded values first and add those the variants use', () => {
    const { graph, set } = sizes('')
    const options = variantOptions(graph, set, { name: 'Size', variantOptions: ['Medium'] })
    expect(options).toEqual(['Medium', 'Large', 'Small'])
  })
})
