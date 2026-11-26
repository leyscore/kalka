import { describe, expect, test } from 'bun:test'

import { jsxNodeFields, parseJSXAttributes, sceneNodeToJSX } from '#design-jsx/index'

import { SceneGraph } from '@kalka/scene-graph'

function fields(attributes: string) {
  const graph = new SceneGraph()
  return jsxNodeFields(graph, 'LINE', parseJSXAttributes(attributes), graph.getPages()[0].id).fields
}

describe('the stroke width profile and brush props', () => {
  test('read widths on both sides or one, and a brush with its settings', () => {
    const read = fields(
      'strokeWidthProfile={[{ position: 1, width: 0.1 }, { position: 0, ascent: 1, descent: 0.5 }]} ' +
        'strokeBrush={{ type: "SCATTER", id: "stars", gap: 3 }}'
    )
    expect(read.strokeWidthProfile).toEqual([
      { position: 0, ascent: 1, descent: 0.5 },
      { position: 1, ascent: 0.05, descent: 0.05 }
    ])
    expect(read.strokeBrush).toMatchObject({ type: 'SCATTER', id: 'stars', gap: 3, seed: 1 })
  })

  test('export writes them back', () => {
    const graph = new SceneGraph()
    const line = graph.createNode('LINE', graph.getPages()[0].id, {
      width: 100,
      strokeWidthProfile: [
        { position: 0, ascent: 0.5, descent: 0.5 },
        { position: 1, ascent: 0.02, descent: 0.02 }
      ],
      strokeBrush: {
        type: 'STRETCH',
        id: 'ink',
        gap: 0,
        wiggle: 0,
        sizeJitter: 0,
        angularJitter: 0,
        rotation: 0,
        reverse: true,
        seed: 1
      }
    })
    const jsx = sceneNodeToJSX(line.id, graph)
    expect(jsx).toContain('strokeWidthProfile={[')
    expect(jsx).toContain('ascent: 0.02')
    expect(jsx).toContain('strokeBrush={{')
    expect(jsx).toContain('id: "ink"')
    expect(jsx).toContain('reverse: true')
  })
})
