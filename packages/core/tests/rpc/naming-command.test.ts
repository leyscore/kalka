import { describe, expect, test } from 'bun:test'

import {
  LAYERS_TO_NAME_LIMIT,
  executeRPCCommand,
  type CollectionUsageResult,
  type LayersToNameResult
} from '@kalka/core/rpc'
import { SceneGraph } from '@kalka/scene-graph'

function pageId(graph: SceneGraph): string {
  const page = graph.getPages()[0]
  if (!page) throw new Error('No page')
  return page.id
}

describe('layers_to_name command', () => {
  test('lists default-named layers with their kind, size, layout, children, and texts', async () => {
    const graph = new SceneGraph()
    const page = pageId(graph)
    const card = graph.createNode('FRAME', page, {
      name: 'Pricing',
      width: 320,
      height: 200.4
    })
    const button = graph.createNode('FRAME', card.id, {
      name: 'Frame 12',
      width: 120,
      height: 40,
      layoutMode: 'HORIZONTAL'
    })
    graph.createNode('TEXT', button.id, { name: 'Label', text: '  Start   free\ntrial ' })
    graph.createNode('RECTANGLE', card.id, { name: 'Rectangle 3', width: 10, height: 10 })

    const result = (await executeRPCCommand(graph, 'layers_to_name', {
      root_id: page
    })) as LayersToNameResult

    expect(result.total).toBe(2)
    expect(result.layers).toEqual([
      {
        id: button.id,
        type: 'FRAME',
        name: 'Frame 12',
        width: 120,
        height: 40,
        parent: 'Pricing',
        layout: 'row',
        children: { TEXT: 1 },
        texts: ['Start free trial']
      },
      expect.objectContaining({ name: 'Rectangle 3', parent: 'Pricing' })
    ])
  })

  test('caps the layers it lists and counts the rest', async () => {
    const graph = new SceneGraph()
    const page = pageId(graph)
    for (let index = 0; index < LAYERS_TO_NAME_LIMIT + 5; index++) {
      graph.createNode('FRAME', page, { name: `Frame ${index}` })
    }
    const result = (await executeRPCCommand(graph, 'layers_to_name', {
      root_id: page,
      limit: 1000
    })) as LayersToNameResult
    expect(result.layers).toHaveLength(LAYERS_TO_NAME_LIMIT)
    expect(result.total).toBe(LAYERS_TO_NAME_LIMIT + 5)
  })

  test('rejects an unknown root', () => {
    expect(() => executeRPCCommand(new SceneGraph(), 'layers_to_name', { root_id: 'x' })).toThrow(
      'Layer "x" not found'
    )
  })
})

describe('collection_usage command', () => {
  test('counts the variables and the layers bound to them', async () => {
    const graph = new SceneGraph()
    const collection = graph.createCollection('Brand')
    graph.createVariable('Primary', 'COLOR', collection.id, { r: 1, g: 0, b: 0, a: 1 })
    const radius = graph.createVariable('Radius', 'FLOAT', collection.id, 8)
    const frame = graph.createNode('FRAME', pageId(graph), { name: 'Card' })
    graph.bindVariable(frame.id, 'cornerRadius', radius.id)

    const result = (await executeRPCCommand(graph, 'collection_usage', {
      id: collection.id
    })) as CollectionUsageResult
    expect(result).toEqual({ id: collection.id, name: 'Brand', variables: 2, layers: 1 })
  })

  test('rejects an unknown collection', () => {
    expect(() => executeRPCCommand(new SceneGraph(), 'collection_usage', { id: 'x' })).toThrow(
      'Collection "x" not found'
    )
  })
})
