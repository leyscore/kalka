import { describe, expect, test } from 'bun:test'

import { BrowserLayoutEngine, type LayoutPage } from '@kalka/core/layout'
import { fontManager } from '@kalka/core/text'
import { SceneGraph } from '@kalka/scene-graph'

/** A page that lays nothing out and records the faces each request sent. */
function recordingPage() {
  const requests: string[][] = []
  const page: LayoutPage = (request) => {
    requests.push(request.fonts.map((face) => `${face.family} ${face.weight}`))
    return []
  }
  return { page, requests }
}

describe('browser layout engine', () => {
  test('lays an artboard out again once a face its text named arrives', () => {
    const family = 'Browser Layout Late Face'
    const graph = new SceneGraph()
    const frame = graph.createNode('FRAME', graph.getPages()[0].id, { width: 200, height: 100 })
    graph.createNode('TEXT', frame.id, { text: 'Late', fontFamily: family, fontWeight: 700 })
    const { page, requests } = recordingPage()
    const engine = new BrowserLayoutEngine(page)

    engine.layout(graph, frame.id)
    engine.layout(graph, frame.id)
    expect(requests).toEqual([[]])

    fontManager.markLoaded(family, 'Bold', new Uint8Array(8).buffer)
    engine.layout(graph, frame.id)
    engine.layout(graph, frame.id)
    expect(requests).toEqual([[], [`${family} 700`]])
  })
})
