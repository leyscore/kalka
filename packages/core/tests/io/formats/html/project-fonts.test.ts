import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import { renderNodesToHTML } from '#core/io/formats/html'
import { sampleProjectFont } from '#core-tests/helpers/project-fonts'

function page(fonts = true) {
  const graph = new SceneGraph()
  const frame = graph.createNode('FRAME', graph.getPages()[0].id, { width: 200, height: 100 })
  graph.createNode('TEXT', frame.id, { text: 'Hello', fontFamily: 'Inter Tight', fontWeight: 600 })
  if (fonts) graph.setProjectFont(sampleProjectFont())
  return { graph, frame }
}

describe('HTML export of the fonts a document carries', () => {
  test('a single-file page embeds them instead of naming a font service', async () => {
    const { graph, frame } = page()
    const { html, assets } = await renderNodesToHTML(graph, [frame.id], { html: 'standalone' })
    expect(assets).toEqual([])
    expect(html).toContain('@font-face')
    expect(html).toContain('data:font/woff2;base64,')
    expect(html).not.toContain('fonts.googleapis.com')
  })

  test('a page with its files beside it ships each font file once', async () => {
    const { graph, frame } = page()
    const { assets } = await renderNodesToHTML(
      graph,
      [frame.id],
      { html: 'standalone', assets: 'external' },
      'card.html'
    )
    expect(assets.map((asset) => asset.path).filter((path) => path.includes('/fonts/'))).toEqual([
      'card.assets/fonts/inter-tight/latin-wght-normal.woff2',
      'card.assets/fonts/inter-tight/cyrillic-wght-normal.woff2'
    ])
    const css = assets.find((asset) => asset.path.endsWith('.css'))
    expect(String(css?.content)).toContain('url("fonts/inter-tight/latin-wght-normal.woff2")')
  })

  test('a document that carries no fonts exports none, as before', async () => {
    const { graph, frame } = page(false)
    const { html } = await renderNodesToHTML(graph, [frame.id], { html: 'standalone' })
    expect(html).not.toContain('@font-face')
  })
})
