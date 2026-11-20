import { describe, expect, test } from 'bun:test'

import { renderNodesToHTML } from '@kalka/core'
import { SceneGraph, type Fill } from '@kalka/scene-graph'

const gray: Fill = {
  type: 'SOLID',
  color: { r: 0.85, g: 0.85, b: 0.85, a: 1 },
  opacity: 1,
  visible: true
}

async function rootRule(graph: SceneGraph, id: string): Promise<string> {
  const { html, assets } = await renderNodesToHTML(graph, [id], {
    html: 'standalone',
    pretty: true
  })
  const css = [html, ...assets.map((asset) => String(asset.content))].join('\n')
  const rule = /\.f\s*\{[^}]*\}/.exec(css)
  return rule?.[0] ?? ''
}

describe('HTML export placement', () => {
  test('a frame inside a section is drawn at the page origin, as a top-level frame is', async () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0]
    const section = graph.createNode('SECTION', page.id, { width: 400, height: 300 })
    const frame = graph.createNode('FRAME', section.id, {
      name: 'F',
      x: 100,
      y: 50,
      width: 200,
      height: 100,
      fills: [gray]
    })
    graph.createNode('RECTANGLE', frame.id, { x: 10, y: 10, width: 40, height: 40 })

    const rule = await rootRule(graph, frame.id)
    expect(rule).not.toContain('left:')
    expect(rule).not.toContain('top:')
    expect(rule).toContain('position: relative')
  })

  test('a layer exported from inside a frame keeps no offset from that frame', async () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0]
    const outer = graph.createNode('FRAME', page.id, { width: 400, height: 300 })
    const frame = graph.createNode('FRAME', outer.id, {
      name: 'F',
      x: 30,
      y: 20,
      width: 100,
      height: 100,
      fills: [gray]
    })

    const rule = await rootRule(graph, frame.id)
    expect(rule).not.toContain('left:')
    expect(rule).not.toContain('top:')
  })
})
