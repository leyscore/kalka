import { describe, expect, test } from 'bun:test'

import { sceneGraphToDesignDocument, sceneNodeToDesignDocument } from '#dom-css/export/index'
import { designDocumentToSceneGraph } from '#dom-css/import/scene-graph'

import { createShaderLayer, SceneGraph } from '@open-pencil/scene-graph'

describe('shader layers in HTML', () => {
  test('export carries the layer and a gradient stand-in, and import brings the layer back', () => {
    const graph = new SceneGraph()
    const shader = createShaderLayer('mesh-gradient')
    const frame = graph.createNode('FRAME', graph.getPages()[0].id, {
      name: 'Hero',
      width: 400,
      height: 200,
      shader
    })
    const document = sceneNodeToDesignDocument(graph, frame.id)
    const element = document.children[0]
    if (element?.type !== 'element') throw new Error('Expected an element')
    expect(element.attrs['data-paper-shader']).toBe('')
    expect(JSON.parse(element.attrs['data-kalka-shader'] ?? '')).toEqual(shader)
    expect(element.inlineStyle?.['background-image']).toStartWith('linear-gradient(135deg')

    const imported = designDocumentToSceneGraph(document)
    const node = [...imported.nodes.values()].find((candidate) => candidate.shader)
    expect(node?.shader).toEqual(shader)
    expect(node?.fills.some((fill) => fill.type.startsWith('GRADIENT'))).toBe(false)
  })

  test('a layer without a shader has no shader attributes', () => {
    const graph = new SceneGraph()
    graph.createNode('FRAME', graph.getPages()[0].id, { name: 'Plain' })
    const html = JSON.stringify(sceneGraphToDesignDocument(graph))
    expect(html).not.toContain('data-kalka-shader')
  })
})
