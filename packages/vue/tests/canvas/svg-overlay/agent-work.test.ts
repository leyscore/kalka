import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import {
  agentWorkLayer,
  LOADER_STEP_MS,
  MAX_DRAWN_WORK_MARKS,
  type AgentWorkMark
} from '#vue/canvas/svg-overlay/layers/agent-work'
import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'

const color = { r: 0.2, g: 0.4, b: 1, a: 1 }

function setup() {
  const graph = new SceneGraph()
  const pageId = graph.getPages()[0].id
  const hero = graph.createNode('FRAME', pageId, { x: 10, y: 40, width: 200, height: 100 })
  const dot = graph.createNode('ELLIPSE', pageId, { x: 300, y: 40, width: 8, height: 8 })
  const context: OverlayContext = {
    graph,
    view: { panX: 0, panY: 0, zoom: 1 },
    overlays: {},
    selectedIds: new Set(),
    measureText: (text, fontSize) => text.length * fontSize * 0.5
  }
  return { graph, hero, dot, context }
}

const mark = (nodeId: string, name = 'Fern'): AgentWorkMark => ({ nodeId, name, color })

describe('layers agents are building', () => {
  test('get a dashed outline and a tag with the agent name above their top-right corner', () => {
    const { hero, context } = setup()
    const shapes = agentWorkLayer(context, [mark(hero.id)])
    const outline = shapes.find((shape) => shape.type === 'polygon')
    expect(outline).toMatchObject({ dash: [4, 3], points: [10, 40, 210, 40, 210, 140, 10, 140] })
    const tag = shapes.find((shape) => shape.type === 'rect')
    const text = shapes.find((shape) => shape.type === 'text')
    expect(text).toMatchObject({ text: 'Fern' })
    expect(tag?.type === 'rect' && tag.x + tag.width).toBe(210)
    expect(tag?.type === 'rect' && tag.y + tag.height).toBeLessThan(40)
  })

  test('a small layer keeps its outline without a tag', () => {
    const { dot, context } = setup()
    const shapes = agentWorkLayer(context, [mark(dot.id)])
    expect(shapes.map((shape) => shape.type)).toEqual(['polygon'])
  })

  test('layers that are gone draw nothing, and a crowd is bounded', () => {
    const { graph, context } = setup()
    expect(agentWorkLayer(context, [mark('missing')])).toEqual([])
    const pageId = graph.getPages()[0].id
    const many = Array.from({ length: MAX_DRAWN_WORK_MARKS + 10 }, (_, index) =>
      mark(graph.createNode('RECTANGLE', pageId, { x: index, width: 4, height: 4 }).id)
    )
    expect(agentWorkLayer(context, many)).toHaveLength(MAX_DRAWN_WORK_MARKS)
  })

  test('where the agent works now, its tag carries a pixel loader that steps as time passes', () => {
    const { hero, context } = setup()
    const busy = { ...mark(hero.id), busy: true }
    const pixels = (now: number) =>
      agentWorkLayer(context, [busy], { now }).filter(
        (shape) => shape.type === 'rect' && shape.width < 4
      )
    expect(pixels(0)).toHaveLength(9)
    expect(pixels(LOADER_STEP_MS)).not.toEqual(pixels(0))
    // Reduced motion holds it still.
    expect(agentWorkLayer(context, [busy], { now: 0, still: true })).toEqual(
      agentWorkLayer(context, [busy], { now: LOADER_STEP_MS, still: true })
    )
    // The tag makes room for it, still ending at the layer's right edge.
    const tag = agentWorkLayer(context, [busy]).find((shape) => shape.type === 'rect')
    const plain = agentWorkLayer(context, [mark(hero.id)]).find((shape) => shape.type === 'rect')
    expect(tag?.type === 'rect' && plain?.type === 'rect' && tag.width > plain.width).toBe(true)
    expect(tag?.type === 'rect' && tag.x + tag.width).toBe(210)
  })

  test('a small layer the agent works in now is still tagged, so its loader shows', () => {
    const { dot, context } = setup()
    const shapes = agentWorkLayer(context, [{ ...mark(dot.id), busy: true }])
    expect(shapes.some((shape) => shape.type === 'text')).toBe(true)
  })
})
