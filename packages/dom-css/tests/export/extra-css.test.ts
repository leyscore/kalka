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

test('a layer placed at its position drops the margin its position already includes', () => {
  const graph = new SceneGraph()
  const column = graph.createNode('FRAME', graph.getPages()[0].id, { width: 400, height: 200 })
  const row = graph.createNode('FRAME', column.id, {
    y: 42,
    width: 400,
    height: 40,
    style: { 'margin-top': '12px', cursor: 'pointer' }
  })
  const html = serializeHTML(
    sceneNodeToDesignDocument(graph, column.id, { includeSourceIds: true })
  )
  const rowHTML = html.slice(html.indexOf(`data-kalka-node-id="${row.id}"`))
  expect(rowHTML).toContain('top: 42px')
  expect(rowHTML).toContain('cursor: pointer')
  expect(rowHTML).not.toContain('margin')
})
