import { expect, test } from 'bun:test'

import { openReaderSession } from '#core/kiwi/fig/session/reader'
import { deserializeSceneGraph, serializeSceneGraph } from '#core/kiwi/fig/parse/transfer'
import { readFixtureArrayBuffer } from '#core-tests/helpers/fig/fixtures'

test('a graph crosses from the worker with every layer as it was', () => {
  const opened = openReaderSession(readFixtureArrayBuffer('gold-preview.fig'), 'first-page')
  const graph = opened.graph
  // A layer from an older reader lacks a field a new layer has.
  const [first] = graph.nodes.values()
  Reflect.deleteProperty(first, 'guides')

  const sent = structuredClone(serializeSceneGraph(graph))
  const received = deserializeSceneGraph(sent)

  expect(received.nodes.size).toBe(graph.nodes.size)
  for (const [id, node] of graph.nodes) {
    const copy = received.getNode(id)
    expect(copy).toEqual(id === first.id ? { ...node, guides: [] } : node)
  }
  // Layers own their lists and records, as new layers do, so writing into one changes no other.
  const [a, b] = [...received.nodes.values()].filter((node) => node.type === 'FRAME')
  for (const key of Object.keys(a) as (keyof typeof a)[]) {
    if (typeof a[key] === 'object' && a[key] !== null) expect(a[key]).not.toBe(b[key])
  }
  // Only the fields that differ from a new layer's cross over.
  const fields = sent.nodes.map(([, part]) => Object.keys(part).length)
  const average = fields.reduce((sum, count) => sum + count, 0) / fields.length
  expect(average).toBeLessThan(Object.keys(first).length / 2)
})
