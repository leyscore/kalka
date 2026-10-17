import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import { PatternUsers } from '#vue/canvas/dom-scene/patterns'

function setup() {
  const graph = new SceneGraph()
  const page = graph.getPages()[0].id
  const source = graph.createNode('FRAME', page, { width: 10, height: 10, visible: false })
  const inside = graph.createNode('ELLIPSE', source.id, { width: 4, height: 4 })
  const other = graph.createNode('RECTANGLE', page, { width: 10, height: 10 })
  const filled = graph.createNode('RECTANGLE', page, {
    width: 100,
    height: 100,
    fills: [
      {
        type: 'PATTERN',
        sourceNodeId: source.id,
        color: { r: 0, g: 0, b: 0, a: 1 },
        opacity: 1,
        visible: true
      }
    ]
  })
  const users = new PatternUsers()
  users.record(graph, filled)
  users.record(graph, other)
  return { graph, source, inside, other, filled, users }
}

describe('pattern users on the DOM canvas', () => {
  test('a change to a source or a layer inside it redraws the layers it fills', () => {
    const { graph, source, inside, filled, users } = setup()
    expect(users.affectedBy(graph, source)).toEqual([filled.id])
    expect(users.affectedBy(graph, inside)).toEqual([filled.id])
  })

  test('other layers redraw nothing else', () => {
    const { graph, source, other, filled, users } = setup()
    expect(users.affectedBy(graph, other)).toEqual([])
    expect(users.affectedBy(graph, filled)).toEqual([])
    users.clear()
    expect(users.affectedBy(graph, source)).toEqual([])
  })
})
