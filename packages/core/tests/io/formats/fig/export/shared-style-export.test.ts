import { expect, test } from 'bun:test'

import { exportFigFile } from '@kalka/core/io'
import { initCodec } from '@kalka/core/kiwi'
import { parseFigBuffer } from '@kalka/fig'
import { SceneGraph } from '@kalka/scene-graph'

test('exports shared styles once even when present in a normal page subtree', async () => {
  await initCodec()
  const graph = new SceneGraph()
  const frame = graph.createNode('FRAME', graph.getPages()[0].id)
  graph.createNode('TEXT', frame.id, {
    name: 'Shared typography',
    sharedStyleType: 'TEXT',
    text: 'Ag'
  })
  const bytes = await exportFigFile(graph)
  const { nodeChanges } = parseFigBuffer(bytes.buffer as ArrayBuffer)
  const styles = nodeChanges.filter((node) => node.name === 'Shared typography')
  expect(styles).toHaveLength(1)
  const ids = nodeChanges.map((node) => JSON.stringify(node.guid))
  expect(new Set(ids).size).toBe(ids.length)
})
