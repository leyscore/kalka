import { expect, test } from 'bun:test'

import { artboardMarkup, LAYER_ID_ATTR, sceneNodeToDesignDocument } from '@kalka/dom-css/export'
import { SceneGraph } from '@kalka/scene-graph'

function markupOf(graph: SceneGraph, id: string): string {
  const node = graph.getNode(id)
  const projected = sceneNodeToDesignDocument(graph, id, { includeSourceIds: false }).children[0]
  if (!node || projected?.type !== 'element') throw new Error('Not projected')
  return artboardMarkup(node, projected)
}

test('an artboard is written as the canvas builds it, every layer tied to its id', () => {
  const graph = new SceneGraph()
  const row = graph.createNode('FRAME', graph.getPages()[0].id, {
    layoutMode: 'HORIZONTAL',
    primaryAxisSizing: 'HUG'
  })
  const label = graph.createNode('TEXT', row.id, { text: 'A < B', fontFamily: 'Inter' })
  const html = markupOf(graph, row.id)
  expect(html).toContain(`${LAYER_ID_ATTR}="${row.id}"`)
  expect(html).toContain(`${LAYER_ID_ATTR}="${label.id}"`)
  // Empty marker attributes stay, since the canvas stylesheet selects on them.
  expect(html).toContain('data-kalka-text=""')
  expect(html).toContain('A &lt; B')
  // A row that hugs its content keeps its own width in an iframe sized from the stored one.
  expect(html).toContain('width:max-content;')
})

test('CSS kept as written stays as written', () => {
  const graph = new SceneGraph()
  const frame = graph.createNode('FRAME', graph.getPages()[0].id, {
    width: 100,
    height: 40,
    style: { width: '50%' }
  })
  expect(markupOf(graph, frame.id)).toContain('width:50%;')
})
