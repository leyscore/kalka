import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@open-pencil/scene-graph'

import {
  populateAndApplyOverrides,
  protectField,
  syncNodeProps,
  type ProtectionMap
} from '../src/instance-overrides'

describe('@open-pencil/fig instance interpretation', () => {
  test('populates an empty instance from its component tree', () => {
    const graph = new SceneGraph()
    const pageId = graph.getPages()[0].id
    const component = graph.createNode('COMPONENT', pageId, { name: 'Button' })
    graph.createNode('TEXT', component.id, { text: 'Label' })
    const instance = graph.createNode('INSTANCE', pageId, {
      componentId: component.id,
      childIds: []
    })

    populateAndApplyOverrides(graph, new Map(), new Map())

    const populated = graph.getNode(instance.id)
    expect(populated?.childIds).toHaveLength(1)
    expect(graph.getNode(populated?.childIds[0] ?? '')?.text).toBe('Label')
  })

  test('preserves protected text while synchronizing other fields', () => {
    const graph = new SceneGraph()
    const pageId = graph.getPages()[0].id
    const source = graph.createNode('TEXT', pageId, { text: 'Source', visible: false })
    const target = graph.createNode('TEXT', pageId, { text: 'Override', visible: true })
    const protections: ProtectionMap = new Map()
    protectField(protections, target.id, 'text')

    syncNodeProps(graph, source, target, protections)

    expect(graph.getNode(target.id)).toMatchObject({ text: 'Override', visible: false })
  })
})
