import { pixelGridVisible } from '@kalka/core/canvas'
import type { Color } from '@kalka/scene-graph/primitives'

import type { OverlayContext } from '#vue/canvas/svg-overlay/layers/selection'
import { css, type OverlayShape } from '#vue/canvas/svg-overlay/shapes'

/** What the grid needs beyond the overlay context: the canvas it covers and the page under it. */
export interface PixelGridViewport {
  /** CSS pixels. */
  width: number
  height: number
  /** Device pixels per CSS pixel. */
  dpr: number
  pageColor: Color
}

/**
 * The grid's line colour over the page, measured in Figma desktop 126: a light line on a dark page
 * and a dark one on a light page. Mirrors the Skia pixel grid, which does not export it.
 */
const DARK_PAGE_LINE: Color = { r: 1, g: 1, b: 1, a: 0.142 }
const LIGHT_PAGE_LINE: Color = { r: 0, g: 0, b: 0, a: 0.053 }

function lineColor(page: Color): Color {
  const luminance = 0.2126 * page.r + 0.7152 * page.g + 0.0722 * page.b
  return luminance < 0.5 ? DARK_PAGE_LINE : LIGHT_PAGE_LINE
}

/**
 * Device pixels that carry a line along one axis: document pixel k's line sits on device pixel
 * round(origin + k · step), the rounding the Skia shader applies, within [0, size).
 */
function linePixels(origin: number, step: number, size: number): number[] {
  const pixels: number[] = []
  const first = Math.ceil((-0.5 - origin) / step)
  for (let k = first; ; k++) {
    const pixel = Math.floor(origin + k * step + 0.5)
    if (pixel >= size) break
    if (pixel >= 0 && pixel !== pixels.at(-1)) pixels.push(pixel)
  }
  return pixels
}

/**
 * Figma's pixel grid: a line at every document pixel once zoomed in far enough to tell them
 * apart. Each line covers exactly one device pixel. All lines are one path, so where they cross
 * the colour is laid down once, as the shader does.
 */
export function pixelGridLayer(
  context: OverlayContext,
  viewport: PixelGridViewport
): OverlayShape[] {
  const { panX, panY, zoom } = context.view
  const { width, height, dpr } = viewport
  if (!context.overlays.showPixelGrid || !pixelGridVisible(zoom, dpr)) return []
  if (width <= 0 || height <= 0) return []
  const step = zoom * dpr
  // A device pixel p spans [p, p + 1); its centre in CSS pixels is (p + 0.5) / dpr.
  const centre = (pixel: number) => (pixel + 0.5) / dpr
  const columns = linePixels(panX * dpr, step, Math.ceil(width * dpr)).map(
    (pixel) => `M${centre(pixel)} 0V${height}`
  )
  const rows = linePixels(panY * dpr, step, Math.ceil(height * dpr)).map(
    (pixel) => `M0 ${centre(pixel)}H${width}`
  )
  if (columns.length === 0 && rows.length === 0) return []
  return [
    {
      type: 'path',
      d: [...columns, ...rows].join(''),
      stroke: css(lineColor(viewport.pageColor)),
      strokeWidth: 1 / dpr
    }
  ]
}
