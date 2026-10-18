import { describe, expect, test } from 'bun:test'

import { computeAllLayouts, SceneGraph } from '@kalka/core'

/**
 * A fixed frame whose padding is longer than the frame, as captures of scrolling tickers save:
 * Figma keeps the frame's size and places the content where the padding puts it, outside the box.
 */
function ticker(counterAxisAlign: 'MIN' | 'CENTER' | 'MAX') {
  const graph = new SceneGraph()
  const frame = graph.createNode('FRAME', graph.getPages()[0].id, {
    layoutMode: 'HORIZONTAL',
    width: 200,
    height: 100,
    primaryAxisSizing: 'FIXED',
    counterAxisSizing: 'FIXED',
    counterAxisAlign,
    paddingTop: 300,
    paddingBottom: 20,
    paddingLeft: 10,
    clipsContent: true
  })
  const list = graph.createNode('FRAME', frame.id, { width: 50, height: 400 })
  const second = graph.createNode('FRAME', frame.id, { width: 50, height: 400 })
  return { graph, frame, list, second }
}

describe('padding longer than a fixed frame', () => {
  test('keeps the frame its size', () => {
    const { graph, frame } = ticker('MIN')

    computeAllLayouts(graph)

    expect(frame.width).toBe(200)
    expect(frame.height).toBe(100)
  })

  test('places the content after the padding', () => {
    const { graph, list, second } = ticker('MIN')

    computeAllLayouts(graph)

    expect(list.y).toBe(300)
    expect(list.x).toBe(10)
    expect(second.x).toBe(60)
  })

  test('centers the content between the paddings', () => {
    const { graph, list } = ticker('CENTER')

    computeAllLayouts(graph)

    // Between 300 and 100 - 20, a 400 tall layer centers at -10.
    expect(list.y).toBe(-10)
  })

  test('ends the content at the end padding', () => {
    const { graph, list } = ticker('MAX')

    computeAllLayouts(graph)

    expect(list.y).toBe(100 - 20 - 400)
  })
})
