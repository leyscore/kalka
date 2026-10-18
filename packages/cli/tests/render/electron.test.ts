import { describe, expect, test } from 'bun:test'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { workspaceRoot } from '#cli-tests/helpers/paths'

import { initCanvasKit } from '@kalka/core/io'
import { SceneGraph } from '@kalka/scene-graph'

import { electronRenderContext } from '#cli/render/electron'

const HOST = join(workspaceRoot(), 'electron', 'dist', 'render-host.js')
// The render host is built with the desktop app, and Linux needs a display (xvfb on CI).
const canRender = existsSync(HOST) && (process.platform !== 'linux' || !!process.env.DISPLAY)

function card() {
  const graph = new SceneGraph()
  const page = graph.getPages()[0]
  const node = graph.createNode('FRAME', page.id, {
    name: 'Card',
    width: 120,
    height: 60,
    fills: [
      { type: 'SOLID', color: { r: 0.18, g: 0.36, b: 0.92, a: 1 }, opacity: 1, visible: true }
    ]
  })
  return { graph, page, node }
}

describe.skipIf(!canRender)('the CLI renders with Chromium', () => {
  test('an image at the export scale', async () => {
    const { graph, page, node } = card()
    const { rasterize } = electronRenderContext()
    const png = await rasterize?.({
      graph,
      pageId: page.id,
      nodeIds: [node.id],
      scale: 2,
      format: 'PNG'
    })
    expect(png).toBeInstanceOf(Uint8Array)
    if (!png) return
    const view = new DataView(png.buffer, png.byteOffset)
    expect([view.getUint32(16), view.getUint32(20)]).toEqual([240, 120])
  }, 60_000)

  test('a PNG transparent where the layers draw nothing', async () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0]
    const frame = graph.createNode('FRAME', page.id, { name: 'Bare', width: 40, height: 20 })
    graph.createNode('RECTANGLE', frame.id, {
      x: 20,
      width: 20,
      height: 20,
      fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0, a: 1 }, opacity: 1, visible: true }]
    })
    const png = await electronRenderContext().rasterize?.({
      graph,
      pageId: page.id,
      nodeIds: [frame.id],
      scale: 1,
      format: 'PNG'
    })
    if (!png) throw new Error('No PNG')
    const ck = await initCanvasKit()
    const image = ck.MakeImageFromEncoded(png)
    if (!image) throw new Error('Undecodable PNG')
    const pixels = image.readPixels(0, 0, {
      width: 40,
      height: 20,
      alphaType: ck.AlphaType.Unpremul,
      colorType: ck.ColorType.RGBA_8888,
      colorSpace: ck.ColorSpace.SRGB
    })
    image.delete()
    const alphaAt = (x: number, y: number) => pixels?.[(y * 40 + x) * 4 + 3]
    expect([alphaAt(5, 10), alphaAt(30, 10)]).toEqual([0, 255])
  }, 60_000)

  test('a PDF', async () => {
    const { graph, page, node } = card()
    const pdf = await electronRenderContext().printPDF?.({
      graph,
      pageId: page.id,
      nodeIds: [node.id]
    })
    expect(new TextDecoder().decode(pdf?.slice(0, 5))).toBe('%PDF-')
  }, 60_000)
})
