import { describe, expect, test } from 'bun:test'

import { FigmaAPI } from '@open-pencil/core/figma-api'
import { ALL_TOOLS } from '@open-pencil/core/tools'
import { SceneGraph } from '@open-pencil/scene-graph'

import { expectDefined } from '#core-tests/helpers/assert'

const tool = expectDefined(
  ALL_TOOLS.find((candidate) => candidate.name === 'set_html_element'),
  'set_html_element'
)

describe('set_html_element', () => {
  test('sets a tag and classes, and auto restores the tag the type gives', async () => {
    const graph = new SceneGraph()
    const frame = graph.createNode('FRAME', graph.getPages()[0].id, { name: 'Menu' })
    const figma = new FigmaAPI(graph)

    const set = await tool.execute(figma, { id: frame.id, tag: 'nav', classes: 'site-nav  site-nav x"y' })
    expect(set).toEqual({ id: frame.id, name: 'Menu', tag: 'nav', classes: ['site-nav'] })
    expect(graph.getNode(frame.id)?.htmlTag).toBe('nav')

    const reset = await tool.execute(figma, { id: frame.id, tag: 'auto' })
    expect(reset).toEqual({ id: frame.id, name: 'Menu', tag: 'auto', classes: ['site-nav'] })
  })

  test('reports a missing layer', async () => {
    const result = await tool.execute(new FigmaAPI(new SceneGraph()), { id: '0:404', tag: 'h1' })
    expect(result).toHaveProperty('error')
  })
})
