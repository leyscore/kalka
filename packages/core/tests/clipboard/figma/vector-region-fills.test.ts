import { beforeAll, expect, test } from 'bun:test'

import { expectDefined } from '#core-tests/helpers/assert'
import { readFixtureBytes } from '#core-tests/helpers/fig/fixtures'

import { buildFigmaClipboardHTML, importClipboardNodes } from '@kalka/core/clipboard'
import { parseFigmaClipboard } from '@kalka/fig/clipboard'
import { initCodec } from '@kalka/kiwi/fig/codec'
import { SceneGraph, type SceneNode } from '@kalka/scene-graph'

/**
 * A vector as Figma copies it, with three regions: red of its own, the layer's grey, and an empty
 * fill list. Figma's copy writes no fill geometry, so the regions alone carry their paints.
 */
const FIXTURE = 'clipboard/vector-region-fills.html'

async function pasted(html: string): Promise<{ graph: SceneGraph; vector: SceneNode }> {
  const parsed = expectDefined(await parseFigmaClipboard(html))
  const graph = new SceneGraph()
  importClipboardNodes(parsed.nodes, graph, graph.getPages()[0].id, 0, 0, parsed.blobs)
  const vector = expectDefined([...graph.nodes.values()].find((node) => node.type === 'VECTOR'))
  return { graph, vector }
}

const regionColors = (vector: SceneNode) =>
  vector.vectorNetwork?.regions.map((region) => region.fills?.map((fill) => fill.color))

beforeAll(initCodec)

test("a pasted vector keeps each region's own paints and draws them", async () => {
  const { vector } = await pasted(new TextDecoder().decode(readFixtureBytes(FIXTURE)))
  const red = [{ r: 1, g: 0, b: 0, a: 1 }]
  expect(regionColors(vector)).toEqual([red, undefined, []])
  expect(vector.fills[0]?.color).toEqual({ r: 0.5, g: 0.5, b: 0.5, a: 1 })
  expect(vector.fillGeometry.map((geometry) => geometry.fills?.map((fill) => fill.color))).toEqual([
    red,
    undefined,
    []
  ])
})

test('region paints survive our own copy and paste', async () => {
  const { graph, vector } = await pasted(new TextDecoder().decode(readFixtureBytes(FIXTURE)))
  const html = expectDefined(await buildFigmaClipboardHTML([vector], graph))
  const again = (await pasted(html)).vector
  expect(again.fillGeometry.map((geometry) => geometry.fills?.map((fill) => fill.color))).toEqual(
    vector.fillGeometry.map((geometry) => geometry.fills?.map((fill) => fill.color))
  )
})
