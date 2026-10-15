import { expect, test } from 'bun:test'

import { sceneNodeToDesignDocument } from '@open-pencil/dom-css/export'
import { SceneGraph } from '@open-pencil/scene-graph'

test('text with a gradient fill paints its letters with the gradient', () => {
  const graph = new SceneGraph()
  const text = graph.createNode('TEXT', graph.getPages()[0].id, {
    text: 'Gradient words',
    width: 300,
    height: 60,
    fills: [
      {
        type: 'GRADIENT_LINEAR',
        color: { r: 0.55, g: 0.36, b: 0.96, a: 1 },
        opacity: 1,
        visible: true,
        gradientStops: [
          { color: { r: 0.55, g: 0.36, b: 0.96, a: 1 }, position: 0 },
          { color: { r: 0.93, g: 0.28, b: 0.6, a: 1 }, position: 1 }
        ],
        gradientTransform: { m00: 1, m01: 0, m02: 0, m10: 0, m11: 1, m12: 0.5 }
      }
    ]
  })
  const [element] = sceneNodeToDesignDocument(graph, text.id).children
  const style: Record<string, string> = element.type === 'element' ? { ...element.inlineStyle } : {}
  expect(style).toMatchObject({ 'background-clip': 'text', color: 'transparent' })
  expect(Object.values(style).some((value) => value.startsWith('linear-gradient(90deg'))).toBe(true)
})
