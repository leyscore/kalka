import { describe, expect, test } from 'bun:test'

import { sceneNodeToDesignDocument, type DesignNode } from '@kalka/dom-css/export'
import { SceneGraph, type Stroke } from '@kalka/scene-graph'

function stroke(weight: number): Stroke {
  return {
    type: 'SOLID',
    color: { r: 0.5, g: 0.32, b: 0.51, a: 1 },
    opacity: 1,
    visible: true,
    weight,
    align: 'INSIDE',
    cap: 'NONE',
    join: 'MITER',
    dashPattern: []
  }
}

function cardStyle(weight: number, hairlineScale?: number | string) {
  const graph = new SceneGraph()
  const page = graph.getPages()[0]
  const frame = graph.createNode('FRAME', page.id, { name: 'Frame', width: 200, height: 200 })
  graph.createNode('RECTANGLE', frame.id, {
    name: 'Card',
    width: 100,
    height: 40,
    strokes: [stroke(weight)],
    strokeWeight: weight
  })
  const root: DesignNode | undefined = sceneNodeToDesignDocument(graph, frame.id, {
    hairlineScale
  }).children[0]
  const card = root?.type === 'element' ? root.children[0] : undefined
  return card?.type === 'element' ? (card.inlineStyle ?? {}) : {}
}

describe('strokes thinner than a device pixel', () => {
  test('draw as much colour as they cover, as Figma draws them, where the scale is known', () => {
    // A browser draws at least one device pixel of a stroke, at full colour.
    const style = cardStyle(0.25, 1)
    expect(style['outline-color']).toContain('color-mix(in srgb')
    expect(style['outline-color']).toContain('25%')
    // At four device pixels to the CSS pixel the stroke covers a whole one.
    expect(cardStyle(0.25, 4)['outline-color']).toBeUndefined()
  })

  test('follow a scale the page sets, such as the canvas zoom', () => {
    const style = cardStyle(0.5, 'var(--kalka-device-scale, 1)')
    expect(style['outline-color']).toContain('var(--kalka-device-scale, 1)')
  })

  test('stay as they are without a scale, and at a pixel or more', () => {
    expect(cardStyle(0.25)['outline-color']).toBeUndefined()
    expect(cardStyle(1, 1)['outline-color']).toBeUndefined()
  })
})
