import { expect, test } from 'bun:test'

import { exportFigFile } from '@kalka/core/io'
import { initCodec } from '@kalka/core/kiwi'
import { parseFigBuffer } from '@kalka/fig'
import { SceneGraph } from '@kalka/scene-graph'

for (const mode of ['NONE', 'HEIGHT', 'WIDTH_AND_HEIGHT'] as const) {
  test(`exports actual text sizing ${mode} inside auto-layout without importer metadata`, async () => {
    await initCodec()
    const graph = new SceneGraph()
    const frame = graph.createNode('FRAME', graph.getPages()[0].id, { layoutMode: 'HORIZONTAL' })
    graph.createNode('TEXT', frame.id, { text: 'Label', textAutoResize: mode })
    const bytes = await exportFigFile(graph)
    const parsed = parseFigBuffer(bytes.buffer as ArrayBuffer)
    expect(parsed.nodeChanges.find((node) => node.type === 'TEXT')?.textAutoResize).toBe(mode)
  })
}
