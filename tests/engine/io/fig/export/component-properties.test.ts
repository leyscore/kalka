import { beforeAll, describe, expect, test } from 'bun:test'

import { exportFigFile, initCodec } from '@open-pencil/core'
import { parseFigBuffer } from '@open-pencil/fig'
import { SceneGraph } from '@open-pencil/scene-graph'

import { importNodeChanges } from '#core/kiwi/fig/import'

describe('Figma component property roundtrip', () => {
  beforeAll(async () => {
    await initCodec()
  })

  test('retains typed definitions, refs, and assignments', async () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0]
    const component = graph.createNode('COMPONENT', page.id, {
      name: 'Card',
      componentPropertyDefinitions: [
        { id: '30:1', name: 'Label', type: 'TEXT', defaultValue: 'Default' },
        { id: '30:2', name: 'Visible', type: 'BOOLEAN', defaultValue: 'true' }
      ]
    })
    component.source.id = '10:1'
    const label = graph.createNode('TEXT', component.id, {
      name: 'Label',
      text: 'Default',
      componentPropertyReferences: [
        { propertyId: '30:1', field: 'TEXT' },
        { propertyId: '30:2', field: 'VISIBLE' }
      ]
    })
    label.source.id = '10:2'
    const instance = graph.createInstance(component.id, page.id, {
      name: 'Card instance',
      componentPropertyAssignments: { '30:1': 'Custom', '30:2': 'false' }
    })
    if (!instance) throw new Error('Expected instance')
    instance.source.id = '20:1'

    const bytes = await exportFigFile(graph)
    const parsed = parseFigBuffer(
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
    )
    const imported = importNodeChanges(parsed.nodeChanges, parsed.blobs, undefined, {
      populate: 'all'
    })
    const importedComponent = [...imported.getAllNodes()].find((node) => node.name === 'Card')
    const importedInstance = [...imported.getAllNodes()].find(
      (node) => node.name === 'Card instance'
    )
    const importedLabel = [...imported.getAllNodes()].find(
      (node) => node.name === 'Label' && node.parentId === importedComponent?.id
    )

    expect(importedComponent?.componentPropertyDefinitions).toEqual([
      { id: '30:1', name: 'Label', type: 'TEXT', defaultValue: 'Default' },
      { id: '30:2', name: 'Visible', type: 'BOOLEAN', defaultValue: 'true' }
    ])
    expect(importedLabel?.componentPropertyReferences).toEqual([
      { propertyId: '30:1', field: 'TEXT' },
      { propertyId: '30:2', field: 'VISIBLE' }
    ])
    expect(importedInstance?.componentPropertyAssignments).toEqual({
      '30:1': 'Custom',
      '30:2': 'false'
    })
  })
})
