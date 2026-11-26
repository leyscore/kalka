import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'
import { applyLayerChanges, diffLayers, layerMerge } from '@kalka/scene-graph/diff'

/** Another graph holding the same layers with the same IDs, as a saved version reads back. */
function copyOf(graph: SceneGraph): SceneGraph {
  const copy = new SceneGraph()
  for (const page of copy.getChildren(copy.rootId)) copy.deleteNode(page.id)
  const visit = (id: string, parentId: string) => {
    const node = graph.getNode(id)
    if (!node) return
    const { id: _id, parentId: _parent, childIds: _children, ...props } = structuredClone(node)
    copy.createNodeWithId(id, node.type, parentId, props)
    for (const childId of node.childIds) visit(childId, id)
  }
  for (const page of graph.getChildren(graph.rootId)) visit(page.id, copy.rootId)
  return copy
}

function sample() {
  const graph = new SceneGraph()
  const page = graph.getPages()[0] ?? graph.addPage('Page 1')
  const card = graph.createNode('FRAME', page.id, { name: 'Card', width: 200, height: 100 })
  const title = graph.createNode('TEXT', card.id, { name: 'Title', text: 'Hello' })
  const icon = graph.createNode('RECTANGLE', card.id, { name: 'Icon', width: 16, height: 16 })
  return { graph, page, card, title, icon }
}

describe('diffLayers', () => {
  test('finds nothing between a document and its copy', () => {
    const { graph } = sample()
    expect(diffLayers(graph, copyOf(graph))).toEqual([])
  })

  test('names added, removed and changed layers with their property families', () => {
    const { graph, card, title, icon } = sample()
    const after = copyOf(graph)
    after.updateNode(title.id, { text: 'Bonjour', x: 12 })
    after.deleteNode(icon.id)
    const badge = after.createNode('FRAME', card.id, { name: 'Badge' })
    after.createNode('TEXT', badge.id, { name: 'Label' })

    const changes = diffLayers(graph, after)
    const byName = new Map(changes.map((change) => [change.name, change]))
    expect(byName.get('Title')?.kind).toBe('changed')
    expect(byName.get('Title')?.groups).toEqual(['position', 'text'])
    expect(byName.get('Icon')?.kind).toBe('removed')
    expect(byName.get('Badge')).toMatchObject({ kind: 'added', descendants: 1 })
    // A layer added inside an added one is counted, not listed.
    expect(byName.has('Label')).toBe(false)
  })

  test('reads a reorder among siblings as a move of the layer that moved', () => {
    const { graph, card, title } = sample()
    const after = copyOf(graph)
    after.reorderChild(title.id, card.id, 1)
    const changes = diffLayers(graph, after)
    expect(changes.filter((change) => change.moved).map((change) => change.name)).toEqual([
      'Icon',
      'Title'
    ])
    expect(changes.every((change) => change.groups.includes('order'))).toBe(true)
  })
})

describe('layerMerge and applyLayerChanges', () => {
  test('takes chosen incoming changes and keeps the target for the others', () => {
    const { graph, card, title, icon } = sample()
    const main = copyOf(graph)
    const branch = copyOf(graph)
    branch.updateNode(title.id, { text: 'Branch title' })
    branch.updateNode(icon.id, { width: 32 })
    branch.createNode('RECTANGLE', card.id, { name: 'New' })
    main.updateNode(icon.id, { width: 24 })

    const { changes, conflicts } = layerMerge(graph, main, branch)
    expect([...conflicts].map((id) => main.getNode(id)?.name)).toEqual(['Icon'])
    const taken = changes.filter((change) => change.id !== icon.id)
    expect(applyLayerChanges(main, branch, taken)).toEqual([])
    expect(main.getNode(title.id)?.text).toBe('Branch title')
    expect(main.getNode(icon.id)?.width).toBe(24)
    expect(main.getChildren(card.id).map((node) => node.name)).toEqual(['Title', 'Icon', 'New'])
    expect(diffLayers(main, branch).map((change) => change.name)).toEqual(['Icon'])
  })

  test('applies removals and skips a layer whose parent the target removed', () => {
    const { graph, page, card, icon } = sample()
    const main = copyOf(graph)
    const branch = copyOf(graph)
    branch.createNode('RECTANGLE', card.id, { name: 'Inside' })
    branch.deleteNode(icon.id)
    main.deleteNode(card.id)
    const { changes } = layerMerge(graph, main, branch)
    const added = changes.find((change) => change.name === 'Inside')
    expect(applyLayerChanges(main, branch, changes)).toEqual(added ? [added.id] : [])
    expect(main.getChildren(page.id)).toEqual([])
  })

  test('without a base, every difference is the incoming one', () => {
    const { graph, title } = sample()
    const branch = copyOf(graph)
    branch.updateNode(title.id, { name: 'Heading' })
    const { changes, conflicts } = layerMerge(null, graph, branch)
    expect(changes.map((change) => change.groups)).toEqual([['name']])
    expect(conflicts.size).toBe(0)
  })
})
