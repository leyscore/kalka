import { describe, expect, test } from 'bun:test'

import {
  fillingParentUpdates,
  layoutSizing,
  layoutSizingUpdates,
  SceneGraph,
  type SceneNode
} from '@kalka/scene-graph'

function child(parent: Partial<SceneNode>, node: Partial<SceneNode> = {}) {
  const graph = new SceneGraph()
  const frame = graph.createNode('FRAME', graph.getPages()[0].id, {
    width: 300,
    height: 200,
    ...parent
  })
  return { graph, node: graph.createNode('FRAME', frame.id, { width: 40, height: 30, ...node }) }
}

describe('layout sizing across a stretching parent', () => {
  test('fixing the cross axis opts out of stretch the parent applies to every child', () => {
    const { graph, node } = child({ layoutMode: 'HORIZONTAL', counterAxisAlign: 'STRETCH' })
    expect(layoutSizing(graph, node, 'VERTICAL')).toBe('FILL')

    const updates = layoutSizingUpdates(graph, node, 'VERTICAL', 'FIXED')
    expect(updates).toEqual({ layoutAlignSelf: 'MIN' })
    graph.updateNode(node.id, updates)
    expect(layoutSizing(graph, node, 'VERTICAL')).toBe('FIXED')
  })

  test('fixing an explicit stretch clears it', () => {
    const { graph, node } = child({ layoutMode: 'HORIZONTAL' }, { layoutAlignSelf: 'STRETCH' })
    expect(layoutSizingUpdates(graph, node, 'VERTICAL', 'FIXED')).toEqual({
      layoutAlignSelf: 'AUTO'
    })
  })
})

describe('a child set to fill a parent that hugs it', () => {
  test('turns the parent fixed along that axis only', () => {
    const { graph, node } = child({
      layoutMode: 'VERTICAL',
      primaryAxisSizing: 'HUG',
      counterAxisSizing: 'HUG'
    })
    const parentId = node.parentId ?? ''
    expect(fillingParentUpdates(graph, node, 'HORIZONTAL')).toEqual({
      id: parentId,
      updates: { counterAxisSizing: 'FIXED' }
    })
    expect(fillingParentUpdates(graph, node, 'VERTICAL')).toEqual({
      id: parentId,
      updates: { primaryAxisSizing: 'FIXED' }
    })
  })

  test('leaves a fixed parent, and a layer outside auto layout, alone', () => {
    const fixed = child({ layoutMode: 'VERTICAL', counterAxisSizing: 'FIXED' })
    expect(fillingParentUpdates(fixed.graph, fixed.node, 'HORIZONTAL')).toBeUndefined()
    const loose = child({ layoutMode: 'NONE' })
    expect(fillingParentUpdates(loose.graph, loose.node, 'HORIZONTAL')).toBeUndefined()
  })
})
