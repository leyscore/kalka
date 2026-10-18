import type { SkiaRenderer } from '@kalka/core/canvas'
import type { Editor } from '@kalka/core/editor'
import { createOffscreenCanvasKit, type OffscreenCanvasKit } from '@kalka/vue'

/**
 * A store's CanvasKit, loaded the first time a feature needs Skia (`createOffscreenCanvasKit`).
 * The loader is attached once the store exists, since callers look it up by the store or by the
 * editor it wraps.
 */
export function createStoreCanvasKit() {
  let loader: OffscreenCanvasKit | null = null
  return {
    methods: {
      /** Loads CanvasKit for features that still draw or compute with Skia. */
      loadCanvasKit: (): Promise<SkiaRenderer | null> => loader?.load() ?? Promise.resolve(null),
      /** Runs `callback` once CanvasKit has loaded, at once if it has. */
      onCanvasKitReady: (callback: () => void): (() => void) =>
        loader?.onReady(callback) ?? (() => undefined)
    },
    attach(store: Editor, editor: Editor): void {
      loader = createOffscreenCanvasKit(store, [editor])
    },
    dispose(): void {
      loader?.dispose()
    }
  }
}
