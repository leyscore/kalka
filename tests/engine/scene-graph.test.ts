import { describe, test, expect } from 'bun:test'

import { SceneGraph } from '../../src/engine/scene-graph'

function pageId(graph: SceneGraph) {
  return graph.getPages()[0].id
}

function rect(graph: SceneGraph, name: string, x = 0, y = 0, w = 50, h = 50) {
  return graph.createNode('RECTANGLE', pageId(graph), { name, x, y, width: w, height: h }).id
}

describe('SceneGraph', () => {
  test('create rectangle', () => {
    const graph = new SceneGraph()
    const id = rect(graph, 'Rect', 100, 100, 200, 150)
    const node = graph.getNode(id)!
    expect(node.type).toBe('RECTANGLE')
    expect(node.x).toBe(100)
    expect(node.width).toBe(200)
  })

  test('create and delete', () => {
    const graph = new SceneGraph()
    const id = rect(graph, 'R')
    expect(graph.getNode(id)).toBeTruthy()
    graph.deleteNode(id)
    expect(graph.getNode(id)).toBeFalsy()
  })

  test('reparent into frame', () => {
    const graph = new SceneGraph()
    const frame = graph.createNode('FRAME', pageId(graph), { name: 'F', x: 50, y: 50, width: 400, height: 400 }).id
    const r = rect(graph, 'R', 100, 100)
    graph.reparentNode(r, frame)
    const children = graph.getChildren(frame)
    expect(children.map(c => c.id)).toContain(r)
  })

  test('children order', () => {
    const graph = new SceneGraph()
    rect(graph, 'A')
    rect(graph, 'B')
    rect(graph, 'C')
    const names = graph.getChildren(pageId(graph)).map(n => n.name)
    expect(names).toEqual(['A', 'B', 'C'])
  })

  test('pages', () => {
    const graph = new SceneGraph()
    expect(graph.getPages()).toHaveLength(1)
    expect(graph.getPages()[0].name).toBe('Page 1')
    const page2 = graph.addPage('Page 2')
    expect(graph.getPages()).toHaveLength(2)
    expect(page2.name).toBe('Page 2')
    rect(graph, 'Shape', 0, 0, 50, 50)
    expect(graph.getChildren(pageId(graph))).toHaveLength(1)
    expect(graph.getChildren(page2.id)).toHaveLength(0)
  })

  test('update node', () => {
    const graph = new SceneGraph()
    const id = rect(graph, 'R')
    graph.updateNode(id, { x: 200, name: 'Updated' })
    const node = graph.getNode(id)!
    expect(node.x).toBe(200)
    expect(node.name).toBe('Updated')
  })
})
