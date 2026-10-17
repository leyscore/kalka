import { describe, expect, test } from 'bun:test'

import { SceneGraph, type Stroke } from '@kalka/scene-graph'

import { artboardInk } from '#vue/canvas/dom-scene/frame'

const stroke = (weight: number, align: Stroke['align']): Stroke => ({
  type: 'SOLID',
  color: { r: 0, g: 0, b: 0, a: 1 },
  weight,
  visible: true,
  opacity: 1,
  align
})

function graphWithPage() {
  const graph = new SceneGraph()
  return { graph, pageId: graph.getPages()[0].id }
}

describe('artboard ink', () => {
  test('reaches as far as a centred stroke and a drop shadow draw past the box', () => {
    const { graph, pageId } = graphWithPage()
    const card = graph.createNode('RECTANGLE', pageId, {
      width: 100,
      height: 50,
      strokes: [stroke(10, 'CENTER')],
      effects: [
        {
          type: 'DROP_SHADOW',
          color: { r: 0, g: 0, b: 0, a: 0.25 },
          offset: { x: 0, y: 8 },
          radius: 4,
          spread: 0,
          visible: true,
          blendMode: 'NORMAL'
        }
      ]
    })
    const ink = artboardInk(graph, card)
    expect(ink.left).toBe(9)
    expect(ink.top).toBe(9)
    expect(ink.bottom).toBe(17)
  })

  test('a line, which has no height, reaches as far as its stroke and arrowheads', () => {
    const { graph, pageId } = graphWithPage()
    const line = graph.createNode('LINE', pageId, {
      width: 200,
      height: 0,
      strokeCap: 'ARROW_EQUILATERAL',
      strokes: [stroke(4, 'CENTER')]
    })
    const ink = artboardInk(graph, line)
    expect(ink.top).toBeGreaterThanOrEqual(8)
    expect(ink.left).toBeGreaterThanOrEqual(8)
  })

  test('a turned line reaches where it turns to, about where it starts', () => {
    const { graph, pageId } = graphWithPage()
    const line = graph.createNode('LINE', pageId, {
      width: 100,
      height: 0,
      rotation: 90,
      strokes: [stroke(2, 'CENTER')]
    })
    // Turned a quarter about its start, it runs down from it, not across its old center.
    expect(artboardInk(graph, line).bottom).toBeGreaterThanOrEqual(100)
  })

  test('an inside stroke stays in the box, and a clipping frame does not reach for its children', () => {
    const { graph, pageId } = graphWithPage()
    const frame = graph.createNode('FRAME', pageId, {
      width: 100,
      height: 100,
      clipsContent: true,
      strokes: [stroke(6, 'INSIDE')]
    })
    graph.createNode('RECTANGLE', frame.id, { x: 80, y: 80, width: 100, height: 100 })
    expect(artboardInk(graph, frame)).toEqual({ top: 0, right: 0, bottom: 0, left: 0 })

    graph.updateNode(frame.id, { clipsContent: false })
    expect(artboardInk(graph, graph.getNode(frame.id) ?? frame).right).toBe(80)
  })
})
