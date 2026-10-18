import { expect, test } from 'bun:test'

import { CapturedFigRecords, readFixture } from '#core-tests/helpers/fig/fixtures'

import { SceneGraph } from '@kalka/scene-graph'

import { prepareClipboardImport } from '#core/clipboard/fig-import'

const fixture = readFixture('nested-binding-ownership-records.json', CapturedFigRecords)

function paste(graph: SceneGraph) {
  return prepareClipboardImport(
    fixture.nodeChanges,
    graph,
    graph.getPages()[0].id,
    fixture.blobs.map((value) => Uint8Array.fromBase64(value))
  )
}

test("a Figma paste into a document without Inter text keeps Figma's Inter, until undone", () => {
  const graph = new SceneGraph()
  const page = graph.getPages()[0]
  graph.createNode('TEXT', page.id, { text: 'Title', fontFamily: 'Roboto' })
  const operation = paste(graph)
  expect(graph.interVersion).toBe('4')

  operation.commit()
  expect(graph.interVersion).toBe('3.19')
  operation.capture()
  operation.undo()
  expect(graph.interVersion).toBe('4')
  operation.redo()
  expect(graph.interVersion).toBe('3.19')
})

test('a Figma paste leaves the Inter of a document whose text already uses Inter', () => {
  const graph = new SceneGraph()
  graph.createNode('TEXT', graph.getPages()[0].id, { text: 'Title', fontFamily: 'Inter' })
  const operation = paste(graph)

  operation.commit()
  expect(graph.interVersion).toBe('4')
})
