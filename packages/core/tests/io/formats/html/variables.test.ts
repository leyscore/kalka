import { expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import { renderNodesToHTML } from '#core/io/formats/html'

test('a standalone page defines the variables its layers reference, in each mode', async () => {
  const graph = new SceneGraph()
  const brand = graph.createCollection('Brand')
  const dark = graph.createMode(brand.id, 'Dark') ?? ''
  const accent = graph.createVariable('accent', 'COLOR', brand.id, { r: 0, g: 0, b: 1, a: 1 })
  accent.valuesByMode[dark] = { r: 1, g: 0.5, b: 0, a: 1 }
  const page = graph.getPages()[0].id
  const roots = ['Light', 'Dark'].map((name) => {
    const frame = graph.createNode('FRAME', page, { name, width: 100, height: 100 })
    if (name === 'Dark') frame.variableModes = { [brand.id]: dark }
    graph.createNode('RECTANGLE', frame.id, {
      fills: [{ type: 'SOLID', color: { r: 0, g: 0, b: 1, a: 1 }, opacity: 1, visible: true }],
      boundVariables: { 'fills/0/color': accent.id }
    })
    return frame.id
  })

  const { html } = await renderNodesToHTML(graph, roots, { html: 'standalone' })

  expect(html).toContain('background-color: var(--color-accent)')
  expect(html).toMatch(/:root \{\s*--color-accent: #0000FF;/)
  expect(html).toMatch(/\[data-brand="dark"\] \{\s*--color-accent: #FF8000;/)
})
