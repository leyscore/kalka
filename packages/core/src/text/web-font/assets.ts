import { uniqBy } from 'es-toolkit'
import type { RemoteFontSource, ResolveFontResult } from 'unifont'

import type { WebFontFaceAsset, WebFontFaceRequest } from '@kalka/dom-css/export'
import {
  DEFAULT_FONT_FAMILY,
  FIGMA_INTER_VERSION,
  weightToStyle,
  type InterVersion
} from '@kalka/scene-graph'

import { fontManager } from '#core/text/fonts'
import { inter3FontURL } from '#core/text/inter'
import { unicodeRangeCovers } from '#core/text/unicode-range'
import {
  createProviderUnifont,
  isRemoteFontSource,
  type WebFontResolveOptions
} from '#core/text/web-font/providers'
import {
  WEB_FONT_PROVIDER_IDS,
  webFontSubsetsForText,
  type WebFontFetch,
  type WebFontProviderId
} from '#core/text/web-fonts'

export interface ExportWebFontFaceAssetsOptions {
  fonts: WebFontFaceRequest[]
  providers?: WebFontProviderId[]
  assetBasePath?: string
  fetcher?: WebFontFetch
  /**
   * The Inter of the document the fonts are for: a document keeping Figma's Inter 3.19 ships
   * Kalka's own files of it as `Inter`, since the providers serve a later Inter.
   */
  interVersion?: InterVersion
  /**
   * The characters the faces draw. A provider splits a family by script, so each file holding
   * one of them ships, with its `unicode-range`; without it, the Latin file alone ships.
   */
  text?: string
}

export interface ExportWebFontFaceAssetsResult {
  assets: WebFontFaceAsset[]
}

function fontAssetExtension(source: RemoteFontSource): string {
  if (source.format === 'woff2') return 'woff2'
  if (source.format === 'woff') return 'woff'
  if (source.format === 'opentype' || source.format === 'otf') return 'otf'
  return 'ttf'
}

function fontAssetFormat(source: RemoteFontSource): WebFontFaceAsset['format'] {
  if (source.format === 'woff2') return 'woff2'
  if (source.format === 'woff') return 'woff'
  if (source.format === 'opentype' || source.format === 'otf') return 'opentype'
  return 'truetype'
}

export function slugFontFamily(family: string): string {
  let slug = ''
  let previousDash = false
  for (const char of family.toLowerCase()) {
    const code = char.charCodeAt(0)
    const isAlpha = code >= 97 && code <= 122
    const isDigit = code >= 48 && code <= 57
    if (isAlpha || isDigit) {
      slug += char
      previousDash = false
      continue
    }
    if (slug.length > 0 && !previousDash) {
      slug += '-'
      previousDash = true
    }
  }
  return slug.endsWith('-') ? slug.slice(0, -1) : slug
}

interface RemoteFace {
  source: RemoteFontSource
  face: ResolveFontResult['fonts'][number]
}

/**
 * The files of a face that draw `text`: each one whose `unicode-range` holds a character of it,
 * or the first when none says what it holds.
 */
export function remoteFacesForText<T extends { face: { unicodeRange?: string[] } }>(
  faces: readonly T[],
  text: string
): T[] {
  const codePoints = Array.from(text, (character) => character.codePointAt(0) ?? 0)
  const drawn = faces.filter(({ face }) => {
    const range = face.unicodeRange?.join(',')
    return range && codePoints.some((codePoint) => unicodeRangeCovers(range, codePoint))
  })
  return drawn.length > 0 ? drawn : faces.slice(0, 1)
}

async function resolveRemoteFontSources(
  family: string,
  request: WebFontFaceRequest,
  provider: WebFontProviderId,
  text: string | undefined
): Promise<RemoteFace[]> {
  const unifont = await createProviderUnifont(provider)
  const options = {
    weights: [String(request.weight)],
    styles: [request.style ?? 'normal'],
    formats: ['woff2', 'woff', 'ttf'],
    subsets: text === undefined ? ['latin'] : webFontSubsetsForText(text)
  } satisfies WebFontResolveOptions
  const result = await unifont.resolveFont(family, options)
  const faces = result.fonts
    .toSorted((a, b) => (a.meta?.priority ?? 0) - (b.meta?.priority ?? 0))
    .flatMap((face): RemoteFace[] => {
      const source = face.src.find(isRemoteFontSource)
      return source ? [{ source, face }] : []
    })
  if (text === undefined) return faces.slice(0, 1)
  const preferred = faces.at(0)?.face.meta?.priority ?? 0
  return uniqBy(
    remoteFacesForText(
      faces.filter(({ face }) => (face.meta?.priority ?? 0) === preferred),
      text
    ),
    ({ source }) => source.url
  )
}

/** Kalka's own Inter 3.19 file for a face, or null when the face is another. */
async function bundledInter3Asset(
  request: WebFontFaceRequest,
  assetBasePath: string,
  interVersion: InterVersion | undefined
): Promise<WebFontFaceAsset | null> {
  if (interVersion !== FIGMA_INTER_VERSION || request.family !== DEFAULT_FONT_FAMILY) return null
  const style = request.style ?? 'normal'
  const url = inter3FontURL(weightToStyle(request.weight, style === 'italic'))
  const data = await fontManager.fetchBundledFont(url).catch(() => null)
  if (!data) return null
  return {
    family: request.family,
    weight: request.weight,
    style,
    format: 'woff',
    path: `${assetBasePath}/${slugFontFamily(request.family)}-${request.weight}-${style}.woff`,
    content: new Uint8Array(data)
  }
}

export async function exportWebFontFaceAssets({
  fonts,
  providers = WEB_FONT_PROVIDER_IDS.slice(),
  assetBasePath = 'assets/fonts',
  fetcher = fetch,
  interVersion,
  text
}: ExportWebFontFaceAssetsOptions): Promise<ExportWebFontFaceAssetsResult> {
  const assets: WebFontFaceAsset[] = []
  const seen = new Set<string>()

  for (const request of fonts) {
    const family = request.family
    const requestStyle = request.style ?? 'normal'
    const key = `${family}|${request.weight}|${requestStyle}`
    if (seen.has(key)) continue
    seen.add(key)

    const bundled = await bundledInter3Asset(request, assetBasePath, interVersion)
    if (bundled) {
      assets.push(bundled)
      continue
    }

    for (const provider of providers) {
      try {
        const resolved = await resolveRemoteFontSources(family, request, provider, text)
        const fetched: WebFontFaceAsset[] = []
        for (const { source, face } of resolved) {
          const response = await fetcher(source.url, face.meta?.init)
          if (!response.ok) continue
          // A family split by script ships a file for each one the text draws.
          const part = fetched.length > 0 ? `-${fetched.length + 1}` : ''
          fetched.push({
            family,
            weight: face.weight ?? request.weight,
            style: face.style ?? requestStyle,
            display: face.display,
            stretch: face.stretch,
            unicodeRange: face.unicodeRange,
            format: fontAssetFormat(source),
            path: `${assetBasePath}/${slugFontFamily(family)}-${request.weight}-${requestStyle}${part}.${fontAssetExtension(source)}`,
            content: new Uint8Array(await response.arrayBuffer())
          })
        }
        if (fetched.length === 0) continue
        assets.push(...fetched)
        break
      } catch (error) {
        console.warn(`Failed to export ${family} from ${provider} fonts`, error)
      }
    }
  }

  return { assets }
}
