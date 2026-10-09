import { describe, expect, it } from 'bun:test'

import { FigmaAPI } from '@open-pencil/core/figma-api'
import { ALL_TOOLS } from '@open-pencil/core/tools'
import { SceneGraph } from '@open-pencil/scene-graph'

import { expectDefined } from '#core-tests/helpers/assert'

function setup() {
  const graph = new SceneGraph()
  return { graph, figma: new FigmaAPI(graph) }
}

function tool(name: string) {
  return expectDefined(
    ALL_TOOLS.find((candidate) => candidate.name === name),
    `tool ${name}`
  )
}

describe('HTML tools', () => {
  it('write_html adds the HTML as layers into a frame, auto layout from flex', async () => {
    const { graph, figma } = setup()
    const page = graph.getPages()[0].id
    const frame = graph.createNode('FRAME', page, { name: 'Desktop', width: 1440, height: 900 })
    const result = (await tool('write_html').execute(figma, {
      parent_id: frame.id,
      html: '<section style="display:flex;gap:16px;padding:24px"><h1 style="font-size:40px">Ship faster</h1><a style="padding:8px 16px;background:#2F5BEA;color:white">Start</a></section><script>steal()</script>'
    })) as { layers: { id: string; type: string }[] }
    expect(result.layers).toHaveLength(1)
    const section = expectDefined(graph.getNode(result.layers[0].id), 'section')
    expect(section.parentId).toBe(frame.id)
    expect(section.layoutMode).toBe('HORIZONTAL')
    expect(section.itemSpacing).toBe(16)
    const texts = [...graph.nodes.values()].filter((node) => node.type === 'TEXT').map((node) => node.text)
    expect(texts).toContain('Ship faster')
    expect(texts.join(' ')).not.toContain('steal')
  })

  it('update_styles changes only the given properties', async () => {
    const { graph, figma } = setup()
    const page = graph.getPages()[0].id
    const card = graph.createNode('FRAME', page, {
      width: 200,
      height: 100,
      opacity: 0.5,
      fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 }, opacity: 1, visible: true }]
    })
    const result = (await tool('update_styles').execute(figma, {
      id: card.id,
      styles: { 'border-radius': '16px', padding: '24px' }
    })) as { changed: string[] }
    const updated = expectDefined(graph.getNode(card.id), 'card')
    expect(updated.cornerRadius).toBe(16)
    expect(updated.paddingLeft).toBe(24)
    expect(updated.opacity).toBe(0.5)
    expect(updated.fills).toHaveLength(1)
    expect(result.changed).toContain('cornerRadius')
  })

  it('get_html returns the layer as HTML with CSS', async () => {
    const { graph, figma } = setup()
    const page = graph.getPages()[0].id
    const card = graph.createNode('FRAME', page, { name: 'Card', width: 200, height: 100 })
    graph.createNode('TEXT', card.id, { text: 'Hello Kalka' })
    const result = (await tool('get_html').execute(figma, { id: card.id })) as { html: string }
    expect(result.html).toContain('Hello Kalka')
    expect(result.html).toContain('<')
  })
})
