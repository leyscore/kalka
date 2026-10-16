import { describe, expect, test } from 'bun:test'

import { BUILTIN_IO_FORMATS, IORegistry } from '#core/io'

import { SceneGraph } from '@kalka/scene-graph'

const io = new IORegistry(BUILTIN_IO_FORMATS)

function frameGraph(overrides = {}) {
  const graph = new SceneGraph()
  const page = graph.getPages()[0]
  const frame = graph.createNode('FRAME', page.id, { width: 100, height: 100, ...overrides })
  return { graph, page, frame }
}

describe('.fig export warnings', () => {
  test('a document Figma shows whole exports without warnings', async () => {
    const result = await io.writeDocument('fig', frameGraph().graph)
    expect(result.warnings).toBeUndefined()
  })

  test('name the CSS Figma will not show', async () => {
    const { graph, page } = frameGraph({ htmlTag: 'nav' })
    const document = await io.writeDocument('fig', graph)
    const exported = await io.exportContent('fig', {
      graph,
      target: { scope: 'page', pageId: page.id }
    })
    const warning = 'Figma will not show HTML element tags (1 use); Kalka keeps it in the file.'
    expect(document.warnings).toEqual([warning])
    expect(exported.warnings).toEqual([warning])
  })

  test('keep what Figma cannot show for Kalka to read back', async () => {
    const { graph } = frameGraph({ htmlTag: 'nav' })
    const { data } = await io.writeDocument('fig', graph)
    const read = await io.readDocument({ name: 'nav.fig', data: data as Uint8Array })
    const tags = [...read.graph.getAllNodes()].map((node) => node.htmlTag)
    expect(tags).toContain('nav')
  })

  test('carry the CSS a layer keeps beside its fields there and back', async () => {
    const { graph } = frameGraph({
      name: 'Card',
      style: { width: '50%', transition: 'opacity 200ms' }
    })
    const written = await io.writeDocument('fig', graph)
    expect(written.warnings?.join(' ')).toContain('CSS kept beside the layers’ fields')
    const read = await io.readDocument({ name: 'card.fig', data: written.data as Uint8Array })
    const card = [...read.graph.getAllNodes()].find((node) => node.name === 'Card')
    expect(card?.style).toEqual({ width: '50%', transition: 'opacity 200ms' })
  })

  test('write no CSS for a layer that keeps none', async () => {
    const { graph } = frameGraph({ name: 'Plain' })
    const read = await io.readDocument({
      name: 'plain.fig',
      data: (await io.writeDocument('fig', graph)).data as Uint8Array
    })
    const plain = [...read.graph.getAllNodes()].find((node) => node.name === 'Plain')
    expect(plain?.style).toEqual({})
    expect(plain?.pluginData.some((entry) => entry.key === 'style')).toBe(false)
  })
})

