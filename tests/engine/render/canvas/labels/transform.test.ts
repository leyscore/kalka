import { expect, test } from 'bun:test'

import type { Font } from 'canvaskit-wasm'

import { SceneGraph } from '@open-pencil/scene-graph'

import { LabelCache } from '#core/canvas/labels/cache'
import { hitTestSectionTitle, hitTestFrameTitle } from '#core/canvas/labels/hit-test'
import { labelTransform } from '#core/canvas/labels/transform'
import { createSceneGeometry } from '#core/geometry'

import { expectDefined } from '#tests/helpers/assert'

function fixture() {
  const graph = new SceneGraph()
  const page = expectDefined(graph.getPages()[0], 'page')
  const section = graph.createNode('SECTION', page.id, {
    name: 'Section',
    x: 100,
    y: 100,
    width: 200,
    height: 100
  })
  const frame = graph.createNode('FRAME', section.id, {
    name: 'Frame',
    x: 20,
    y: 30,
    width: 80,
    height: 40
  })
  return { graph, page, section, frame }
}

const font = {
  getGlyphIDs(text: string) {
    return Uint16Array.from([...text].map((_, i) => i))
  },
  getGlyphWidths(ids: Uint16Array) {
    return new Float32Array(ids.length).fill(8)
  }
} as Font

test('label origins and edge anchors include a live ancestor rotation without mutating nodes', () => {
  const { graph, section, frame } = fixture()
  const preview = { nodeId: section.id, angle: 90 }
  const title = labelTransform(frame, graph, preview)
  expect(title.x).toBeCloseTo(220)
  expect(title.y).toBeCloseTo(70)
  expect(title.rotation).toBe(90)
  const bottom = labelTransform(frame, graph, preview, { x: frame.width / 2, y: frame.height })
  expect(bottom.x).toBeCloseTo(180)
  expect(bottom.y).toBeCloseTo(110)
  expect(section.rotation).toBe(0)
  expect(frame.rotation).toBe(0)
  const bounds = createSceneGeometry(graph, preview).bounds(frame)
  graph.updateNode(section.id, { rotation: 90 })
  expect(labelTransform(frame, graph, null)).toEqual(title)
  expect(createSceneGeometry(graph, null).bounds(frame)).toEqual(bounds)
})

test('section culling uses preview world bounds rather than cached unrotated coordinates', () => {
  const { graph, page, section } = fixture()
  const cache = new LabelCache()
  cache.update(graph, page.id, 1)
  const viewport = { x: 215, y: 65, w: 10, h: 10 }
  expect(cache.getSections(graph, viewport)).toHaveLength(0)
  expect(
    cache.getSections(graph, viewport, { nodeId: section.id, angle: 90 }).map(({ node }) => node.id)
  ).toEqual([section.id])
})

test('section and nested frame hit targets follow their rendered title transforms', () => {
  const { graph, page, section, frame } = fixture()
  graph.updateNode(section.id, { rotation: 90 })
  const cache = new LabelCache()
  cache.update(graph, page.id, 1)
  // Section title local point (4, -10), transformed through its top-left (250, 50).
  for (const catalog of [undefined, cache]) {
    expect(hitTestSectionTitle(graph, 260, 54, 1, page.id, font, catalog)?.id).toBe(section.id)
  }
  // Nested frame title local point (4, -10), through (220, 70) at 90 degrees.
  expect(hitTestFrameTitle(graph, 230, 74, 1, new Set([frame.id]), font)?.id).toBe(frame.id)
})
