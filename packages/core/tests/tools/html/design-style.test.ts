import { describe, expect, it } from 'bun:test'

import { expectDefined } from '#core-tests/helpers/assert'

import { FigmaAPI } from '@kalka/core/figma-api'
import { ALL_TOOLS } from '@kalka/core/tools'
import { SceneGraph } from '@kalka/scene-graph'

import { readDesignStyle, recordDesignStyle, styleComment } from '#core/tools/html/design-style'

describe('the page style', () => {
  it('reads the style comment that opens the HTML, and nothing else', () => {
    expect(
      styleComment(
        '\n<!-- style: Dark Precision + Bento section | reason: four capabilities\n of equal weight | palette: #0b0c0e / #f2f2f0 / #7cf29a -->\n<main></main>'
      )
    ).toEqual({
      style: 'Dark Precision + Bento section',
      reason: 'four capabilities of equal weight',
      palette: '#0b0c0e / #f2f2f0 / #7cf29a'
    })
    expect(styleComment('<!-- STYLE: own direction -->')).toEqual({ style: 'own direction' })
    expect(styleComment('<main></main><!-- style: Bento -->')).toBeNull()
    expect(styleComment('<!-- style: | reason: none -->')).toBeNull()
  })

  it('write_html keeps the style on the page, where read_style finds it again', async () => {
    const graph = new SceneGraph()
    const figma = new FigmaAPI(graph)
    const page = graph.getPages()[0].id
    const frame = graph.createNode('FRAME', page, { name: 'Desktop', width: 1440, height: 900 })
    const write = expectDefined(
      ALL_TOOLS.find((tool) => tool.name === 'write_html'),
      'write_html'
    )
    const result = await write.execute(figma, {
      parent_id: frame.id,
      html: '<!-- style: Warm Organic | reason: a bakery | palette: #f4ede1 / #2b2118 / #b5532b --><section><h1>Grain</h1></section>'
    })
    const recorded = {
      style: 'Warm Organic',
      reason: 'a bakery',
      palette: '#f4ede1 / #2b2118 / #b5532b'
    }
    expect(result).toMatchObject({ style_recorded: recorded })
    expect(readDesignStyle(graph, page)).toEqual(recorded)

    const readStyle = expectDefined(
      ALL_TOOLS.find((tool) => tool.name === 'read_style'),
      'read_style'
    )
    expect(await readStyle.execute(figma, {})).toMatchObject({ recorded, style: 'warm-organic' })
  })

  it('records only on pages', () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0].id
    const frame = graph.createNode('FRAME', page, {})
    recordDesignStyle(graph, frame.id, { style: 'Bento' })
    expect(readDesignStyle(graph, frame.id)).toBeNull()
    expect(readDesignStyle(graph, page)).toBeNull()
  })
})
