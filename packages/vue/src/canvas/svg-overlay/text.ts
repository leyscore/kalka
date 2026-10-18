import { DEFAULT_FONT_FAMILY } from '@kalka/core/constants'
import { fontManager } from '@kalka/core/text'

import type { MeasureText } from '#vue/canvas/svg-overlay/shapes'

/** Text widths as the overlay draws them, with the app's interface font. */
export function createMeasureText(): MeasureText {
  const context = new OffscreenCanvas(1, 1).getContext('2d')
  const cache = new Map<string, number>()
  return (text, fontSize, fontWeight = 400) => {
    const key = `${fontWeight}:${fontSize}:${text}`
    const known = cache.get(key)
    if (known !== undefined) return known
    if (!context) return text.length * fontSize * 0.6
    context.font = `${fontWeight} ${fontSize}px Inter, system-ui, sans-serif`
    const width = context.measureText(text).width
    if (cache.size > 2000) cache.clear()
    cache.set(key, width)
    return width
  }
}

/**
 * Loads the interface font the overlay's labels draw in. Nothing else on a DOM canvas has to: the
 * Skia renderer used to bring it, and now loads only when a feature needs it.
 */
export async function loadLabelFont(): Promise<void> {
  try {
    await fontManager.loadFont(DEFAULT_FONT_FAMILY, 'Regular')
    await document.fonts.load(`400 11px ${DEFAULT_FONT_FAMILY}`)
  } catch (error) {
    console.warn('[Overlay] Could not load the label font:', error)
  }
}
