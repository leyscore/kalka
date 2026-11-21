import * as v from 'valibot'

/**
 * Fonts a document carries itself, so it draws the same offline and on a teammate's computer:
 * open-licence families downloaded from a catalogue, kept with their licence, and files someone
 * added by hand. They are saved with the document, in a `fonts/` folder beside its pages.
 */

/** One font file: a face, or part of one when a family is split by script (`unicodeRange`). */
export interface ProjectFontFace {
  /** The file's name inside its family's folder, such as `latin-wght-normal.woff2`. */
  file: string
  /** A weight such as `400`, or a variable font's range, such as `100 900`. */
  weight: string
  style: 'normal' | 'italic'
  /** The characters this file covers, as CSS `unicode-range`; absent means all of them. */
  unicodeRange?: string
  data: Uint8Array
}

/** Where a family came from: a free catalogue, or a file a person added. */
export const PROJECT_FONT_SOURCES = ['fontsource', 'file'] as const
export type ProjectFontSource = (typeof PROJECT_FONT_SOURCES)[number]

export interface ProjectFont {
  family: string
  source: ProjectFontSource
  /** The catalogue's id for the family, to fetch more of it later. */
  catalogueId?: string
  /** The licence's SPDX identifier, such as `OFL-1.1`; null for a file whose licence is unknown. */
  license: string | null
  /** The licence's text, kept beside the files as `LICENSE.txt`, as open licences require. */
  licenseText: string | null
  faces: ProjectFontFace[]
}

/** The folder a document's fonts are saved in, beside its pages. */
export const PROJECT_FONTS_DIR = 'fonts'
/** Lists each family's files, so the folder reads back without opening them. */
export const PROJECT_FONTS_MANIFEST = `${PROJECT_FONTS_DIR}/fonts.json`
/** `@font-face` rules for every file, for a page or site that uses the folder as it is. */
export const PROJECT_FONTS_STYLESHEET = `${PROJECT_FONTS_DIR}/fonts.css`
const LICENSE_FILE = 'LICENSE.txt'

/**
 * A family's name as a folder name: lowercase Latin letters and digits joined by `-`, other
 * scripts kept, so two families never share a folder unless their names differ only in case.
 */
export function projectFontSlug(family: string): string {
  return (
    family
      .normalize('NFKD')
      .replaceAll(/[̀-ͯ]+/g, '')
      .toLowerCase()
      .replaceAll(/[^\p{L}\p{N}]+/gu, '-')
      .replaceAll(/^-+|-+$/g, '') || 'font'
  )
}

/** A file name a face may have: no folders, nothing hidden, no way out of its family's folder. */
const FILE_NAME = /^[\p{L}\p{N}][\p{L}\p{N}._ -]*$/u

export function isProjectFontFileName(name: string): boolean {
  return FILE_NAME.test(name) && !name.includes('..') && name.length <= 160
}

const FaceSchema = v.object({
  file: v.pipe(v.string(), v.check(isProjectFontFileName, 'Unsafe font file name')),
  weight: v.pipe(v.string(), v.regex(/^\d{1,4}(?: \d{1,4})?$/)),
  style: v.picklist(['normal', 'italic']),
  unicodeRange: v.optional(v.pipe(v.string(), v.maxLength(4096)))
})

const FamilySchema = v.object({
  family: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
  source: v.picklist(PROJECT_FONT_SOURCES),
  catalogueId: v.optional(v.string()),
  license: v.nullable(v.string()),
  faces: v.array(FaceSchema)
})

const ManifestSchema = v.object({
  version: v.literal(1),
  families: v.array(v.unknown())
})

type SavedFamily = v.InferOutput<typeof FamilySchema>

/** A file of a document's fonts folder: its path from the document's folder, and its bytes. */
export interface ProjectFontFile {
  path: string
  content: Uint8Array
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()

/** A font file's format, as CSS `format()` names it. */
export type ProjectFontFormat = 'woff2' | 'woff' | 'opentype' | 'truetype'

const FORMATS: Partial<Record<string, ProjectFontFormat>> = {
  woff2: 'woff2',
  woff: 'woff',
  otf: 'opentype',
  ttf: 'truetype'
}

/** The CSS `format()` a face's file is in, from its extension. */
export function projectFontFormat(file: string): ProjectFontFormat {
  return FORMATS[file.slice(file.lastIndexOf('.') + 1).toLowerCase()] ?? 'truetype'
}

/** `@font-face` rules for the fonts, with each file's URL relative to the `fonts/` folder. */
export function projectFontStylesheet(fonts: Iterable<ProjectFont>): string {
  const rules: string[] = []
  for (const font of fonts) {
    const folder = projectFontSlug(font.family)
    for (const face of font.faces) {
      const declarations = [
        `font-family: ${JSON.stringify(font.family)};`,
        `src: url(${JSON.stringify(`${folder}/${face.file}`)}) format(${JSON.stringify(projectFontFormat(face.file))});`,
        `font-weight: ${face.weight};`,
        `font-style: ${face.style};`,
        'font-display: swap;'
      ]
      if (face.unicodeRange) declarations.push(`unicode-range: ${face.unicodeRange};`)
      rules.push(`@font-face {\n  ${declarations.join('\n  ')}\n}\n`)
    }
  }
  return rules.join('\n')
}

/**
 * A document's fonts as files, sorted by path: each family's faces and licence in a folder of
 * its own, a manifest that reads them back, and a stylesheet naming them all. None when the
 * document carries no fonts, so a folder without them gains no `fonts/` folder.
 */
export function projectFontFiles(fonts: ReadonlyMap<string, ProjectFont>): ProjectFontFile[] {
  if (fonts.size === 0) return []
  const families = [...fonts.values()].sort((a, b) => a.family.localeCompare(b.family, 'en'))
  const files: ProjectFontFile[] = []
  const manifest: SavedFamily[] = []
  for (const font of families) {
    const folder = `${PROJECT_FONTS_DIR}/${projectFontSlug(font.family)}`
    for (const face of font.faces)
      files.push({ path: `${folder}/${face.file}`, content: face.data })
    if (font.licenseText !== null)
      files.push({ path: `${folder}/${LICENSE_FILE}`, content: encoder.encode(font.licenseText) })
    const saved: SavedFamily = {
      family: font.family,
      source: font.source,
      license: font.license,
      faces: font.faces.map(({ file, weight, style, unicodeRange }) =>
        unicodeRange ? { file, weight, style, unicodeRange } : { file, weight, style }
      )
    }
    if (font.catalogueId) saved.catalogueId = font.catalogueId
    manifest.push(saved)
  }
  files.push({
    path: PROJECT_FONTS_MANIFEST,
    content: encoder.encode(`${JSON.stringify({ version: 1, families: manifest }, null, 2)}\n`)
  })
  files.push({
    path: PROJECT_FONTS_STYLESHEET,
    content: encoder.encode(projectFontStylesheet(families))
  })
  return files.sort((a, b) => a.path.localeCompare(b.path, 'en'))
}

/**
 * The fonts a document's files hold, by family, read from its fonts manifest. A family whose
 * files are missing keeps the faces that are there; one the manifest lists wrongly is skipped,
 * so a damaged fonts folder never stops the document from opening.
 */
export function readProjectFontFiles(
  files: ReadonlyMap<string, Uint8Array>
): Map<string, ProjectFont> {
  const fonts = new Map<string, ProjectFont>()
  const manifestBytes = files.get(PROJECT_FONTS_MANIFEST)
  if (!manifestBytes) return fonts
  const manifest = v.safeParse(
    v.pipe(v.string(), v.parseJson(), ManifestSchema),
    decoder.decode(manifestBytes)
  )
  if (!manifest.success) return fonts
  for (const entry of manifest.output.families) {
    const parsed = v.safeParse(FamilySchema, entry)
    if (!parsed.success || fonts.has(parsed.output.family)) continue
    const saved = parsed.output
    const folder = `${PROJECT_FONTS_DIR}/${projectFontSlug(saved.family)}`
    const faces: ProjectFontFace[] = []
    for (const face of saved.faces) {
      const data = files.get(`${folder}/${face.file}`)
      if (data) faces.push({ ...face, data })
    }
    if (faces.length === 0) continue
    const license = files.get(`${folder}/${LICENSE_FILE}`)
    const font: ProjectFont = {
      family: saved.family,
      source: saved.source,
      license: saved.license,
      licenseText: license ? decoder.decode(license) : null,
      faces
    }
    if (saved.catalogueId) font.catalogueId = saved.catalogueId
    fonts.set(font.family, font)
  }
  return fonts
}

/** True for a path the fonts folder writes, so a reader can tell fonts from other files. */
export function isProjectFontPath(path: string): boolean {
  return path === PROJECT_FONTS_DIR || path.startsWith(`${PROJECT_FONTS_DIR}/`)
}
