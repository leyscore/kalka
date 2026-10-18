import { useResizeObserver } from '@vueuse/core'
import { onScopeDispose, type Ref } from 'vue'

import type { SkiaRenderer } from '@kalka/core/canvas'
import type { Editor } from '@kalka/core/editor'

/** CanvasKit for one editor, loaded the first time something asks for it. */
export interface OffscreenCanvasKit {
  /**
   * Loads CanvasKit, sets its renderer on the editor and loads its fonts, once; resolves with the
   * renderer, or null when the loader was disposed first. Callers that need Skia await this.
   */
  load: () => Promise<SkiaRenderer | null>
  /** Runs `callback` once CanvasKit is ready, at once when it already is. Returns its remover. */
  onReady: (callback: () => void) => () => void
  /** Releases the renderer and stops a load under way from attaching one. */
  dispose: () => void
}

const loaders = new WeakMap<Editor, OffscreenCanvasKit>()

/**
 * CanvasKit without a screen, loaded on demand. The DOM scene draws everything the user sees;
 * Skia still serves what has not moved to the browser yet: raster exports and thumbnails,
 * previews, boolean and flatten path operations, and decoding pasted images. Its 7 MiB of
 * WebAssembly and the memory of its heap are paid only by a document that uses one of these.
 * The renderer works on a one-pixel CPU surface that is never presented.
 */
export function createOffscreenCanvasKit(
  editor: Editor,
  /** Other objects that stand for the same editor, such as an app store wrapping it. */
  aliases: readonly Editor[] = []
): OffscreenCanvasKit {
  let renderer: SkiaRenderer | null = null
  let loading: Promise<SkiaRenderer | null> | null = null
  let ready = false
  let disposed = false
  const waiting = new Set<() => void>()

  async function start(): Promise<SkiaRenderer | null> {
    const [{ getCanvasKit }, { SkiaRenderer: Renderer }] = await Promise.all([
      import('@kalka/core/canvaskit'),
      import('@kalka/core/canvas')
    ])
    const ck = await getCanvasKit()
    const surface = disposed ? null : ck.MakeSurface(1, 1)
    if (!surface) return null
    const created = new Renderer(ck, surface, null)
    renderer = created
    editor.setCanvasKit(ck, created)
    await created.loadFonts()
    if (disposed) return null
    ready = true
    for (const callback of waiting) callback()
    waiting.clear()
    return created
  }

  const loader: OffscreenCanvasKit = {
    load() {
      // A canvas that draws with Skia brings its own renderer.
      if (!loading && editor.renderer) return Promise.resolve(editor.renderer)
      loading ??= start().catch((error: unknown) => {
        // Features that need Skia degrade as they did when it failed at startup; a later call retries.
        console.error('[CanvasKit] Could not load:', error)
        loading = null
        return null
      })
      return loading
    },
    onReady(callback) {
      if (ready) {
        callback()
        return () => undefined
      }
      waiting.add(callback)
      return () => waiting.delete(callback)
    },
    dispose() {
      disposed = true
      waiting.clear()
      for (const key of [editor, ...aliases]) if (loaders.get(key) === loader) loaders.delete(key)
      if (!renderer) return
      editor.removeCanvasRenderer(renderer)
      renderer.destroy()
      renderer = null
    }
  }
  for (const key of [editor, ...aliases]) loaders.set(key, loader)
  return loader
}

/**
 * Loads CanvasKit for `editor` if it has an on-demand loader and resolves with its renderer:
 * the editor's own when its canvas draws with Skia, null when it has neither.
 */
export function loadCanvasKit(editor: Editor): Promise<SkiaRenderer | null> {
  const loader = loaders.get(editor)
  return loader ? loader.load() : Promise.resolve(editor.renderer ?? null)
}

/** Runs `run` once `editor` has CanvasKit, for actions whose path operations need it. */
export async function withCanvasKit(editor: Editor, run: () => void): Promise<void> {
  await loadCanvasKit(editor)
  run()
}

/**
 * CanvasKit loaded at once for the lifetime of the calling scope, for hosts that want Skia from
 * the start. The app loads it on demand with {@link createOffscreenCanvasKit} instead.
 */
export function useOffscreenCanvasKit(editor: Editor, options: { onReady?: () => void } = {}) {
  const loader = createOffscreenCanvasKit(editor)
  if (options.onReady) loader.onReady(options.onReady)
  void loader.load()
  onScopeDispose(() => loader.dispose())
  return loader
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
