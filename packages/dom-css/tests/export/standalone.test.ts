import { expect, test } from 'bun:test'

import { exportHTMLBundle, sceneNodeToDesignDocument } from '@kalka/dom-css/export'
import { SceneGraph } from '@kalka/scene-graph'

const WHITE = [
  { type: 'SOLID' as const, color: { r: 1, g: 1, b: 1, a: 1 }, opacity: 1, visible: true }
]

test('a standalone page keeps auto layout as flex, names classes after layers and shares equal styles', async () => {
  const graph = new SceneGraph()
  const card = graph.createNode('FRAME', graph.getPages()[0].id, {
    name: 'Pricing card',
    width: 400,
    height: 300,
    fills: WHITE,
    layoutMode: 'VERTICAL',
    primaryAxisSizing: 'HUG',
    itemSpacing: 16
  })
  for (const name of ['Plan', 'Plan']) {
    graph.createNode('TEXT', card.id, { name, text: name, textAutoResize: 'WIDTH_AND_HEIGHT' })
  }
  const document = {
    ...sceneNodeToDesignDocument(graph, card.id, { includeSourceIds: false }),
    sourceGraph: graph
  }
  const { files } = await exportHTMLBundle(document, { html: 'standalone' })
  const html = String(files[0]?.content)

  expect(html).not.toContain('position: absolute')
  expect(html).not.toContain('data-kalka')
  expect(html).toContain('<body><div class="pricing-card">')
  expect(html).toContain(
    '.pricing-card{width: 400px; background-color: #FFFFFF; display: flex; flex-direction: column'
  )
  expect(html.match(/class="plan"/g)).toHaveLength(2)
  expect(html).not.toContain('plan-2')
})
