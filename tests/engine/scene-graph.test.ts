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

  test('create instance clones children with componentId mapping', () => {
    const graph = new SceneGraph()
    const comp = graph.createNode('COMPONENT', pageId(graph), { name: 'Btn', width: 100, height: 40 })
    const child = graph.createNode('RECTANGLE', comp.id, { name: 'BG', width: 100, height: 40 })
    const instance = graph.createInstance(comp.id, pageId(graph))!
    expect(instance.type).toBe('INSTANCE')
    expect(instance.componentId).toBe(comp.id)
    const instChildren = graph.getChildren(instance.id)
    expect(instChildren).toHaveLength(1)
    expect(instChildren[0].componentId).toBe(child.id)
    expect(instChildren[0].name).toBe('BG')
  })

  test('syncInstances propagates changes from component to instance', () => {
    const graph = new SceneGraph()
    const comp = graph.createNode('COMPONENT', pageId(graph), { name: 'Card', width: 200, height: 100 })
    const label = graph.createNode('TEXT', comp.id, { name: 'Title', text: 'Hello', fontSize: 14 })
    const instance = graph.createInstance(comp.id, pageId(graph))!
    const instLabel = graph.getChildren(instance.id)[0]
    expect(instLabel.text).toBe('Hello')

    graph.updateNode(label.id, { text: 'Updated', fontSize: 18 })
    graph.syncInstances(comp.id)

    expect(instLabel.text).toBe('Updated')
    expect(instLabel.fontSize).toBe(18)
  })

  test('syncInstances preserves overrides', () => {
    const graph = new SceneGraph()
    const comp = graph.createNode('COMPONENT', pageId(graph), { name: 'Card', width: 200, height: 100 })
    graph.createNode('TEXT', comp.id, { name: 'Title', text: 'Default', fontSize: 14 })
    const instance = graph.createInstance(comp.id, pageId(graph))!
    const instLabel = graph.getChildren(instance.id)[0]

    // Override the text on the instance child
    graph.updateNode(instLabel.id, { text: 'Custom' })
    instance.overrides[`${instLabel.id}:text`] = 'Custom'

    // Change component
    graph.updateNode(graph.getChildren(comp.id)[0].id, { text: 'New Default', fontSize: 20 })
    graph.syncInstances(comp.id)

    // Text preserved (overridden), fontSize synced (not overridden)
    expect(instLabel.text).toBe('Custom')
    expect(instLabel.fontSize).toBe(20)
  })

  test('syncInstances adds new children from component', () => {
    const graph = new SceneGraph()
    const comp = graph.createNode('COMPONENT', pageId(graph), { name: 'Card', width: 200, height: 100 })
    graph.createNode('RECTANGLE', comp.id, { name: 'BG' })
    const instance = graph.createInstance(comp.id, pageId(graph))!
    expect(graph.getChildren(instance.id)).toHaveLength(1)

    graph.createNode('TEXT', comp.id, { name: 'Label', text: 'New' })
    graph.syncInstances(comp.id)

    const instChildren = graph.getChildren(instance.id)
    expect(instChildren).toHaveLength(2)
    expect(instChildren[1].name).toBe('Label')
    expect(instChildren[1].text).toBe('New')
  })

  test('detachInstance breaks link', () => {
    const graph = new SceneGraph()
    const comp = graph.createNode('COMPONENT', pageId(graph), { name: 'Btn', width: 100, height: 40 })
    graph.createNode('RECTANGLE', comp.id, { name: 'BG' })
    const instance = graph.createInstance(comp.id, pageId(graph))!
    expect(instance.type).toBe('INSTANCE')

    graph.detachInstance(instance.id)
    expect(instance.type).toBe('FRAME')
    expect(instance.componentId).toBeNull()
    expect(graph.getInstances(comp.id)).toHaveLength(0)
  })
})
