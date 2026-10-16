import { describe, expect, test } from 'bun:test'

import { FigmaAPI } from '@kalka/core/figma-api'
import { SceneGraph } from '@kalka/scene-graph'

function setup() {
  const graph = new SceneGraph()
  const page = graph.getPages()[0]
  const card = graph.createNode('FRAME', page.id, {
    name: 'Card',
    width: 200,
    height: 100,
    layoutMode: 'VERTICAL',
    itemSpacing: 8,
    style: { width: '50%', 'border-radius': '1rem', cursor: 'pointer' }
  })
  const figma = new FigmaAPI(graph)
  const proxy = figma.getNodeById(card.id)
  if (!proxy) throw new Error('No proxy')
  return { card, proxy }
}

describe('the plugin API and a layer’s CSS', () => {
  test('getCSSAsync gives the CSS the layer is drawn with', async () => {
    const { proxy } = setup()
    expect(await proxy.getCSSAsync()).toMatchObject({
      display: 'flex',
      'flex-direction': 'column',
      gap: '8px',
      width: '50%',
      'border-radius': '1rem',
      cursor: 'pointer'
    })
  })

  test('setting a field lets the CSS written for it give way, and only that', async () => {
    const { card, proxy } = setup()
    proxy.opacity = 0.5
    expect(card.style).toEqual({ width: '50%', 'border-radius': '1rem', cursor: 'pointer' })

    proxy.cornerRadius = 6
    expect(card.style).toEqual({ width: '50%', cursor: 'pointer' })

    proxy.resize(320, 100)
    expect(card.style).toEqual({ cursor: 'pointer' })
    expect(await proxy.getCSSAsync()).toMatchObject({
      width: '320px',
      'border-radius': '6px',
      opacity: '0.5',
      cursor: 'pointer'
    })
  })
})
