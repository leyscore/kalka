import { describe, expect, test } from 'bun:test'

import { AI_DONE_DURATION_MS, AI_PULSE_PERIOD_MS } from '@kalka/core/constants'
import { SceneGraph } from '@kalka/scene-graph'

import { aiMarksLayer } from '#vue/canvas/svg-overlay/layers/ai-marks'
import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'

function setup() {
  const graph = new SceneGraph()
  const box = graph.createNode('FRAME', graph.getPages()[0].id, { x: 10, y: 10, width: 100, height: 50 })
  const context: OverlayContext = {
    graph,
    view: { panX: 0, panY: 0, zoom: 1 },
    overlays: {},
    selectedIds: new Set(),
    measureText: () => 0
  }
  return { box, context }
}

describe('AI activity marks', () => {
  test('a layer an agent works on pulses around its box', () => {
    const { box, context } = setup()
    const low = aiMarksLayer(context, { active: [box.id], done: [] }, (AI_PULSE_PERIOD_MS * 3) / 4)
    const high = aiMarksLayer(context, { active: [box.id], done: [] }, AI_PULSE_PERIOD_MS / 4)
    expect(low).toHaveLength(1)
    expect(low[0].type === 'rect' && high[0].type === 'rect' && low[0].stroke !== high[0].stroke).toBe(true)
  })

  test('a finished layer glows once, then the mark is gone', () => {
    const { box, context } = setup()
    const done = [{ nodeId: box.id, startTime: 0 }]
    expect(aiMarksLayer(context, { active: [], done }, AI_DONE_DURATION_MS / 2)).toHaveLength(1)
    expect(aiMarksLayer(context, { active: [], done }, AI_DONE_DURATION_MS + 1)).toHaveLength(0)
  })
})
