import type { NodeRasterizer } from '@open-pencil/core/io'
import { fontManager } from '@open-pencil/core/text'
import { rasterDocument } from '@open-pencil/vue'

import { isTauri } from '@/app/tauri/env'

/**
 * Draws layers for an image export with the browser, as the canvas draws them: the desktop app
 * renders a standalone page of the layers in a hidden window and captures it. WebP, the web
 * build, and images too large to capture fall back to CanvasKit.
 */
export const domRasterize: NodeRasterizer = async (request) => {
  if (!isTauri() || request.format === 'WEBP') return null
  const page = rasterDocument(request.graph, request.nodeIds, fontManager.loadedBrowserFaces())
  if (!page) return null
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    const bytes = await invoke<Uint8Array | number[] | null>('render_html_image', {
      request: {
        html: page.html,
        width: page.width,
        height: page.height,
        scale: request.scale,
        format: request.format,
        quality: request.quality
      }
    })
    return bytes ? new Uint8Array(bytes) : null
  } catch (error) {
    console.warn('[export] Drawing with the browser failed; using CanvasKit instead.', error)
    return null
  }
}
