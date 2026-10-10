import { describe, expect, test } from 'bun:test'

import {
  assignHTMLClasses,
  classOverrides,
  cssClassesSchema,
  deleteCSSClass,
  documentCSSClasses,
  findCSSClass,
  renameCSSClass,
  resetClassOverrides,
  SceneGraph,
  setCSSClass,
  updateClassFromNode,
  type Fill
} from '@open-pencil/scene-graph'
import * as v from 'valibot'

const solid = (r: number, g: number, b: number): Fill[] => [
  { type: 'SOLID', color: { r, g, b, a: 1 }, opacity: 1, visible: true }
]
const INK = solid(0.07, 0.07, 0.08)
const BLUE = solid(0.18, 0.36, 0.92)
const RED = solid(0.9, 0.1, 0.1)

function twoButtons() {
  const graph = new SceneGraph()
  const page = graph.getPages()[0]
  const first = graph.createNode('FRAME', page.id, {
    name: 'First',
    fills: INK,
    cornerRadius: 999,
    paddingLeft: 26
  })
  const second = graph.createNode('FRAME', page.id, { name: 'Second' })
  return { graph, first, second }
}

describe('CSS classes', () => {
  test('a new class name takes the layer’s look, and another layer given it takes that look', () => {
    const { graph, first, second } = twoButtons()
    assignHTMLClasses(graph, first.id, 'btn')
    expect(findCSSClass(graph, 'btn')).toEqual({
      name: 'btn',
      kind: 'box',
      style: { fills: INK, cornerRadius: 999, paddingLeft: 26 }
    })

    assignHTMLClasses(graph, second.id, ['btn'])
    const styled = graph.getNode(second.id)
    expect(styled?.fills).toEqual(INK)
    expect(styled?.cornerRadius).toBe(999)
    expect(styled?.htmlClasses).toEqual(['btn'])
    expect(styled && classOverrides(graph, styled)).toEqual([])
  })

  test('changing a class restyles its layers, except where a layer set its own value', () => {
    const { graph, first, second } = twoButtons()
    assignHTMLClasses(graph, first.id, 'btn')
    assignHTMLClasses(graph, second.id, 'btn')
    graph.updateNode(second.id, { cornerRadius: 4 })

    setCSSClass(graph, {
      name: 'btn',
      kind: 'box',
      style: { fills: BLUE, cornerRadius: 12, paddingLeft: 26 }
    })
    expect(graph.getNode(first.id)?.fills).toEqual(BLUE)
    expect(graph.getNode(first.id)?.cornerRadius).toBe(12)
    expect(graph.getNode(second.id)?.fills).toEqual(BLUE)
    expect(graph.getNode(second.id)?.cornerRadius).toBe(4)

    // A field the class no longer sets goes back to a new layer's, unless the layer set it.
    setCSSClass(graph, { name: 'btn', kind: 'box', style: { fills: BLUE } })
    expect(graph.getNode(first.id)?.paddingLeft).toBe(0)
  })

  test('a layer’s own values can go up to its class or be dropped', () => {
    const { graph, first, second } = twoButtons()
    assignHTMLClasses(graph, first.id, 'btn')
    assignHTMLClasses(graph, second.id, 'btn')
    graph.updateNode(first.id, { fills: RED, opacity: 0.5 })
    const changed = graph.getNode(first.id)
    expect(changed && classOverrides(graph, changed)).toEqual(['fills', 'opacity'])

    updateClassFromNode(graph, first.id)
    expect(graph.getNode(second.id)?.fills).toEqual(RED)
    expect(graph.getNode(second.id)?.opacity).toBe(0.5)

    graph.updateNode(second.id, { cornerRadius: 2, fills: INK })
    resetClassOverrides(graph, second.id)
    expect(graph.getNode(second.id)?.cornerRadius).toBe(999)
    expect(graph.getNode(second.id)?.fills).toEqual(RED)
  })

  test('the later class in the document wins, and text classes leave boxes alone', () => {
    const { graph, first } = twoButtons()
    setCSSClass(graph, { name: 'ghost', kind: 'box', style: { fills: [] } })
    setCSSClass(graph, { name: 'primary', kind: 'box', style: { fills: BLUE } })
    setCSSClass(graph, { name: 'lead', kind: 'text', style: { fontSize: 20 } })
    assignHTMLClasses(graph, first.id, 'primary ghost lead')
    expect(graph.getNode(first.id)?.fills).toEqual(BLUE)
    expect(graph.getNode(first.id)?.fontSize).toBe(14)
  })

  test('renaming and deleting follow the layers', () => {
    const { graph, first } = twoButtons()
    assignHTMLClasses(graph, first.id, 'btn')
    expect(renameCSSClass(graph, 'btn', 'button')).toBe(true)
    expect(graph.getNode(first.id)?.htmlClasses).toEqual(['button'])
    expect(renameCSSClass(graph, 'button', 'bad name')).toBe(false)

    deleteCSSClass(graph, 'button')
    expect(documentCSSClasses(graph)).toEqual([])
    expect(graph.getNode(first.id)?.htmlClasses).toEqual([])
    expect(graph.getNode(first.id)?.cornerRadius).toBe(999)
  })

  test('stored classes keep only valid classes, once, with the fields of their kind', () => {
    const parsed = v.parse(cssClassesSchema, [
      { name: 'btn', kind: 'box', style: { cornerRadius: 8, fontSize: 30, x: 4 } },
      { name: 'btn', kind: 'box', style: {} },
      { name: 'a"b', kind: 'box', style: {} },
      { name: 'lead', kind: 'nope', style: {} },
      'junk'
    ])
    expect(parsed).toEqual([{ name: 'btn', kind: 'box', style: { cornerRadius: 8 } }])
  })
})
