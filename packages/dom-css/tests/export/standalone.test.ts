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

test('external assets name fonts from the stylesheet that sits beside them', async () => {
  const graph = new SceneGraph()
  const text = graph.createNode('TEXT', graph.getPages()[0].id, {
    text: 'Kalka',
    fontFamily: 'Inter',
    fontWeight: 600
  })
  const document = sceneNodeToDesignDocument(graph, text.id, { includeSourceIds: false })
  const { files } = await exportHTMLBundle(document, {
    html: 'standalone',
    assets: 'external',
    assetBasePath: 'page.assets',
    fonts: (fonts, base) =>
      Promise.resolve(
        fonts.map((font) => ({
          family: font.family,
          weight: font.weight,
          style: font.style ?? 'normal',
          path: `${base}/inter.woff2`,
          format: 'woff2',
          content: new Uint8Array([0])
        }))
      )
  })
  const css = String(files.find((file) => file.path === 'page.assets/kalka.css')?.content)
  expect(css).toContain('url("fonts/inter.woff2")')
  expect(files.map((file) => file.path)).toContain('page.assets/fonts/inter.woff2')
})
