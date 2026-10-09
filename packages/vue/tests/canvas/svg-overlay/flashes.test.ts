import { describe, expect, test } from 'bun:test'

import { FLASH_COLOR } from '@open-pencil/core/constants'
import { SceneGraph } from '@open-pencil/scene-graph'

import {
  FLASH_DURATION_MS,
  flashesLayer,
  liveFlashes
} from '#vue/canvas/svg-overlay/layers/flashes'
import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import { css } from '#vue/canvas/svg-overlay/shapes'

const BLUE = FLASH_COLOR

function context(graph: SceneGraph, patch: Partial<OverlayContext> = {}): OverlayContext {
  return {
    graph,
    view: { panX: 10, panY: 20, zoom: 2 },
    overlays: {},
    selectedIds: new Set(),
    measureText: (text) => text.length * 6,
    ...patch
  }
}

function setup(rotation = 0) {
  const graph = new SceneGraph()
  const page = graph.getPages()[0].id
  const frame = graph.createNode('FRAME', page, {
    x: 100,
    y: 50,
    width: 200,
    height: 120,
    rotation
  })
  return { graph, frame }
}

describe('SVG flashes', () => {
  test('holds a padded ring around the layer at full opacity', () => {
    const { graph, frame } = setup()
    const [ring] = flashesLayer(context(graph), [{ nodeId: frame.id, startTime: 0 }], 300)
    expect(ring).toEqual({
      type: 'rect',
      x: 205,
      y: 115,
      width: 410,
      height: 250,
      rx: 4,
      stroke: css(BLUE, 1),
      strokeWidth: 2
    })
  })

  test('starts transparent and wide, then fades out after the hold', () => {
    const { graph, frame } = setup()
    const flashes = [{ nodeId: frame.id, startTime: 1000 }]
    const [start] = flashesLayer(context(graph), flashes, 1000)
    expect(start).toMatchObject({ x: 175, stroke: css(BLUE, 0) })
    const [release] = flashesLayer(context(graph), flashes, 1000 + 600 + 150)
    expect(release).toMatchObject({ x: 205, stroke: css(BLUE, 0.75) })
    expect(flashesLayer(context(graph), flashes, 1000 + FLASH_DURATION_MS + 1)).toEqual([])
  })

  test('a rotated layer turns its ring about the layer center', () => {
    const { graph, frame } = setup(90)
    const [group] = flashesLayer(context(graph), [{ nodeId: frame.id, startTime: 0 }], 300)
    expect(group.type).toBe('group')
  })

  test('drops finished flashes and flashes on deleted layers', () => {
    const { graph, frame } = setup()
    const flashes = [
      { nodeId: frame.id, startTime: 0 },
      { nodeId: frame.id, startTime: -FLASH_DURATION_MS - 1 },
      { nodeId: 'missing', startTime: 0 }
    ]
    expect(liveFlashes(graph, flashes, 0)).toEqual([flashes[0]])
    expect(flashesLayer(context(graph), flashes, 0)).toHaveLength(1)
  })
})
