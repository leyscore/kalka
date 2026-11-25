import type {
  WebFontFaceAsset,
  WebFontFaceRequest,
  WebFontFaceResolver
} from '@kalka/dom-css/export'
import {
  projectFontFormat,
  projectFontSlug,
  type InterVersion,
  type ProjectFont,
  type ProjectFontFace
} from '@kalka/scene-graph'

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
 * document keeping Figma's Inter (`interVersion`), `Inter` is Kalka's Inter 3.19. A page someone
 * keeps names no fallback family, so it ships only its text's own faces (`fallbacks: false`).
 * A file that serves several weights ships once, for the range of them. With the `text` the page
 * draws, a face from the providers ships a file for each script that text is written in.
 */
export function loadedFontFaceAssets(
  interVersion: InterVersion,
  { fallbacks: withFallbacks = true, text }: { fallbacks?: boolean; text?: string } = {}
) {
  return async (fonts: WebFontFaceRequest[], assetBasePath: string) => {
    const fallbacks = withFallbacks
      ? fontManager
          .fallbackFamilies()
          .filter((family) => fontManager.loadedFontSource(family, 'Regular') !== 'fallback')
          .map((family): WebFontFaceRequest => ({ family, weight: 400, style: 'normal' }))
      : []
    const assets: WebFontFaceAsset[] = []
    const shipped = new Map<string, { asset: WebFontFaceAsset; weights: number[] }>()
    const files = new Map<ArrayBuffer, number>()
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
      const file = files.get(data) ?? files.size
      files.set(data, file)
      const key = `${request.family}|${style}|${file}`
      const served = shipped.get(key)
      if (served) {
        served.weights.push(request.weight)
        served.asset.weight = [Math.min(...served.weights), Math.max(...served.weights)]
        continue
      }
      const content = new Uint8Array(data)
      const { format, extension } = fileFormat(content)
      const asset: WebFontFaceAsset = {
        family: request.family,
        weight: request.weight,
        style,
        format,
        path: `${assetBasePath}/${slugFontFamily(request.family)}-${request.weight}-${style}.${extension}`,
        content
      }
      shipped.set(key, { asset, weights: [request.weight] })
      assets.push(asset)
    }
    if (missing.length === 0) return assets
    const fetched = await exportWebFontFaceAssets({
      fonts: missing,
      assetBasePath,
      interVersion,
      text
    })
    return [...assets, ...fetched.assets]
  }
}

/** Whether a face of a document's font serves a weight: its own, or within a variable range. */
function servesWeight(face: ProjectFontFace, weight: number): boolean {
  const [from, to = from] = face.weight.split(' ').map(Number)
  return weight >= from && weight <= to
}

/** The faces of a document's font a request uses: every file of its weight and style. */
function projectFaceAssets(
  font: ProjectFont,
  request: WebFontFaceRequest,
  assetBasePath: string
): WebFontFaceAsset[] {
  const style = request.style ?? 'normal'
  const matching = font.faces.filter((face) => face.style === style)
  const exact = matching.filter((face) => servesWeight(face, request.weight))
  // A weight the family lacks draws with its nearest, as the canvas does.
  const distance = (face: ProjectFontFace) =>
    Math.abs(Number(face.weight.split(' ')[0]) - request.weight)
  const nearest = Math.min(...matching.map(distance))
  const faces = exact.length > 0 ? exact : matching.filter((face) => distance(face) === nearest)
  const folder = `${assetBasePath}/${projectFontSlug(font.family)}`
  return faces.map((face) => ({
    family: font.family,
    weight: face.weight,
    style,
    format: projectFontFormat(face.file),
    ...(face.unicodeRange ? { unicodeRange: face.unicodeRange.split(',') } : {}),
    path: `${folder}/${face.file}`,
    content: face.data
  }))
}

/**
 * Ships the fonts a document carries, as files beside the page or in it, before `fallback`
 * resolves the faces they do not cover: an exported page draws as the canvas does, offline and
 * without asking a font service. Each file is shipped once, however many weights it serves.
 */
export function withProjectFonts(
  fonts: ReadonlyMap<string, ProjectFont>,
  fallback: WebFontFaceResolver | 'none'
): WebFontFaceResolver | 'none' {
  if (fonts.size === 0) return fallback
  return async (requests, assetBasePath) => {
    const assets = new Map<string, WebFontFaceAsset>()
    const rest: WebFontFaceRequest[] = []
    for (const request of requests) {
      const font = fonts.get(request.family)
      if (!font) {
        rest.push(request)
        continue
      }
      for (const asset of projectFaceAssets(font, request, assetBasePath))
        if (!assets.has(asset.path)) assets.set(asset.path, asset)
    }
    const others =
      fallback === 'none' || rest.length === 0 ? [] : await fallback(rest, assetBasePath)
    return [...assets.values(), ...others]
  }
}
