import { expect, test } from 'bun:test'

import { sceneNodeToDesignDocument, serializeHTML } from '@kalka/dom-css/export'
import { SceneGraph } from '@kalka/scene-graph'

test('a layer draws and exports the CSS its fields cannot hold', () => {
  const graph = new SceneGraph()
  const card = graph.createNode('FRAME', graph.getPages()[0].id, {
    width: 120,
    height: 40,
    style: { cursor: 'pointer', transition: 'opacity 200ms' }
  })
  const html = serializeHTML(sceneNodeToDesignDocument(graph, card.id, { includeSourceIds: false }))
  expect(html).toContain('width: 120px')
  expect(html).toContain('cursor: pointer')
  expect(html).toContain('transition: opacity 200ms')
})
