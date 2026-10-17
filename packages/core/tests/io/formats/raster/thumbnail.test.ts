import { expect, setDefaultTimeout, test } from 'bun:test'

import { expectDefined } from '#core-tests/helpers/assert'

import { FigmaAPI } from '@kalka/core/figma-api'
import {
  createCanvasKitRasterCodec,
  headlessRenderThumbnail,
  initCanvasKit
} from '@kalka/core/io/formats/raster'
import { SceneGraph } from '@kalka/scene-graph'

setDefaultTimeout(60_000)

test('a thumbnail shows the page background between its layers', async () => {
  const graph = new SceneGraph()
  const page = graph.getPages()[0]
  for (const x of [0, 90]) {
    graph.createNode('RECTANGLE', page.id, { x, y: 0, width: 10, height: 100 })
  }
  // Figma's dark-theme page background, #1E1E1E, which no renderer is set to.
  new FigmaAPI(graph).currentPage.backgrounds = [
    {
      type: 'SOLID',
      color: { r: 30 / 255, g: 30 / 255, b: 30 / 255, a: 1 },
      opacity: 1,
      visible: true
    }
  ]

  const png = expectDefined(await headlessRenderThumbnail(graph, page.id, 100, 100), 'thumbnail')
  const image = expectDefined(createCanvasKitRasterCodec(await initCanvasKit()).decode(png))
  const gap = (50 * image.width + 50) * 4

  expect([...image.data.subarray(gap, gap + 4)]).toEqual([30, 30, 30, 255])
})
