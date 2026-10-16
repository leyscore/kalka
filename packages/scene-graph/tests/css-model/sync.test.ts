import { describe, expect, test } from 'bun:test'

import { SceneGraph, type SceneNode } from '@kalka/scene-graph'
import {
  layerStyle,
  PARENT_STYLE_FIELDS,
  STYLE_FIELDS,
  writeLayerStyle
} from '@kalka/scene-graph/css-model'

import { SAMPLES } from './samples'

/** The fields a write reads, traced on the layer and on its parent. */
function readFields(node: SceneNode, parent: SceneNode | undefined) {
  const own = new Set<string>()
  const ofParent = new Set<string>()
  const traced = <T extends object>(target: T, into: Set<string>) =>
    new Proxy(target, {
      get(object, key, receiver) {
        if (typeof key === 'string') into.add(key)
        return Reflect.get(object, key, receiver)
      }
    })
  writeLayerStyle(traced(node, own), {
    parent: parent && traced(parent, ofParent),
    css: (_field, literal) => literal
  })
  return { own, ofParent }
}

function graphWithPage() {
  const graph = new SceneGraph()
  return { graph, page: graph.getPages()[0] }
}

describe('CSS kept in step with the fields', () => {
  test('the fields that change CSS are every field the table writes from', () => {
    for (const { type = 'FRAME', fields, parent: parentFields } of SAMPLES) {
      const { graph, page } = graphWithPage()
      const parent = parentFields ? graph.createNode('FRAME', page.id, parentFields) : undefined
      const node = graph.createNode(type, parent?.id ?? page.id, fields)
      const { own, ofParent } = readFields(node, parent)
      expect([...own].filter((key) => !STYLE_FIELDS.has(key))).toEqual([])
      expect([...ofParent].filter((key) => !PARENT_STYLE_FIELDS.has(key))).toEqual([])
    }
  })

  test('a new layer, and an edit to it, rewrite its CSS', () => {
    const { graph, page } = graphWithPage()
    const card = graph.createNode('FRAME', page.id, { width: 120, height: 40 })
    expect(card.style).toMatchObject({ width: '120px', height: '40px' })

    graph.updateNode(card.id, { opacity: 0.5, cornerRadius: 8 })
    expect(card.style).toMatchObject({ opacity: '0.5', 'border-radius': '8px' })
    expect(card.style).toEqual(layerStyle(card, page))
  })

  test('a parent that starts laying out its children rewrites theirs', () => {
    const { graph, page } = graphWithPage()
    const row = graph.createNode('FRAME', page.id, { width: 300, height: 100 })
    const item = graph.createNode('RECTANGLE', row.id, { x: 10, y: 20, width: 40, height: 40 })
    expect(item.style).toMatchObject({ position: 'absolute', left: '10px', top: '20px' })
    expect(row.style.position).toBe('relative')

    graph.updateNode(row.id, { layoutMode: 'HORIZONTAL' })
    expect(item.style.position).toBeUndefined()
    expect(item.style['flex-shrink']).toBe('0')
  })

  test('moving a layer rewrites it and both parents', () => {
    const { graph, page } = graphWithPage()
    const free = graph.createNode('FRAME', page.id, { width: 300, height: 100 })
    const row = graph.createNode('FRAME', page.id, { layoutMode: 'HORIZONTAL' })
    const item = graph.createNode('RECTANGLE', free.id, { width: 40, height: 40 })
    graph.reparentNode(item.id, row.id)
    expect(item.style.position).toBeUndefined()
    expect(free.style.position).toBeUndefined()
    graph.deleteNode(item.id)
    expect(row.style).toEqual(layerStyle(row, page))
  })

  test('declarations the fields cannot hold are kept as written', () => {
    const { graph, page } = graphWithPage()
    const card = graph.createNode('FRAME', page.id, {
      width: 120,
      style: { cursor: 'pointer', transition: 'opacity 200ms' }
    })
    graph.updateNode(card.id, { width: 200 })
    expect(card.style).toMatchObject({
      width: '200px',
      cursor: 'pointer',
      transition: 'opacity 200ms'
    })
  })
})
