import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import {
  agentTracesLayer,
  TRACE_FADE_MS,
  TRACE_LEAD_MS,
  traceLive,
  traceOpacity,
  type AgentTrace
} from '#vue/canvas/svg-overlay/layers/agent-traces'
import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'

const color = { r: 0.85, g: 0.47, b: 0.34, a: 1 }

function setup() {
  const graph = new SceneGraph()
  const pageId = graph.getPages()[0].id
  const card = graph.createNode('FRAME', pageId, { x: 10, y: 20, width: 100, height: 50 })
  const context: OverlayContext = {
    graph,
    view: { panX: 5, panY: 0, zoom: 2 },
    overlays: {},
    selectedIds: new Set(),
    measureText: (text, fontSize) => text.length * fontSize * 0.5
  }
  return { graph, card, context }
}

const trace = (nodeId: string, start = 1000, duration = 300): AgentTrace => ({
  nodeId,
  color,
  start,
  duration
})

describe("frames around the layers an agent's edit reveals", () => {
  test('a frame shows just before its layer appears, holds while it does, then fades', () => {
    const framed = trace('card')
    expect(traceOpacity(framed, framed.start - TRACE_LEAD_MS - 1)).toBe(0)
    expect(traceOpacity(framed, framed.start)).toBe(1)
    expect(traceOpacity(framed, framed.start + framed.duration)).toBe(1)
    const fading = traceOpacity(framed, framed.start + framed.duration + TRACE_FADE_MS / 2)
    expect(fading).toBeGreaterThan(0)
    expect(fading).toBeLessThan(1)
    expect(traceLive(framed, framed.start + framed.duration + TRACE_FADE_MS)).toBe(false)
  })

  test("it outlines the layer's box on screen in the agent's color", () => {
    const { card, context } = setup()
    const [shape] = agentTracesLayer(context, [trace(card.id)], 1100)
    expect(shape).toMatchObject({
      type: 'polygon',
      points: [25, 40, 225, 40, 225, 140, 25, 140],
      opacity: 1
    })
  })

  test('frames not shown yet, finished, or of layers that are gone draw nothing', () => {
    const { card, context } = setup()
    expect(agentTracesLayer(context, [trace(card.id, 5000)], 1000)).toEqual([])
    expect(agentTracesLayer(context, [trace(card.id, 0)], 5000)).toEqual([])
    expect(agentTracesLayer(context, [trace('missing')], 1100)).toEqual([])
  })
})
