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
})
