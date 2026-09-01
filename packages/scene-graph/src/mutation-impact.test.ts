import { describe, expect, test } from 'bun:test'

import { SceneGraph } from './index'
import { collectSceneMutation, mutationLayoutScopeIds } from './mutation-impact'

function pageId(graph: SceneGraph): string {
  return graph.getPages()[0].id
}

describe('scene mutation impact', () => {
  test('collects created and updated nodes with current parents', async () => {
    const graph = new SceneGraph()
    const page = pageId(graph)
    const { result, impact } = await collectSceneMutation(graph, () => {
      const frame = graph.createNode('FRAME', page)
      graph.updateNode(frame.id, { width: 240 })
      return frame.id
    })

    expect(impact.createdNodeIds).toContain(result)
    expect(impact.changedNodeIds).toContain(result)
    expect(impact.currentParentIds).toContain(page)
    expect(mutationLayoutScopeIds(impact)).toContain(result)
  })

  test('retains the old parent when deleting', async () => {
    const graph = new SceneGraph()
    const parent = graph.createNode('FRAME', pageId(graph))
    const child = graph.createNode('RECTANGLE', parent.id)

    const { impact } = await collectSceneMutation(graph, () => graph.deleteNode(child.id))

    expect(impact.deletedNodeIds).toContain(child.id)
    expect(impact.previousParentIds).toContain(parent.id)
  })

  test('retains old and new parents when reparenting', async () => {
    const graph = new SceneGraph()
    const page = pageId(graph)
    const left = graph.createNode('FRAME', page)
    const right = graph.createNode('FRAME', page)
    const child = graph.createNode('RECTANGLE', left.id)

    const { impact } = await collectSceneMutation(graph, () =>
      graph.reparentNode(child.id, right.id)
    )

    expect(impact.previousParentIds).toContain(left.id)
    expect(impact.currentParentIds).toContain(right.id)
  })

  test('unsubscribes when an operation throws', async () => {
    const graph = new SceneGraph()
    expect(() =>
      collectSceneMutation(graph, () => {
        throw new Error('failed')
      })
    ).toThrow('failed')

    graph.createNode('RECTANGLE', pageId(graph))
    const { impact } = await collectSceneMutation(graph, () => undefined)
    expect(impact.changedNodeIds.size).toBe(0)
  })
})
