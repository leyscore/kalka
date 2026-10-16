import { describe, expect, test } from 'bun:test'

import { renderNodesToHTML } from '#core/io/formats/html'

import { counterpartIn, createBreakpoint, SceneGraph } from '@kalka/scene-graph'

describe('HTML export of a page with breakpoints', () => {
  test('each breakpoint writes what it changes below the wider artboard’s width', async () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0]
    const desktop = graph.createNode('FRAME', page.id, {
      name: 'Desktop',
      width: 1440,
      height: 900,
      layoutMode: 'HORIZONTAL',
      itemSpacing: 40
    })
    const title = graph.createNode('TEXT', desktop.id, { name: 'Title', text: 'Hi', fontSize: 76 })
    const aside = graph.createNode('FRAME', desktop.id, { name: 'Aside', width: 300, height: 200 })
    graph.createNode('TEXT', aside.id, { name: 'Note', text: 'Aside' })
    const tablet = createBreakpoint(graph, desktop.id, 810, 'Tablet')
    const phone = createBreakpoint(graph, desktop.id, 390, 'Phone')
    if (!tablet || !phone) throw new Error('No breakpoints')
    const copy = (id: string, artboard: typeof phone) => {
      const node = graph.getNode(id)
      const found = node && counterpartIn(graph, node, artboard)
      if (!found) throw new Error('No copy')
      return found
    }
    graph.updateNode(copy(desktop.id, tablet).id, { layoutMode: 'VERTICAL' })
    graph.updateNode(copy(desktop.id, phone).id, { layoutMode: 'VERTICAL' })
    graph.updateNode(copy(title.id, phone).id, { fontSize: 40 })
    graph.updateNode(copy(aside.id, phone).id, { visible: false })

    const { html } = await renderNodesToHTML(graph, [desktop.id], { html: 'standalone' })
    expect(html).not.toContain('.op-')
    expect(html).toContain('@media (max-width:1439px){')
    expect(html).toMatch(/@media \(max-width:1439px\)\{\.[a-z][\w-]*\{flex-direction: column\}\}/)
    expect(html).toMatch(/@media \(max-width:809px\)\{\.[a-z][\w-]*\{font-size: 40px\}\}/)
    // The hidden aside is hidden once; its text needs no rule of its own.
    expect(html.match(/display: none/g)).toHaveLength(1)
    // The wider rules come first, so the phone's win below 810px.
    expect(html.indexOf('max-width:1439px')).toBeLessThan(html.indexOf('max-width:809px'))
    // The breakpoint artboards are not exported as pages of their own.
    expect(html).not.toContain('Phone')
  })
})
