import { describe, expect, test } from 'bun:test'

import {
  breakpointsOf,
  counterpartIn,
  createBreakpoint,
  propagateResponsiveChange,
  reconcileBreakpoints,
  resetResponsiveOverrides,
  responsiveOverrides,
  SceneGraph,
  type SceneNode
} from '@kalka/scene-graph'

function page() {
  const graph = new SceneGraph()
  const pageId = graph.getPages()[0].id
  const desktop = graph.createNode('FRAME', pageId, {
    name: 'Desktop',
    width: 1440,
    height: 900,
    layoutMode: 'HORIZONTAL',
    itemSpacing: 40
  })
  const title = graph.createNode('TEXT', desktop.id, { name: 'Title', text: 'Hi', fontSize: 76 })
  const card = graph.createNode('FRAME', desktop.id, { name: 'Card', width: 400, height: 300 })
  return { graph, desktop, title, card }
}

/** Updates a layer and passes the change one breakpoint on, as the editor's sync does. */
function edit(graph: SceneGraph, id: string, changes: Partial<SceneNode>) {
  const node = graph.getNode(id)
  if (!node) throw new Error('No node')
  const previous = Object.fromEntries(
    Object.keys(changes).map((key) => [key, Reflect.get(node, key)])
  )
  graph.updateNode(id, changes)
  propagateResponsiveChange(graph, id, changes, previous)
}

describe('breakpoints', () => {
  test('a breakpoint is a linked copy at its width, after the primary', () => {
    const { graph, desktop, title } = page()
    const tablet = createBreakpoint(graph, desktop.id, 810, 'Tablet')
    const phone = createBreakpoint(graph, desktop.id, 390, 'Phone')
    expect(breakpointsOf(graph, desktop.id).map((b) => [b.root.name, b.width])).toEqual([
      ['Tablet', 810],
      ['Phone', 390]
    ])
    expect(tablet?.x).toBe(desktop.x + 1440 + 120)
    const phoneTitle = phone && counterpartIn(graph, title, phone)
    expect(phoneTitle?.responsiveSource).toBe(title.id)
    expect(phoneTitle?.fontSize).toBe(76)
    expect(phone && responsiveOverrides(graph, phone)).toEqual([])
  })

  test('a change passes to narrower breakpoints until one has its own value', () => {
    const { graph, desktop, title } = page()
    const tablet = createBreakpoint(graph, desktop.id, 810, 'Tablet')
    const phone = createBreakpoint(graph, desktop.id, 390, 'Phone')
    if (!tablet || !phone) throw new Error('No breakpoints')
    const tabletTitle = counterpartIn(graph, title, tablet)
    const phoneTitle = counterpartIn(graph, title, phone)
    if (!tabletTitle || !phoneTitle) throw new Error('No copies')

    edit(graph, phoneTitle.id, { fontSize: 40 })
    expect(responsiveOverrides(graph, phoneTitle)).toEqual(['fontSize'])

    edit(graph, title.id, { fontSize: 88 })
    // The tablet followed; passing its change on, the phone keeps its own size.
    propagateResponsiveChange(graph, tabletTitle.id, { fontSize: 88 }, { fontSize: 76 })
    expect(graph.getNode(tabletTitle.id)?.fontSize).toBe(88)
    expect(graph.getNode(phoneTitle.id)?.fontSize).toBe(40)

    resetResponsiveOverrides(graph, phoneTitle.id)
    expect(graph.getNode(phoneTitle.id)?.fontSize).toBe(88)
  })

  test('sizes that layout sets are not values of a breakpoint’s own', () => {
    const { graph, desktop, card } = page()
    graph.updateNode(card.id, { layoutGrow: 1 })
    const phone = createBreakpoint(graph, desktop.id, 390, 'Phone')
    const phoneCard = phone && counterpartIn(graph, card, phone)
    if (!phoneCard) throw new Error('No copy')
    graph.updateNode(phoneCard.id, { width: 120, x: 7 })
    expect(responsiveOverrides(graph, phoneCard)).toEqual([])
  })

  test('the structure stays the primary’s: added, removed and moved layers follow', () => {
    const { graph, desktop, card } = page()
    const phone = createBreakpoint(graph, desktop.id, 390, 'Phone')
    if (!phone) throw new Error('No breakpoint')

    const badge = graph.createNode('FRAME', desktop.id, { name: 'Badge' })
    graph.deleteNode(card.id)
    graph.reorderChild(badge.id, desktop.id, 0)
    reconcileBreakpoints(graph, desktop.id)
    expect(graph.getChildren(phone.id).map((node) => node.name)).toEqual(['Badge', 'Title'])

    // A layer drawn in the breakpoint joins the primary.
    graph.createNode('TEXT', phone.id, { name: 'Note', text: 'Mobile only' })
    reconcileBreakpoints(graph, desktop.id)
    expect(graph.getChildren(desktop.id).map((node) => node.name)).toEqual([
      'Badge',
      'Title',
      'Note'
    ])
    const note = graph.getChildren(phone.id).find((node) => node.name === 'Note')
    expect(note?.responsiveSource).toBe(graph.getChildren(desktop.id)[2]?.id)
  })
})
