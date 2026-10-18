import { describe, expect, test } from 'bun:test'

import {
  exportHTMLBundle,
  sceneNodesToTailwindJSX,
  sceneNodeToDesignDocument
} from '#dom-css/export/index'
import { createHeadlessCSSRuntime, htmlToSceneGraph } from '#dom-css/index'

import { createShaderLayer, SceneGraph } from '@kalka/scene-graph'

function shaderCard() {
  const graph = new SceneGraph()
  const page = graph.getPages()[0]
  const card = graph.createNode('FRAME', page.id, {
    name: 'Card',
    width: 320,
    height: 200,
    htmlTag: 'section',
    shader: createShaderLayer('mesh-gradient')
  })
  graph.createNode('TEXT', card.id, { text: 'Title', htmlTag: 'h2' })
  return { graph, card }
}

describe('exported markup', () => {
  test('carries none of the editor attributes, in every HTML flavour', async () => {
    const { graph, card } = shaderCard()
    const document = sceneNodeToDesignDocument(graph, card.id, { includeSourceIds: false })
    const outputs = [
      ...(await exportHTMLBundle(document)).files,
      ...(await exportHTMLBundle(document, { html: 'standalone' })).files
    ].map((file) => String(file.content))
    outputs.push(sceneNodesToTailwindJSX(graph, [card.id]))
    for (const output of outputs) expect(output).not.toContain('data-kalka-')
  })

  test('keeps the layer ids a caller asks for', async () => {
    const { graph, card } = shaderCard()
    const document = sceneNodeToDesignDocument(graph, card.id, { includeSourceIds: true })
    const html = String((await exportHTMLBundle(document)).files[0]?.content)
    expect(html).toContain(`data-kalka-node-id="${card.id}"`)
  })

  test('a shader comes back when its exported HTML is imported', async () => {
    const { graph, card } = shaderCard()
    const document = sceneNodeToDesignDocument(graph, card.id, { includeSourceIds: false })
    const html = String((await exportHTMLBundle(document)).files[0]?.content)
    const imported = await htmlToSceneGraph(html, { runtime: createHeadlessCSSRuntime() })
    const shader = [...imported.nodes.values()].find((node) => node.shader)?.shader
    expect(shader).toEqual(card.shader)
  })
})
