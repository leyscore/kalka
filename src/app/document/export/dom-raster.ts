import type { NodePrinter, NodeRasterizer, NodeRasterRequest } from '@kalka/core/io'
import { fontManager } from '@kalka/core/text'
import { rasterDocument } from '@kalka/vue'

import { isTauri } from '@/app/tauri/env'

type DesktopRenderCommand = 'render_html_image' | 'render_html_pdf'

/**
 * Builds a standalone page of the layers and has the desktop app draw it in a hidden window.
 * Null in the web build, for an empty selection, or when the desktop cannot draw it.
 */
async function drawInDesktop(
  command: DesktopRenderCommand,
  request: Pick<NodeRasterRequest, 'graph' | 'nodeIds'> & Record<string, unknown>
): Promise<Uint8Array | null> {
  if (!isTauri()) return null
  const { graph, nodeIds, ...options } = request
  try {
    const page = rasterDocument(graph, nodeIds, fontManager.loadedBrowserFaces())
    if (!page) return null
    const { invoke } = await import('@tauri-apps/api/core')
    const bytes = await invoke<Uint8Array | number[] | null>(command, {
      request: { ...options, html: page.html, width: page.width, height: page.height }
    })
    return bytes ? new Uint8Array(bytes) : null
  } catch (error) {
    console.warn('[export] Drawing with the browser failed; using the fallback instead.', error)
    return null
  }
}

/**
 * Draws layers for an image export with the browser, as the canvas draws them: the desktop app
 * renders a standalone page of the layers in a hidden window and captures it. `.fig` thumbnails
 * come the same way. WebP, the web build, and images too large to capture fall back to CanvasKit.
 */
export const domRasterize: NodeRasterizer = async (request) => {
  if (request.format === 'WEBP') return null
  return drawInDesktop('render_html_image', {
    graph: request.graph,
    nodeIds: request.nodeIds,
    scale: request.scale,
    format: request.format,
    quality: request.quality,
    background: request.background
  })
}

/**
 * Prints layers to PDF with the browser, as the canvas draws them, in the desktop app's hidden
 * window. The web build falls back to jsPDF.
 */
export const domPrintPDF: NodePrinter = (request) =>
  drawInDesktop('render_html_pdf', { graph: request.graph, nodeIds: request.nodeIds })
