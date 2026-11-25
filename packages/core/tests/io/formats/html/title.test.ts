import { expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import { renderNodesToHTML } from '#core/io/formats/html'

function card() {
  const graph = new SceneGraph()
  const frame = graph.createNode('FRAME', graph.getPages()[0].id, {
    name: 'Pricing card',
    width: 200,
    height: 100
  })
  return { graph, frame }
}

test('a standalone page is titled after the file it is written to', async () => {
  const { graph, frame } = card()
  const { html } = await renderNodesToHTML(
    graph,
    [frame.id],
    { html: 'standalone' },
    'out/Landing.html'
  )
  expect(html).toContain('<title>Landing</title>')
})

test('a standalone page without a file name is titled after its layer', async () => {
  const { graph, frame } = card()
  const { html } = await renderNodesToHTML(graph, [frame.id], { html: 'standalone' })
  expect(html).toContain('<title>Pricing card</title>')
})

test('a fragment has no title', async () => {
  const { graph, frame } = card()
  const { html } = await renderNodesToHTML(graph, [frame.id], {}, 'out/Landing.html')
  expect(html).not.toContain('<title>')
})
