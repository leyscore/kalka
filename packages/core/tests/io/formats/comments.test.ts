import { beforeAll, describe, expect, setDefaultTimeout, test } from 'bun:test'

import { exportFigFile, initCodec, parseFigFile, SceneGraph } from '@kalka/core'
import { readKalkaFolder, writeKalkaFolder } from '#core/io/formats/kalka'
import {
  addCommentThread,
  documentComments,
  documentFrameReviews,
  replyToComment,
  setFrameReady
} from '@kalka/scene-graph'

setDefaultTimeout(30_000)

function commented() {
  const graph = new SceneGraph()
  const page = graph.getPages()[0]
  const card = graph.createNode('FRAME', page.id, { name: 'Card', x: 40, y: 60 })
  const thread = addCommentThread(
    graph,
    { pageId: page.id, nodeId: card.id, x: 12, y: 8 },
    { kind: 'person', name: 'Baurice' },
    '@Claude tighten the spacing',
    { agent: 'Claude', now: 1 }
  )
  replyToComment(graph, thread.id, { kind: 'agent', name: 'Claude' }, 'Done: 16px gaps.', { now: 2 })
  addCommentThread(graph, { pageId: page.id, nodeId: null, x: 500, y: 20 }, { kind: 'person', name: 'Baurice' }, 'Hero idea')
  setFrameReady(graph, card.id, 'Baurice', 3)
  return graph
}

describe('comments and frame reviews are saved with the document', () => {
  beforeAll(async () => {
    await initCodec()
  })

  test('in a .fig file', async () => {
    const graph = commented()
    const read = await parseFigFile((await exportFigFile(graph)).buffer as ArrayBuffer)
    expect(documentComments(read)).toEqual(documentComments(graph))
    expect(documentFrameReviews(read)).toEqual(documentFrameReviews(graph))
  })

  test('in a Kalka folder', async () => {
    const graph = commented()
    const files = await writeKalkaFolder(graph)
    const read = readKalkaFolder(new Map(files.map((file) => [file.path, file.content])))
    expect(documentComments(read)).toEqual(documentComments(graph))
    expect(documentFrameReviews(read)).toEqual(documentFrameReviews(graph))
  })
})
