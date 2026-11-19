import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import {
  agentSkeletonsLayer,
  BREATH_MS,
  skeletonLive,
  skeletonOpacity,
  type AgentSkeleton
} from '#vue/canvas/svg-overlay/layers/agent-skeletons'
import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'

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
  return { card, context }
}

const block = (nodeId: string, from = 1000, until = 1300, fade = 300): AgentSkeleton => ({
  key: nodeId,
  nodeId,
  from,
  until,
  fade
})

describe('skeletons where agents work is loading', () => {
  test('a block shows, holds while it loads, and fades as its content appears', () => {
    const loading = block('card')
    expect(skeletonOpacity(loading, 999)).toBe(0)
    expect(skeletonOpacity(loading, 1250)).toBe(1)
    const fading = skeletonOpacity(loading, 1450)
    expect(fading).toBeGreaterThan(0)
    expect(fading).toBeLessThan(1)
    expect(skeletonLive(loading, 1600)).toBe(false)
  })

  test("it covers its layer's box on screen, rounded, and breathes", () => {
    const { card, context } = setup()
    const at = (now: number) => agentSkeletonsLayer(context, [block(card.id)], { now })[0]
    expect(at(1250)).toMatchObject({ type: 'rect', x: 25, y: 40, width: 200, height: 100 })
    expect(at(1250)?.type === 'rect' && (at(1250) as { rx?: number }).rx).toBeGreaterThan(0)
    const fill = (now: number) => {
      const shape = at(now)
      return shape?.type === 'rect' ? shape.fill : undefined
    }
    expect(fill(1250)).not.toBe(fill(1250 + BREATH_MS / 4))
  })

  test('it holds still when motion is reduced', () => {
    const { card, context } = setup()
    const still = (now: number) =>
      agentSkeletonsLayer(context, [block(card.id, 0, 10_000)], {
        now,
        still: true
      })
    expect(still(500)).toEqual(still(500 + BREATH_MS / 4))
  })

  test('blocks not shown yet, finished, or of layers that are gone draw nothing', () => {
    const { card, context } = setup()
    expect(agentSkeletonsLayer(context, [block(card.id, 5000, 6000)], { now: 1000 })).toEqual([])
    expect(agentSkeletonsLayer(context, [block(card.id, 0, 10)], { now: 5000 })).toEqual([])
    expect(agentSkeletonsLayer(context, [block('missing')], { now: 1100 })).toEqual([])
  })
})
