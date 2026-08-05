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

  test('repositions pinned children through nested resized instances', () => {
    const graph = new SceneGraph()
    const pageId = graph.getPages()[0].id
    const component = graph.createNode('COMPONENT', pageId, {
      width: 442,
      height: 32,
      layoutMode: 'HORIZONTAL'
    })
    graph.createNode('TEXT', component.id, { x: 32, y: 6, width: 80, height: 20 })
    graph.createNode('TEXT', component.id, { x: 120, y: 6, width: 80, height: 20 })
    graph.createNode('INSTANCE', component.id, {
      x: 420,
      y: 9,
      width: 14,
      height: 14,
      layoutPositioning: 'ABSOLUTE',
      horizontalConstraint: 'MAX',
      verticalConstraint: 'CENTER'
    })
    const source = graph.createNode('INSTANCE', pageId, {
      width: 256,
      height: 32,
      layoutMode: 'HORIZONTAL',
      componentId: component.id
    })
    const instance = graph.createNode('INSTANCE', pageId, {
      width: 256,
      height: 32,
      layoutMode: 'HORIZONTAL',
      componentId: source.id
    })

    populateAndApplyOverrides(graph, new Map(), new Map())

    const pinned = graph.getChildren(instance.id)[2]
    expect(pinned).toMatchObject({ x: 234, y: 9, width: 14, height: 14 })
  })

  test('resizes stretched absolute children with resized instances', () => {
    const graph = new SceneGraph()
    const pageId = graph.getPages()[0].id
    const component = graph.createNode('COMPONENT', pageId, {
      width: 100,
      height: 80,
      layoutMode: 'HORIZONTAL'
    })
    graph.createNode('RECTANGLE', component.id, {
      x: 10,
      y: 10,
      width: 80,
      height: 60,
      layoutPositioning: 'ABSOLUTE',
      horizontalConstraint: 'STRETCH',
      verticalConstraint: 'STRETCH'
    })
    const instance = graph.createNode('INSTANCE', pageId, {
      width: 200,
      height: 120,
      layoutMode: 'HORIZONTAL',
      componentId: component.id
    })

    populateAndApplyOverrides(graph, new Map(), new Map())

    expect(graph.getChildren(instance.id)[0]).toMatchObject({
      x: 10,
      y: 10,
      width: 180,
      height: 100
    })
  })

  test('applies pinned constraints inside resized freeform instances', () => {
    const graph = new SceneGraph()
    const pageId = graph.getPages()[0].id
    const component = graph.createNode('COMPONENT', pageId, { width: 100, height: 80 })
    graph.createNode('RECTANGLE', component.id, {
      x: 80,
      y: 10,
      width: 10,
      height: 60,
      layoutPositioning: 'ABSOLUTE',
      horizontalConstraint: 'MAX',
      verticalConstraint: 'STRETCH'
    })
    const instance = graph.createNode('INSTANCE', pageId, {
      width: 200,
      height: 120,
      componentId: component.id
    })

    populateAndApplyOverrides(graph, new Map(), new Map())

    expect(graph.getChildren(instance.id)[0]).toMatchObject({
      x: 180,
      y: 10,
      width: 10,
      height: 100
    })
  })

  test('preserves an inset child when a nested instance becomes narrower', () => {
    const graph = new SceneGraph()
    const pageId = graph.getPages()[0].id
    const field = graph.createNode('COMPONENT', pageId, { width: 280, height: 40 })
    graph.createNode('TEXT', field.id, {
      x: 16,
      y: 10,
      width: 248,
      height: 20,
      text: 'Placeholder'
    })
    const source = graph.createNode('INSTANCE', pageId, {
      width: 240,
      height: 40,
      componentId: field.id
    })
    const instance = graph.createNode('INSTANCE', pageId, {
      width: 180,
      height: 40,
      componentId: source.id
    })

    populateAndApplyOverrides(graph, new Map(), new Map())

    const placeholder = graph.getChildren(instance.id)[0]
    expect(placeholder).toMatchObject({ x: 16, y: 10, text: 'Placeholder' })
  })

  test('limits lazy population to required global propagation scans', () => {
    const graph = new SceneGraph()
    const activePage = graph.getPages()[0]
    const unrelatedPage = graph.addPage('Unrelated')
    const component = graph.createNode('COMPONENT', unrelatedPage.id, {
      width: 100,
      height: 40
    })
    graph.createNode('TEXT', component.id, { text: 'Label' })
    const instance = graph.createNode('INSTANCE', activePage.id, {
      width: 100,
      height: 40,
      componentId: component.id
    })
    for (let index = 0; index < 5_000; index++) {
      graph.createNode('RECTANGLE', unrelatedPage.id)
    }

    let globalScans = 0
    const getAllNodes = graph.getAllNodes.bind(graph)
    graph.getAllNodes = () => {
      globalScans++
      return getAllNodes()
    }

    populateAndApplyOverrides(graph, new Map(), new Map(), [], [activePage.id])

    expect(graph.getNode(instance.id)?.childIds).toHaveLength(1)
    expect(globalScans).toBe(2)
  })

  test('resolves text clone chains to their source values', () => {
    const graph = new SceneGraph()
    const pageId = graph.getPages()[0].id
    const source = graph.createNode('TEXT', pageId, {
      text: 'Label',
      width: 80,
      fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0, a: 1 }, opacity: 1, visible: true }]
    })
    const middle = graph.createNode('TEXT', pageId, {
      componentId: source.id,
      text: 'Label',
      width: 120
    })
    const leaf = graph.createNode('TEXT', pageId, {
      componentId: middle.id,
      text: 'Label',
      width: 160
    })

    populateAndApplyOverrides(graph, new Map(), new Map())

    expect(graph.getNode(middle.id)?.width).toBe(80)
    expect(graph.getNode(leaf.id)).toMatchObject({ width: 80, fills: source.fills })
  })

  test('synchronizes opacity bindings with their resolved value', () => {
    const graph = new SceneGraph()
    const pageId = graph.getPages()[0].id
    const source = graph.createNode('INSTANCE', pageId, {
      opacity: 0.5,
      boundVariables: { opacity: 'opacity-var' }
    })
    const target = graph.createNode('INSTANCE', pageId, {
      opacity: 1,
      componentId: source.id
    })

    syncNodeProps(graph, source, target)

    expect(graph.getNode(target.id)).toMatchObject({
      opacity: 0.5,
      boundVariables: { opacity: 'opacity-var' }
    })
  })

  test('clears opacity bindings removed from the source', () => {
    const graph = new SceneGraph()
    const pageId = graph.getPages()[0].id
    const source = graph.createNode('INSTANCE', pageId, { opacity: 1 })
    const target = graph.createNode('INSTANCE', pageId, {
      opacity: 0.5,
      componentId: source.id,
      boundVariables: { opacity: 'stale-opacity-var', width: 'width-var' }
    })

    syncNodeProps(graph, source, target)

    expect(graph.getNode(target.id)?.boundVariables).toEqual({ width: 'width-var' })
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
