import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'
import {
  applyDocumentChanges,
  diffDocument,
  documentMerge,
  narrowLayerChange
} from '@kalka/scene-graph/diff'

/** Another graph with the same layers and variables under the same IDs, as a version reads back. */
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
  for (const collection of graph.variableCollections.values())
    copy.addCollection(structuredClone(collection))
  for (const variable of graph.variables.values())
    copy.variables.set(variable.id, structuredClone(variable))
  return copy
}

function sample() {
  const graph = new SceneGraph()
  const page = graph.getPages()[0] ?? graph.addPage('Page 1')
  const button = graph.createNode('COMPONENT', page.id, { name: 'Button', width: 120 })
  const card = graph.createNode('FRAME', page.id, { name: 'Card', width: 200, x: 0 })
  const colors = graph.createCollection('Colors')
  const brand = graph.createVariable('brand', 'COLOR', colors.id, { r: 1, g: 0, b: 0, a: 1 })
  const ink = graph.createVariable('ink', 'COLOR', colors.id, { r: 0, g: 0, b: 0, a: 1 })
  return { graph, page, button, card, colors, brand, ink }
}

describe('diffDocument', () => {
  test('lists components apart from layers, and variables with their collection', () => {
    const { graph, button, card, colors, brand } = sample()
    const after = copyOf(graph)
    expect(diffDocument(graph, after)).toEqual({ layers: [], variables: [] })
    after.updateNode(button.id, { width: 140 })
    after.updateNode(card.id, { x: 10 })
    const variable = after.variables.get(brand.id)
    if (variable) variable.valuesByMode = { [colors.defaultModeId]: { r: 0, g: 0, b: 1, a: 1 } }
    after.createVariable('accent', 'COLOR', colors.id)
    const spacing = after.createCollection('Spacing')
    after.createVariable('gap', 'FLOAT', spacing.id, 8)

    const { layers, variables } = diffDocument(graph, after)
    expect(layers.map((change) => [change.name, change.asset])).toEqual([
      ['Button', 'component'],
      ['Card', null]
    ])
    expect(variables.map((change) => [change.entity, change.kind, change.name])).toEqual([
      ['collection', 'added', 'Spacing'],
      ['variable', 'changed', 'brand'],
      ['variable', 'added', 'accent']
    ])
    expect(variables[0]?.descendants).toBe(1)
    expect(variables[1]).toMatchObject({ collection: 'Colors', fields: ['valuesByMode'] })
  })
})

describe('styles', () => {
  test('lists a style added with the page that holds styles, and brings both in', () => {
    const { graph } = sample()
    const main = copyOf(graph)
    const branch = copyOf(graph)
    const host = branch.createNode('CANVAS', branch.rootId, { name: 'Styles', internalOnly: true })
    const style = branch.createNode('RECTANGLE', host.id, {
      name: 'Brand/Primary',
      sharedStyleType: 'FILL',
      internalOnly: true
    })
    const { layers } = diffDocument(main, branch)
    expect(layers.map((change) => [change.name, change.kind, change.asset])).toEqual([
      ['Brand/Primary', 'added', 'style']
    ])
    expect(applyDocumentChanges(main, branch, { layers, variables: [] })).toEqual([])
    expect(main.getNode(style.id)?.parentId).toBe(host.id)
    expect(main.getNode(host.id)?.internalOnly).toBe(true)
  })
})

describe('documentMerge and applyDocumentChanges', () => {
  test('brings chosen variable changes in and flags those both sides changed', () => {
    const { graph, colors, brand, ink } = sample()
    const main = copyOf(graph)
    const branch = copyOf(graph)
    const mode = colors.defaultModeId
    const set = (target: SceneGraph, id: string, b: number) => {
      const variable = target.variables.get(id)
      if (variable) variable.valuesByMode = { [mode]: { r: 0, g: 0, b, a: 1 } }
    }
    set(branch, brand.id, 1)
    set(main, brand.id, 0.5)
    branch.variables.delete(ink.id)
    const colorsOnBranch = branch.variableCollections.get(colors.id)
    if (colorsOnBranch)
      colorsOnBranch.variableIds = colorsOnBranch.variableIds.filter((id) => id !== ink.id)
    const accent = branch.createVariable('accent', 'COLOR', colors.id)

    const { changes, conflicts } = documentMerge(graph, main, branch)
    expect([...conflicts]).toEqual([brand.id])
    const taken = changes.variables.filter((change) => change.id !== brand.id)
    expect(applyDocumentChanges(main, branch, { layers: [], variables: taken })).toEqual([])
    expect(main.variables.has(ink.id)).toBe(false)
    expect(main.variableCollections.get(colors.id)?.variableIds).toEqual([brand.id, accent.id])
    expect(main.variables.get(brand.id)?.valuesByMode[mode]).toEqual({ r: 0, g: 0, b: 0.5, a: 1 })
  })

  test('takes some property families of a layer and leaves the others', () => {
    const { graph, card } = sample()
    const main = copyOf(graph)
    const branch = copyOf(graph)
    branch.updateNode(card.id, { x: 40, name: 'Hero' })
    main.updateNode(card.id, { x: 20 })
    const { changes, conflictGroups } = documentMerge(graph, main, branch)
    expect([...(conflictGroups.get(card.id) ?? [])]).toEqual(['position'])
    const [change] = changes.layers
    const narrowed = change && narrowLayerChange(change, new Set(['name']))
    expect(narrowed?.fields).toEqual(['name'])
    expect(change && narrowLayerChange(change, new Set(['fill']))).toBeNull()
    applyDocumentChanges(main, branch, { layers: narrowed ? [narrowed] : [], variables: [] })
    expect(main.getNode(card.id)).toMatchObject({ name: 'Hero', x: 20 })
  })
})
