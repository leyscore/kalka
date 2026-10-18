import { beforeAll, expect, test } from 'bun:test'

import { exportFigFile, parseFigFile } from '@kalka/core/io'
import { initCodec } from '@kalka/core/kiwi'
import { SceneGraph, type InterVersion } from '@kalka/scene-graph'

beforeAll(async () => {
  await initCodec()
})

async function reopened(interVersion: InterVersion): Promise<SceneGraph> {
  const graph = new SceneGraph()
  graph.interVersion = interVersion
  graph.createNode('TEXT', graph.getPages()[0].id, { text: 'Working', fontFamily: 'Inter' })
  return parseFigFile((await exportFigFile(graph)).slice().buffer)
}

test('a .fig written from a document made in Kalka opens with its Inter 4', async () => {
  expect((await reopened('4')).interVersion).toBe('4')
})

test("a .fig written from a document from Figma opens with Figma's Inter", async () => {
  expect((await reopened('3.19')).interVersion).toBe('3.19')
})
