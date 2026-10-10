import { describe, expect, test } from 'bun:test'

import { FigmaAPI } from '@open-pencil/core/figma-api'
import { ALL_TOOLS } from '@open-pencil/core/tools'
import { SceneGraph } from '@open-pencil/scene-graph'

import { expectDefined } from '#core-tests/helpers/assert'

const tool = (name: string) =>
  expectDefined(
    ALL_TOOLS.find((candidate) => candidate.name === name),
    name
  )

describe('CSS class tools', () => {
  test('a class made with CSS styles the layers given it, and each can keep its own values', async () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0]
    const first = graph.createNode('FRAME', page.id, { name: 'First' })
    const second = graph.createNode('FRAME', page.id, { name: 'Second' })
    const figma = new FigmaAPI(graph)

    const created = await tool('update_css_class').execute(figma, {
      name: 'btn',
      styles: { 'background-color': '#2F5BEA', 'border-radius': '999px' }
    })
    expect(created).toEqual({
      name: 'btn',
      kind: 'box',
      css: { 'background-color': '#2F5BEA', 'border-radius': '999px' }
    })

    await tool('set_html_element').execute(figma, { id: first.id, classes: 'btn' })
    await tool('set_html_element').execute(figma, { id: second.id, classes: 'btn' })
    expect(graph.getNode(first.id)?.cornerRadius).toBe(999)

    graph.updateNode(second.id, { cornerRadius: 4 })
    await tool('update_css_class').execute(figma, { name: 'btn', styles: { 'border-radius': '12px' } })
    expect(graph.getNode(first.id)?.cornerRadius).toBe(12)
    expect(graph.getNode(second.id)?.cornerRadius).toBe(4)

    await tool('edit_css_class').execute(figma, { action: 'reset_layer', id: second.id })
    expect(graph.getNode(second.id)?.cornerRadius).toBe(12)

    const listed = await tool('get_css_classes').execute(figma, {})
    expect(listed).toEqual({
      classes: [
        {
          name: 'btn',
          kind: 'box',
          css: { 'background-color': '#2F5BEA', 'border-radius': '12px' },
          layers: 2
        }
      ]
    })

    await tool('edit_css_class').execute(figma, { action: 'rename', name: 'btn', new_name: 'button' })
    expect(graph.getNode(first.id)?.htmlClasses).toEqual(['button'])
    await tool('edit_css_class').execute(figma, { action: 'delete', name: 'button' })
    expect(await tool('get_css_classes').execute(figma, {})).toEqual({ classes: [] })
  })
})

describe('write_html and classes', () => {
  test('a class rule in written HTML becomes a document class its layers share', async () => {
    const graph = new SceneGraph()
    const figma = new FigmaAPI(graph)
    await tool('write_html').execute(figma, {
      html: '<style>.card { background-color: #2F5BEA; border-radius: 16px; width: 120px; height: 60px }</style><div class="card"></div><div class="card"></div>'
    })
    const listed = await tool('get_css_classes').execute(figma, {})
    expect(listed).toMatchObject({
      classes: [
        {
          name: 'card',
          kind: 'box',
          css: { 'background-color': '#2F5BEA', 'border-radius': '16px' },
          layers: 2
        }
      ]
    })
  })
})
