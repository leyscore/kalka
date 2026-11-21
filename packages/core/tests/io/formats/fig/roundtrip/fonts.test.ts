import { beforeAll, expect, test } from 'bun:test'

import { exportFigFile, parseFigFile } from '@kalka/core/io'
import { initCodec } from '@kalka/core/kiwi'
import { SceneGraph } from '@kalka/scene-graph'

import { deserializeSceneGraph, serializeSceneGraph } from '#core/kiwi/fig/parse/transfer'
import { sampleProjectFont } from '#core-tests/helpers/project-fonts'

beforeAll(async () => {
  await initCodec()
})

function documentWithFont(): SceneGraph {
  const graph = new SceneGraph()
  graph.createNode('TEXT', graph.getPages()[0].id, { text: 'Hello', fontFamily: 'Inter Tight' })
  graph.setProjectFont(sampleProjectFont())
  return graph
}

test('a .fig written by Kalka opens with the fonts the document carries', async () => {
  const read = await parseFigFile((await exportFigFile(documentWithFont())).slice().buffer)
  expect(read.fonts.get('Inter Tight')).toEqual(sampleProjectFont())
})

test('a .fig without fonts opens with none', async () => {
  const read = await parseFigFile((await exportFigFile(new SceneGraph())).slice().buffer)
  expect(read.fonts.size).toBe(0)
})

test("the reader's worker hands the fonts over with the document", () => {
  const graph = documentWithFont()
  expect(deserializeSceneGraph(serializeSceneGraph(graph)).fonts).toEqual(graph.fonts)
})

test('saving a .fig opened from its archive keeps, adds and drops fonts as the document does', async () => {
  const opened = await parseFigFile((await exportFigFile(documentWithFont())).slice().buffer)
  opened.setProjectFont(sampleProjectFont('Fraunces'))
  opened.createNode('RECTANGLE', opened.getPages()[0].id, { name: 'Edit' })
  const saved = await parseFigFile((await exportFigFile(opened)).slice().buffer)
  expect([...saved.fonts.keys()].sort()).toEqual(['Fraunces', 'Inter Tight'])

  saved.removeProjectFont('Inter Tight')
  const again = await parseFigFile((await exportFigFile(saved)).slice().buffer)
  expect([...again.fonts.keys()]).toEqual(['Fraunces'])
})
