import { describe, expect, test } from 'bun:test'
import { unzipSync } from 'fflate'

import { FIXTURES } from '#core-tests/helpers/fig/fixtures'

import { exportFigFile, initCodec, parseFigFile } from '@kalka/core'
import type { NodeRasterizer, NodeRasterRequest } from '@kalka/core/io'
import { SceneGraph, type Color } from '@kalka/scene-graph'

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
const DRAWN = new Uint8Array([...PNG_SIGNATURE, 1, 2, 3, 4])
const navy: Color = { r: 0.03, g: 0.14, b: 0.35, a: 1 }

/** A page with a 1024 × 256 frame on a navy background. */
function wideCard() {
  const graph = new SceneGraph()
  const page = graph.getPages()[0]
  page.source.fig.rawNodeFields.backgroundColor = { ...navy }
  const frame = graph.createNode('FRAME', page.id, { name: 'Card', width: 1024, height: 256 })
  return { graph, page, frame }
}

function recording(result: (request: NodeRasterRequest) => Promise<Uint8Array | null>) {
  const requests: NodeRasterRequest[] = []
  const rasterize: NodeRasterizer = (request) => {
    requests.push(request)
    return result(request)
  }
  return { requests, rasterize }
}

function thumbnailOf(bytes: Uint8Array): Uint8Array | undefined {
  return unzipSync(bytes)['thumbnail.png']
}

describe('.fig thumbnails', () => {
  test('come from the engine that draws the canvas when one is given', async () => {
    const { graph, page, frame } = wideCard()
    const { requests, rasterize } = recording(() => Promise.resolve(DRAWN))

    const bytes = await exportFigFile(graph, { pageId: page.id, rasterize })

    expect(thumbnailOf(bytes)).toEqual(DRAWN)
    expect(requests).toHaveLength(1)
    // The page's layers, fitted into the thumbnail, on the page's color.
    expect(requests[0]).toMatchObject({
      pageId: page.id,
      nodeIds: [frame.id],
      format: 'PNG',
      background: navy
    })
    expect(requests[0].scale).toBeCloseTo(0.5)
  })

  test('fall back when the engine cannot draw them', async () => {
    const declined = wideCard()
    const fallback = await exportFigFile(declined.graph, {
      pageId: declined.page.id,
      rasterize: () => Promise.resolve(null)
    })
    const failed = wideCard()
    const afterError = await exportFigFile(failed.graph, {
      pageId: failed.page.id,
      rasterize: () => Promise.reject(new Error('no window'))
    })

    for (const thumbnail of [thumbnailOf(fallback), thumbnailOf(afterError)]) {
      expect(thumbnail && Array.from(thumbnail.subarray(0, 8))).toEqual(PNG_SIGNATURE)
      expect(thumbnail).not.toEqual(DRAWN)
    }
  })

  test('are not drawn for an empty page', async () => {
    const graph = new SceneGraph()
    const { requests, rasterize } = recording(() => Promise.resolve(DRAWN))

    const bytes = await exportFigFile(graph, { rasterize })

    expect(requests).toHaveLength(0)
    expect(thumbnailOf(bytes)).not.toEqual(DRAWN)
  })

  test('leave an unmodified file byte for byte', async () => {
    await initCodec()
    const source = new Uint8Array(await Bun.file(`${FIXTURES}/slots.fig`).arrayBuffer())
    const graph = await parseFigFile(source.slice().buffer)
    const { requests, rasterize } = recording(() => Promise.resolve(DRAWN))

    const bytes = await exportFigFile(graph, { rasterize })

    expect(bytes).toEqual(source)
    expect(requests).toHaveLength(0)
  })
})
