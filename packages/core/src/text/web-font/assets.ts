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
import {
  createProviderUnifont,
  isRemoteFontSource,
  type WebFontResolveOptions
} from '#core/text/web-font/providers'
import {
  WEB_FONT_PROVIDER_IDS,
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

async function resolveRemoteFontSource(
  family: string,
  request: WebFontFaceRequest,
  provider: WebFontProviderId
): Promise<{ source: RemoteFontSource; face: ResolveFontResult['fonts'][number] } | undefined> {
  const unifont = await createProviderUnifont(provider)
  const options = {
    weights: [String(request.weight)],
    styles: [request.style ?? 'normal'],
    formats: ['woff2', 'woff', 'ttf'],
    subsets: ['latin']
  } satisfies WebFontResolveOptions
  const result = await unifont.resolveFont(family, options)
  for (const face of result.fonts.toSorted(
    (a, b) => (a.meta?.priority ?? 0) - (b.meta?.priority ?? 0)
  )) {
    const source = face.src.find(isRemoteFontSource)
    if (source) return { source, face }
  }
  return undefined
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
  interVersion
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
        const resolved = await resolveRemoteFontSource(family, request, provider)
        if (!resolved) continue
        const response = await fetcher(resolved.source.url, resolved.face.meta?.init)
        if (!response.ok) continue
        const extension = fontAssetExtension(resolved.source)
        const path = `${assetBasePath}/${slugFontFamily(family)}-${request.weight}-${requestStyle}.${extension}`
        assets.push({
          family,
          weight: resolved.face.weight ?? request.weight,
          style: resolved.face.style ?? requestStyle,
          display: resolved.face.display,
          stretch: resolved.face.stretch,
          unicodeRange: resolved.face.unicodeRange,
          format: fontAssetFormat(resolved.source),
          path,
          content: new Uint8Array(await response.arrayBuffer())
        })
        break
      } catch (error) {
        console.warn(`Failed to export ${family} from ${provider} fonts`, error)
      }
    }
  }

  return { assets }
}
