import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'
import { colorToFill } from '@kalka/scene-graph/color'

import {
  backdropTone,
  SKELETON_GRID,
  skeletonLive,
  skeletonOpacity,
  skeletonSparks,
  type AgentSkeleton
} from '@/app/presence/skeletons'

const block: AgentSkeleton = { key: 'card', nodeId: 'card', from: 1000, until: 1400, fade: 300 }

describe("an agent's skeleton", () => {
  test('shows, holds while its content loads, and fades as the content appears', () => {
    expect(skeletonOpacity(block, 999)).toBe(0)
    expect(skeletonOpacity(block, 1300)).toBe(1)
    const fading = skeletonOpacity(block, 1550)
    expect(fading).toBeGreaterThan(0)
    expect(fading).toBeLessThan(1)
    expect(skeletonOpacity(block, 1700)).toBe(0)
  })

  test('is live until it has faded', () => {
    expect(skeletonLive(block, 500)).toBe(true)
    expect(skeletonLive(block, 1650)).toBe(true)
    expect(skeletonLive(block, 1700)).toBe(false)
  })
})

describe('the tone of what a skeleton sits on', () => {
  const dark = { r: 0.1, g: 0.1, b: 0.1, a: 1 }
  const light = { r: 0.96, g: 0.96, b: 0.94, a: 1 }

  test('is the nearest fill holding the layer, else the canvas', () => {
    const graph = new SceneGraph()
    const pageId = graph.getPages()[0].id
    const page = graph.createNode('FRAME', pageId, { fills: [colorToFill(light)] })
    const hero = graph.createNode('FRAME', page.id, {
      fills: [colorToFill({ r: 0.1, g: 0.2, b: 0.5, a: 1 })]
    })
    const row = graph.createNode('FRAME', hero.id, { fills: [] })
    const button = graph.createNode('FRAME', row.id)
    expect(backdropTone(graph, page.id, dark)).toBe('dark')
    expect(backdropTone(graph, page.id, light)).toBe('light')
    expect(backdropTone(graph, hero.id, dark)).toBe('light')
    // A layer without a fill lets the one behind it show.
    expect(backdropTone(graph, button.id, light)).toBe('dark')
  })
})

describe('where a skeleton twinkles', () => {
  test('in a few patches on the dot grid, inside the middle of the block', () => {
    const sparks = skeletonSparks('card', 360, 180)
    expect(sparks.length).toBeGreaterThanOrEqual(2)
    for (const spark of sparks) {
      expect(spark.left % SKELETON_GRID).toBe(0)
      expect(spark.top % SKELETON_GRID).toBe(0)
      expect(spark.left).toBeGreaterThanOrEqual(360 * 0.2 - SKELETON_GRID)
      expect(spark.left).toBeLessThanOrEqual(360 * 0.8)
      expect(spark.top).toBeGreaterThanOrEqual(180 * 0.2 - SKELETON_GRID)
      expect(spark.top).toBeLessThanOrEqual(180 * 0.8)
      expect(spark.delay).toBeLessThanOrEqual(0)
    }
  })

  test('the same way each time for the same block, and differently for another', () => {
    expect(skeletonSparks('card', 360, 180)).toEqual(skeletonSparks('card', 360, 180))
    expect(skeletonSparks('card', 360, 180)).not.toEqual(skeletonSparks('hero', 360, 180))
  })

  test('more on a large block than on a small one, within bounds', () => {
    expect(skeletonSparks('a', 40, 40)).toHaveLength(2)
    expect(skeletonSparks('a', 900, 600).length).toBeGreaterThan(
      skeletonSparks('a', 300, 200).length
    )
  })
})
