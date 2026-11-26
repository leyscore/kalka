import { describe, expect, test } from 'bun:test'

import { createEditor } from '@kalka/core/editor'

import {
  componentPlaygroundProperties,
  createComponentPlayground
} from '#core/editor/components/playground'

function setup() {
  const editor = createEditor()
  const page = editor.state.currentPageId
  const set = editor.graph.createNode('COMPONENT_SET', page, { name: 'Button' })
  const variant = (size: string, x: number) => {
    const component = editor.graph.createNode('COMPONENT', set.id, {
      name: `Size=${size}`,
      x,
      width: size === 'Large' ? 200 : 100,
      height: 40,
      componentPropertyValues: { Size: size }
    })
    editor.graph.createNode('TEXT', component.id, {
      name: 'Label',
      text: 'OK',
      componentPropertyReferences: [{ field: 'TEXT', propertyId: 'label' }]
    })
    return component
  }
  const small = variant('Small', 0)
  variant('Large', 200)
  editor.graph.updateNode(set.id, {
    componentPropertyDefinitions: [
      {
        id: 'size',
        name: 'Size',
        type: 'VARIANT',
        defaultValue: 'Small',
        variantOptions: ['Small', 'Large']
      },
      { id: 'label', name: 'Label', type: 'TEXT', defaultValue: 'OK' }
    ]
  })
  return { editor, set, small }
}

describe('component playground', () => {
  test('lists the variant and text properties with the values they start from', () => {
    const { editor, set } = setup()
    const properties = componentPlaygroundProperties(editor.graph, set.id)
    expect(properties?.definitions.map((definition) => definition.name)).toEqual(['Size', 'Label'])
    expect(properties?.values).toEqual({ size: 'Small', label: 'OK' })
  })

  test('shows the tried values on a private copy and leaves the file alone', () => {
    const { editor, set } = setup()
    const before = editor.graph.nodes.size
    const playground = createComponentPlayground(editor.graph, set.id, {
      size: 'Large',
      label: 'Buy'
    })
    if (!playground) throw new Error('No playground')
    const instance = playground.graph.getNode(playground.nodeId)
    expect(instance?.width).toBe(200)
    const label = playground.graph.getChildren(playground.nodeId)[0]
    expect(label?.text).toBe('Buy')
    expect(editor.graph.nodes.size).toBe(before)
    expect(editor.undo.canUndo).toBe(false)
  })
})
