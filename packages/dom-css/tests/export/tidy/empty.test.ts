import { describe, expect, test } from 'bun:test'

import { exportHTMLBundle, sceneNodeToDesignDocument } from '#dom-css/export/index'

import { SceneGraph, type Stroke } from '@kalka/scene-graph'

function stroke(align: Stroke['align']): Stroke {
  return {
    type: 'SOLID',
    color: { r: 0, g: 0, b: 0, a: 1 },
    opacity: 1,
    visible: true,
    weight: 4,
    align
  }
}

/** A frame holding a square and a rectangle of no size with a stroke aligned `align`. */
async function page(align: Stroke['align'], includeSourceIds = false) {
  const graph = new SceneGraph()
  const frame = graph.createNode('FRAME', graph.getPages()[0].id, { width: 200, height: 100 })
  graph.createNode('RECTANGLE', frame.id, { name: 'Square', x: 150, y: 60, width: 32, height: 32 })
  graph.createNode('RECTANGLE', frame.id, {
    name: 'Leftover',
    x: 20,
    y: 20,
    width: 0,
    height: 0,
    cornerRadius: 30,
    strokes: [stroke(align)]
  })
  const document = sceneNodeToDesignDocument(graph, frame.id, { includeSourceIds })
  return String((await exportHTMLBundle(document, { shareStyles: false })).files[0]?.content)
}

describe('a layer of no size', () => {
  test('is left out when its stroke is inside its edge, which draws nothing', async () => {
    const html = await page('INSIDE')
    expect(html).not.toContain('outline')
    expect(html.match(/<div/g)).toHaveLength(2)
  })

  test('stays when its stroke is outside its edge, which draws a dot', async () => {
    const html = await page('OUTSIDE')
    expect(html).toContain('outline: 4px solid #000000')
    expect(html.match(/<div/g)).toHaveLength(3)
  })

  test('stays for a caller mapping the markup back to layers', async () => {
    const html = await page('INSIDE', true)
    expect(html.match(/data-kalka-node-id=/g)).toHaveLength(3)
  })
})
