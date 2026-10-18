import type { WebFontFaceAsset, WebFontFaceRequest } from '@kalka/dom-css/export'
import type { InterVersion } from '@kalka/scene-graph'

import { weightToStyle } from '#core/text/font/style'
import { fontManager } from '#core/text/fonts'
import { fontFamilyKey } from '#core/text/inter'
import { exportWebFontFaceAssets, slugFontFamily } from '#core/text/web-font/assets'

const FORMATS: Record<string, { format: WebFontFaceAsset['format']; extension: string }> = {
  wOF2: { format: 'woff2', extension: 'woff2' },
  wOFF: { format: 'woff', extension: 'woff' },
  OTTO: { format: 'opentype', extension: 'otf' }
}

function fileFormat(data: Uint8Array): { format: WebFontFaceAsset['format']; extension: string } {
  const tag = String.fromCharCode(...data.subarray(0, 4))
  return FORMATS[tag] ?? { format: 'truetype', extension: 'ttf' }
}

/**
 * The fonts a page drawn as an image ships, as the canvas draws with them: the file Kalka loaded
 * for each face the text names, which covers every character the document uses, and the
 * downloaded fallback families the projection lists after them. An installed fallback the page
 * finds by its name; a face Kalka has not loaded comes from the web font providers. In a
 * document keeping Figma's Inter (`interVersion`), `Inter` is Kalka's Inter 3.19.
 */
export function loadedFontFaceAssets(interVersion: InterVersion) {
  return async (fonts: WebFontFaceRequest[], assetBasePath: string) => {
    const fallbacks = fontManager
      .fallbackFamilies()
      .filter((family) => fontManager.loadedFontSource(family, 'Regular') !== 'fallback')
      .map((family): WebFontFaceRequest => ({ family, weight: 400, style: 'normal' }))
    const assets: WebFontFaceAsset[] = []
    const missing: WebFontFaceRequest[] = []
    for (const request of [...fonts, ...fallbacks]) {
      const style = request.style ?? 'normal'
      const data = fontManager.loadedData(
        fontFamilyKey(request.family, interVersion),
        weightToStyle(request.weight, style === 'italic')
      )
      if (!data) {
        if (!fallbacks.includes(request)) missing.push(request)
        continue
      }
      const content = new Uint8Array(data)
      const { format, extension } = fileFormat(content)
      assets.push({
        family: request.family,
        weight: request.weight,
        style,
        format,
        path: `${assetBasePath}/${slugFontFamily(request.family)}-${request.weight}-${style}.${extension}`,
        content
      })
    }
    if (missing.length === 0) return assets
    const fetched = await exportWebFontFaceAssets({ fonts: missing, assetBasePath, interVersion })
    return [...assets, ...fetched.assets]
  }
}
