import { describe, expect, it } from 'bun:test'

import { FigmaAPI } from '@kalka/core/figma-api'
import { ALL_TOOLS } from '@kalka/core/tools'
import { SceneGraph } from '@kalka/scene-graph'

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

  it('write_html keeps the inline CSS no field holds', async () => {
    const { graph, figma } = setup()
    const page = graph.getPages()[0].id
    const result = (await tool('write_html').execute(figma, {
      parent_id: page,
      html: '<div style="display:flex;gap:12px;padding:1.5rem;transition:opacity 200ms;cursor:pointer"><span>One</span></div>'
    })) as { layers: { id: string }[] }
    const row = expectDefined(graph.getNode(result.layers[0].id), 'row')
    expect(row.layoutMode).toBe('HORIZONTAL')
    expect(row.itemSpacing).toBe(12)
    expect(row.style).toMatchObject({
      padding: '1.5rem',
      transition: 'opacity 200ms',
      cursor: 'pointer'
    })
    expect(row.style.display).toBeUndefined()
    expect(row.style.gap).toBeUndefined()
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

  it('update_styles keeps the CSS no field holds, and get_html gives it back', async () => {
    const { graph, figma } = setup()
    const page = graph.getPages()[0].id
    const card = graph.createNode('FRAME', page, {
      name: 'Card',
      width: 200,
      height: 100,
      layoutMode: 'VERTICAL'
    })
    await tool('update_styles').execute(figma, {
      id: card.id,
      styles: {
        width: '50%',
        padding: '1.5rem',
        transition: 'opacity 200ms',
        cursor: 'pointer',
        opacity: '0.8'
      }
    })
    const updated = expectDefined(graph.getNode(card.id), 'card')
    expect(updated.opacity).toBe(0.8)
    expect(updated.paddingTop).toBe(24)
    expect(updated.style).toEqual({
      width: '50%',
      padding: '1.5rem',
      transition: 'opacity 200ms',
      cursor: 'pointer'
    })
    const { html } = (await tool('get_html').execute(figma, { id: card.id })) as { html: string }
    for (const declaration of ['width: 50%', 'padding: 1.5rem', 'transition: opacity 200ms'])
      expect(html).toContain(declaration)

    // A later declaration for the same family replaces the one written as is.
    await tool('update_styles').execute(figma, { id: card.id, styles: { padding: '8px' } })
    expect(updated.paddingTop).toBe(8)
    expect(updated.style.padding).toBeUndefined()
    expect(updated.style.cursor).toBe('pointer')
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
