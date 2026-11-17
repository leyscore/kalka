import { describe, expect, test } from 'bun:test'

import { FigmaAPI } from '@kalka/core/figma-api'
import { ALL_TOOLS } from '@kalka/core/tools'
import { findCSSClass, SceneGraph } from '@kalka/scene-graph'

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

  test('a class reads CSS shorthands and resolves type against its own font size', async () => {
    const graph = new SceneGraph()
    const figma = new FigmaAPI(graph)
    const button = (await tool('update_css_class').execute(figma, {
      name: 'btn',
      styles: { padding: '0 28px', background: '#F0B429', 'border-radius': '16px' }
    })) as { css: Record<string, string>; not_kept?: Record<string, string> }
    expect(button.css['background-color']).toBe('#F0B429')
    expect(findCSSClass(graph, 'btn')?.style).toMatchObject({ paddingLeft: 28, paddingRight: 28 })
    expect(button.not_kept).toBeUndefined()

    await tool('update_css_class').execute(figma, {
      name: 'title',
      kind: 'text',
      styles: { 'font-size': '72px', 'line-height': '1.05', 'letter-spacing': '0.1em' }
    })
    expect(findCSSClass(graph, 'title')?.style).toMatchObject({ fontSize: 72 })
    expect(findCSSClass(graph, 'title')?.style.lineHeight).toBeCloseTo(75.6)
    expect(findCSSClass(graph, 'title')?.style.letterSpacing).toBeCloseTo(7.2)
  })

  test('a class reports the CSS it cannot hold instead of dropping it silently', async () => {
    const graph = new SceneGraph()
    const figma = new FigmaAPI(graph)
    const box = (await tool('update_css_class').execute(figma, {
      name: 'card',
      styles: { width: '292px', 'font-family': 'Montserrat', 'background-color': '#F4EFE6' }
    })) as { not_kept?: Record<string, string> }
    expect(Object.keys(box.not_kept ?? {}).sort()).toEqual(['font-family', 'width'])

    const text = (await tool('update_css_class').execute(figma, {
      name: 'lead',
      kind: 'text',
      styles: { 'line-height': '1.6' }
    })) as { not_kept?: Record<string, string> }
    expect(Object.keys(text.not_kept ?? {})).toEqual(['line-height'])
    expect(findCSSClass(graph, 'lead')?.style.lineHeight).toBeUndefined()
  })
})
