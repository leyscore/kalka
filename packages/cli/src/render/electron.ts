import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import {
  computeContentBounds,
  renderNodesToHTML,
  type IOContext,
  type NodeRasterRequest
} from '@kalka/core/io'

import { renderHost } from './host/session'

/** How long one image or PDF may take to draw before the export falls back to CanvasKit. */
const RENDER_TIMEOUT = 120_000

type PageRequest = Pick<NodeRasterRequest, 'graph' | 'nodeIds' | 'background'> & {
  scale: number
  format: 'PNG' | 'JPG' | 'PDF'
  quality?: number
}

/**
 * Draws layers as the canvas draws them: the standalone HTML export of the layers, with the font
 * files the canvas draws with beside it, painted by Chromium in Kalka's render host, an Electron
 * process that shows no window. Null when there is no Electron, or the render fails, so the export uses CanvasKit.
 */
async function renderWithElectron(request: PageRequest): Promise<Uint8Array | null> {
  if (process.env.KALKA_RENDERER === 'canvaskit') return null
  const bounds = computeContentBounds(request.graph, [...request.nodeIds])
  const host = renderHost()
  if (!bounds || !host) return null

  const dir = await mkdtemp(join(tmpdir(), 'kalka-render-'))
  try {
    const { html, assets } = await renderNodesToHTML(
      request.graph,
      [...request.nodeIds],
      { html: 'standalone', assets: 'external', fonts: 'loaded', pretty: false },
      'page.html'
    )
    await writeFile(join(dir, 'page.html'), html)
    for (const asset of assets) {
      const path = join(dir, asset.path)
      await mkdir(dirname(path), { recursive: true })
      await writeFile(path, asset.content)
    }
    const output = join(dir, `out.${request.format.toLowerCase()}`)
    const answer = host.request(
      {
        type: 'render',
        file: join(dir, 'page.html'),
        output,
        width: Math.max(1, Math.ceil(bounds.maxX - bounds.minX)),
        height: Math.max(1, Math.ceil(bounds.maxY - bounds.minY)),
        scale: request.scale,
        format: request.format,
        quality: request.quality,
        background: request.background
      },
      RENDER_TIMEOUT
    )
    // `too-large` when the image cannot be captured in one piece.
    if (answer?.result !== 'written') return null
    return new Uint8Array(await readFile(output))
  } catch {
    return null
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

/** The CLI's export context: images and PDF through the render host, CanvasKit as fallback. */
export function electronRenderContext(): Pick<IOContext, 'rasterize' | 'printPDF'> {
  return {
    rasterize: (request) =>
      request.format === 'WEBP'
        ? Promise.resolve(null)
        : renderWithElectron({ ...request, format: request.format }),
    printPDF: (request) => renderWithElectron({ ...request, scale: 1, format: 'PDF' })
  }
}
