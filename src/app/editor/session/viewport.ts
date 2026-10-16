import type { ViewportSize } from '@/app/document/io/types'
import { IS_BROWSER } from '@/constants'

/** The canvas's size once it is measured; until then, the window's, or a desktop size. */
export function viewportSizeReader(measured: ViewportSize): () => ViewportSize {
  return () =>
    measured.width > 0 && measured.height > 0
      ? measured
      : {
          width: IS_BROWSER ? window.innerWidth : 1920,
          height: IS_BROWSER ? window.innerHeight : 1080
        }
}
