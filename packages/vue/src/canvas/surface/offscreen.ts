import { useResizeObserver } from '@vueuse/core'
import { onScopeDispose, type Ref } from 'vue'

import { SkiaRenderer } from '@open-pencil/core/canvas'
import { getCanvasKit } from '@open-pencil/core/canvaskit'
import type { Editor } from '@open-pencil/core/editor'

/**
 * CanvasKit without a screen. The DOM scene draws everything the user sees; Skia still serves
 * what has not moved to the browser yet: raster exports and thumbnails, previews, boolean path
 * operations, and text measurement for pages that are not on screen. The renderer works on a
 * one-pixel CPU surface that is never presented, and nothing renders it frame by frame.
 */
export function useOffscreenCanvasKit(editor: Editor, options: { onReady?: () => void } = {}) {
  let renderer: SkiaRenderer | null = null
  // An object, so the async start sees a dispose that happens while it waits.
  const lifecycle = { destroyed: false }

  void (async () => {
    const ck = await getCanvasKit()
    const surface = lifecycle.destroyed ? null : ck.MakeSurface(1, 1)
    if (!surface) return
    renderer = new SkiaRenderer(ck, surface, null)
    editor.setCanvasKit(ck, renderer)
    await renderer.loadFonts()
    if (!lifecycle.destroyed) options.onReady?.()
  })()

  onScopeDispose(() => {
    lifecycle.destroyed = true
    if (!renderer) return
    editor.removeCanvasRenderer(renderer)
    renderer.destroy()
    renderer = null
  })
}

/** Reports an element's CSS size as the canvas surface did, for the pane's viewport. */
export function useViewportSize(
  element: Ref<HTMLElement | null>,
  onResize: (width: number, height: number) => void
) {
  useResizeObserver(element, ([entry]) => {
    const { width, height } = entry.contentRect
    onResize(width, height)
  })
}
