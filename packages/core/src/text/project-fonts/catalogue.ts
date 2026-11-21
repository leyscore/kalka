import * as v from 'valibot'

import type { ProjectFont, ProjectFontFace } from '@kalka/scene-graph'

import type { WebFontFetch } from '#core/text/web-fonts'

/**
 * Fontsource's catalogue: every Google Fonts family and other open-licence ones, each with its
 * licence. Kalka downloads only from it, and only families whose licence lets anyone keep and
 * share the files, so a document can carry them.
 */
const API = 'https://api.fontsource.org/v1'
const CDN = 'https://cdn.jsdelivr.net/fontsource/fonts'
const PACKAGES = 'https://cdn.jsdelivr.net/npm/@fontsource'

/** Licences that let a document keep a font's files and share them, by SPDX identifier. */
export const OPEN_FONT_LICENSES = [
  'OFL-1.1',
  'Apache-2.0',
  'UFL-1.0',
  'MIT',
  'CC0-1.0',
  'Unlicense'
]

const LICENSE_NAMES: Record<string, string> = {
  'OFL-1.1': 'SIL Open Font License 1.1',
  'Apache-2.0': 'Apache License 2.0',
  'UFL-1.0': 'Ubuntu Font Licence 1.0',
  MIT: 'MIT License',
  'CC0-1.0': 'Creative Commons Zero 1.0',
  Unlicense: 'The Unlicense'
}

/** A licence as SPDX spells it, whatever case the catalogue wrote it in. */
function spdxLicense(license: string): string {
  return OPEN_FONT_LICENSES.find((id) => id.toLowerCase() === license.toLowerCase()) ?? license
}

export function isOpenFontLicense(license: string | null | undefined): boolean {
  return !!license && OPEN_FONT_LICENSES.includes(spdxLicense(license))
}

/** A family of the catalogue, as a search lists it. */
export interface CatalogueFont {
  id: string
  family: string
  category: string
  license: string
  weights: number[]
  styles: Array<'normal' | 'italic'>
  variable: boolean
}

const StyleSchema = v.picklist(['normal', 'italic'])

const ListEntrySchema = v.object({
  id: v.string(),
  family: v.string(),
  category: v.optional(v.string(), ''),
  license: v.optional(v.string(), ''),
  weights: v.optional(v.array(v.number()), [400]),
  styles: v.optional(v.array(v.string()), ['normal']),
  variable: v.optional(v.boolean(), false)
})

const UrlsSchema = v.object({
  url: v.object({
    woff2: v.optional(v.string()),
    woff: v.optional(v.string()),
    ttf: v.optional(v.string())
  })
})

const DetailsSchema = v.object({
  id: v.string(),
  family: v.string(),
  license: v.optional(v.string(), ''),
  variable: v.optional(v.boolean(), false),
  defSubset: v.optional(v.string(), 'latin'),
  unicodeRange: v.optional(v.record(v.string(), v.string()), {}),
  variants: v.record(v.string(), v.record(v.string(), v.record(v.string(), UrlsSchema)))
})

const AxesSchema = v.object({
  axes: v.record(v.string(), v.object({ min: v.string(), max: v.string() }))
})

type Details = v.InferOutput<typeof DetailsSchema>

async function readJSON<T>(
  fetcher: WebFontFetch,
  url: string,
  schema: v.GenericSchema<unknown, T>,
  signal?: AbortSignal
): Promise<T> {
  const response = await fetcher(url, { signal })
  if (!response.ok) throw new Error(`The font catalogue answered ${response.status}`)
  const parsed = v.safeParse(v.pipe(v.string(), v.parseJson(), schema), await response.text())
  if (!parsed.success) throw new Error('The font catalogue sent something unexpected')
  return parsed.output
}

/** The catalogue's list, read once per fetcher: about two thousand families. */
const lists = new WeakMap<WebFontFetch, Promise<CatalogueFont[]>>()

function catalogueList(fetcher: WebFontFetch): Promise<CatalogueFont[]> {
  let list = lists.get(fetcher)
  if (!list) {
    list = readJSON(fetcher, `${API}/fonts`, v.array(v.unknown())).then((entries) =>
      entries.flatMap((entry) => {
        const parsed = v.safeParse(ListEntrySchema, entry)
        if (!parsed.success || !isOpenFontLicense(parsed.output.license)) return []
        const font = parsed.output
        return [
          {
            ...font,
            license: spdxLicense(font.license),
            styles: font.styles.filter((style): style is 'normal' | 'italic' =>
              v.is(StyleSchema, style)
            )
          }
        ]
      })
    )
    // A failed read is tried again next time rather than remembered.
    list.catch(() => lists.delete(fetcher))
    lists.set(fetcher, list)
  }
  return list
}

/** A name compared without case or accents. */
function folded(text: string): string {
  return text
    .normalize('NFKD')
    .replaceAll(/[̀-ͯ]+/g, '')
    .toLowerCase()
    .trim()
}

export interface FontSearchOptions {
  fetch: WebFontFetch
  limit?: number
  signal?: AbortSignal
}

/**
 * Open-licence families whose name holds `query`, the closest first: the exact name, then names
 * that start with it, then the rest in alphabetical order. An empty query lists the catalogue
 * from the start of the alphabet.
 */
export async function searchFontCatalogue(
  query: string,
  { fetch: fetcher, limit = 40, signal }: FontSearchOptions
): Promise<CatalogueFont[]> {
  const fonts = await catalogueList(fetcher)
  signal?.throwIfAborted()
  const wanted = folded(query)
  if (!wanted) return fonts.slice(0, limit)
  const rank = (font: CatalogueFont) => {
    const name = folded(font.family)
    if (name === wanted) return 0
    if (name.startsWith(wanted)) return 1
    return name.includes(wanted) ? 2 : -1
  }
  return fonts
    .map((font) => ({ font, rank: rank(font) }))
    .filter(({ rank }) => rank >= 0)
    .sort((a, b) => a.rank - b.rank || a.font.family.localeCompare(b.font.family))
    .slice(0, limit)
    .map(({ font }) => font)
}

/** The catalogue's family named `family`, compared without case; null when it has none. */
export async function findCatalogueFont(
  family: string,
  options: Omit<FontSearchOptions, 'limit'>
): Promise<CatalogueFont | null> {
  const wanted = folded(family)
  const fonts = await catalogueList(options.fetch)
  return fonts.find((font) => folded(font.family) === wanted) ?? null
}

/** Scripts every download covers, as the families that have them name them. */
const BASE_SUBSETS = [
  'latin',
  'latin-ext',
  'vietnamese',
  'cyrillic',
  'cyrillic-ext',
  'greek',
  'greek-ext'
]

function rangeCovers(unicodeRange: string, codePoint: number): boolean {
  return unicodeRange.split(',').some((part) => {
    const [start, end = start] = part.trim().replace(/^U\+/i, '').split('-')
    return (
      codePoint >= Number.parseInt(start.replaceAll('?', '0'), 16) &&
      codePoint <= Number.parseInt(end.replaceAll('?', 'F'), 16)
    )
  })
}

/** The catalogue's `unicodeRange` key for a subset: numbered chunks are written `[n]`. */
function rangeOf(details: Details, subset: string): string | undefined {
  return details.unicodeRange[subset] ?? details.unicodeRange[`[${subset}]`]
}

/**
 * The files of a family to keep: its main script, the Latin, Greek and Cyrillic ones it has, and
 * any other, such as a chunk of a Japanese family, that holds a character of `characters`.
 */
function chosenSubsets(details: Details, available: readonly string[], characters: string) {
  const codePoints = [...new Set(characters)].flatMap((char) => char.codePointAt(0) ?? [])
  return available.filter((subset) => {
    if (subset === details.defSubset || BASE_SUBSETS.includes(subset)) return true
    const range = rangeOf(details, subset)
    return !!range && codePoints.some((codePoint) => rangeCovers(range, codePoint))
  })
}

export interface FontDownloadOptions {
  fetch: WebFontFetch
  /** Text the document uses, so files for its other scripts come too. */
  characters?: string
  signal?: AbortSignal
}

async function download(fetcher: WebFontFetch, url: string, signal?: AbortSignal) {
  const response = await fetcher(url, { signal })
  if (!response.ok) throw new Error(`Could not download ${url} (${response.status})`)
  return new Uint8Array(await response.arrayBuffer())
}

/** The licence's text from the family's package, or a note naming it when that cannot be read. */
async function licenseText(
  fetcher: WebFontFetch,
  details: Details,
  license: string,
  signal?: AbortSignal
): Promise<string> {
  try {
    const response = await fetcher(`${PACKAGES}/${details.id}/LICENSE`, { signal })
    if (response.ok) {
      const text = await response.text()
      if (text.trim()) return text
    }
  } catch (error) {
    if (signal?.aborted) throw error
  }
  return [
    `${details.family} is licensed under the ${LICENSE_NAMES[license] ?? license} (${license}).`,
    `The licence's text: https://spdx.org/licenses/${license}.html`,
    `Downloaded from Fontsource: https://fontsource.org/fonts/${details.id}`,
    ''
  ].join('\n')
}

/** The axis files a variable family is served as: the weight axis alone, or every axis. */
async function variableAxis(fetcher: WebFontFetch, id: string, signal?: AbortSignal) {
  const { axes } = await readJSON(fetcher, `${API}/variable/${id}`, AxesSchema, signal)
  const wght = axes.wght
  const others = Object.keys(axes).filter((axis) => axis !== 'wght' && axis !== 'ital')
  return {
    file: others.length > 0 || !wght ? 'standard' : 'wght',
    weight: wght ? `${Number(wght.min)} ${Number(wght.max)}` : '400'
  }
}

async function variableFaces(
  fetcher: WebFontFetch,
  details: Details,
  characters: string,
  signal?: AbortSignal
): Promise<ProjectFontFace[] | null> {
  const axis = await variableAxis(fetcher, details.id, signal).catch((error: unknown) => {
    if (signal?.aborted) throw error
    return null
  })
  if (!axis) return null
  const faces: ProjectFontFace[] = []
  for (const style of ['normal', 'italic'] as const) {
    const anyWeight = Object.values(details.variants).find((styles) => styles[style])
    if (!anyWeight) continue
    for (const subset of chosenSubsets(details, Object.keys(anyWeight[style]), characters)) {
      const file = `${subset}-${axis.file}-${style}.woff2`
      const url = `${CDN}/${details.id}:vf@latest/${encodeURIComponent(subset)}-${axis.file}-${style}.woff2`
      const response = await fetcher(url, { signal })
      // A family whose variable files are not all served falls back to its static ones.
      if (!response.ok) return null
      const range = rangeOf(details, subset)
      faces.push({
        file,
        weight: axis.weight,
        style,
        ...(range ? { unicodeRange: range } : {}),
        data: new Uint8Array(await response.arrayBuffer())
      })
    }
  }
  return faces.length > 0 ? faces : null
}

async function staticFaces(
  fetcher: WebFontFetch,
  details: Details,
  characters: string,
  signal?: AbortSignal
): Promise<ProjectFontFace[]> {
  const faces: ProjectFontFace[] = []
  for (const [weight, styles] of Object.entries(details.variants)) {
    for (const [style, subsets] of Object.entries(styles)) {
      if (!v.is(StyleSchema, style)) continue
      for (const subset of chosenSubsets(details, Object.keys(subsets), characters)) {
        const url = subsets[subset].url.woff2 ?? subsets[subset].url.woff
        if (!url) continue
        const extension = url.endsWith('.woff') ? 'woff' : 'woff2'
        const range = rangeOf(details, subset)
        faces.push({
          file: `${subset}-${weight}-${style}.${extension}`,
          weight,
          style,
          ...(range ? { unicodeRange: range } : {}),
          data: await download(fetcher, url, signal)
        })
      }
    }
  }
  return faces
}

async function catalogueDetails(fetcher: WebFontFetch, id: string, signal?: AbortSignal) {
  const details = await readJSON(
    fetcher,
    `${API}/fonts/${encodeURIComponent(id)}`,
    DetailsSchema,
    signal
  )
  const license = spdxLicense(details.license)
  if (!isOpenFontLicense(license))
    throw new Error(`${details.family} is not under an open licence Kalka can download`)
  return { details, license }
}

/**
 * Downloads a catalogue family for a document to keep: every weight and style, as one variable
 * file per script when the family has one, with its licence's text. Only open licences are
 * downloaded; another licence is refused.
 */
export async function downloadCatalogueFont(
  id: string,
  { fetch: fetcher, characters = '', signal }: FontDownloadOptions
): Promise<ProjectFont> {
  const { details, license } = await catalogueDetails(fetcher, id, signal)
  const faces =
    (details.variable ? await variableFaces(fetcher, details, characters, signal) : null) ??
    (await staticFaces(fetcher, details, characters, signal))
  if (faces.length === 0) throw new Error(`${details.family} has no files to download`)
  return {
    family: details.family,
    source: 'fontsource',
    catalogueId: details.id,
    license,
    licenseText: await licenseText(fetcher, details, license, signal),
    faces
  }
}

/** A file to install on a computer: a whole face as TrueType, which every system reads. */
export interface InstallableFontFile {
  name: string
  data: Uint8Array
}

/**
 * A catalogue family as TrueType files to install on a computer, one per weight and style of
 * its main script: systems take TrueType, not the web files a document keeps.
 */
export async function downloadInstallableFont(
  id: string,
  { fetch: fetcher, signal }: Omit<FontDownloadOptions, 'characters'>
): Promise<InstallableFontFile[]> {
  const { details } = await catalogueDetails(fetcher, id, signal)
  const files: InstallableFontFile[] = []
  const name = details.family.replaceAll(/[^\p{L}\p{N}]+/gu, '')
  for (const [weight, styles] of Object.entries(details.variants)) {
    for (const [style, subsets] of Object.entries(styles)) {
      const url = subsets[details.defSubset]?.url.ttf
      if (!url) continue
      files.push({
        name: `${name}-${weight}${style === 'italic' ? 'Italic' : ''}.ttf`,
        data: await download(fetcher, url, signal)
      })
    }
  }
  return files
}
