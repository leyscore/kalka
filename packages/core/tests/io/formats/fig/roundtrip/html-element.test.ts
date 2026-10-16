import { beforeAll, describe, expect, setDefaultTimeout, test } from 'bun:test'

import { collectAllNodes } from '#core-tests/helpers/fig/traversal'

import { exportFigFile, initCodec, parseFigFile, SceneGraph } from '@kalka/core'

setDefaultTimeout(60_000)

describe('roundtrip: a layer keeps its HTML tag and classes in a .fig file', () => {
  beforeAll(async () => {
    await initCodec()
  })

  test('the tag and classes come back, and a layer without them stays without', async () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0]
    graph.createNode('FRAME', page.id, { name: 'Nav', htmlTag: 'nav', htmlClasses: ['site-nav'] })
    graph.createNode('TEXT', page.id, { name: 'Title', text: 'Hi', htmlTag: 'h1' })
    graph.createNode('FRAME', page.id, { name: 'Plain' })

    const bytes = await exportFigFile(graph)
    const nodes = collectAllNodes(await parseFigFile(bytes.buffer as ArrayBuffer))
    const named = (name: string) => nodes.find((node) => node.name === name)

    expect(named('Nav')?.htmlTag).toBe('nav')
    expect(named('Nav')?.htmlClasses).toEqual(['site-nav'])
    expect(named('Title')?.htmlTag).toBe('h1')
    expect(named('Plain')?.htmlTag).toBeNull()
    expect(named('Plain')?.htmlClasses).toEqual([])
  })

  test('the document’s CSS classes come back', async () => {
    const graph = new SceneGraph()
    const classes = [
      { name: 'btn', kind: 'box' as const, style: { cornerRadius: 999, opacity: 0.9 } },
      { name: 'lead', kind: 'text' as const, style: { fontSize: 20 } }
    ]
    graph.updateNode(graph.rootId, { cssClasses: classes })
    const read = await parseFigFile((await exportFigFile(graph)).buffer as ArrayBuffer)
    expect(read.getNode(read.rootId)?.cssClasses).toEqual(classes)
  })
})
