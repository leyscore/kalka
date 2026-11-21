import {
  isProjectFontFileName,
  parseFontStyle,
  type ProjectFont,
  type ProjectFontFace
} from '@kalka/scene-graph'

import { describeFontFile } from '#core/text/font/variation'

/** A file someone added: its name and bytes. */
export interface AddedFontFile {
  name: string
  data: Uint8Array
}

/** The font formats a document keeps, by the signature their files start with. */
const SIGNATURES: Record<string, string> = {
  wOF2: 'woff2',
  wOFF: 'woff',
  OTTO: 'otf',
  true: 'ttf',
  '\u0000\u0001\u0000\u0000': 'ttf'
}

/** The format a font file is in, from its first bytes; null for a file that is no font. */
export function fontFileFormat(data: Uint8Array): string | null {
  return SIGNATURES[String.fromCharCode(...data.subarray(0, 4))] ?? null
}

const LICENSE_FILE = /^(?:licen[cs]e|ofl|copying)(?:[._-].*)?\.(?:txt|md)$/i

/** A family's name from a file name such as `InterTight-SemiBoldItalic.woff2`. */
function familyFromFileName(name: string): { family: string; style: string; variable: boolean } {
  const stem = name.replace(/\.[^.]+$/, '')
  const variable = /\[[^\]]*wght[^\]]*\]|variable|-vf\b/i.test(stem)
  const [familyPart, ...styleParts] = stem.replace(/\[[^\]]*\]/g, '').split(/[-_]/)
  const family = familyPart
    .replaceAll(/(?<=[a-z])(?=[A-Z])/g, ' ')
    .replaceAll(/(?<=[A-Za-z])(?=\d)/g, ' ')
    .trim()
  return { family: family || stem, style: styleParts.join(' '), variable }
}

/** A face for `data`, read from the file itself when it can be, else from its name. */
function describe(file: AddedFontFile, format: string) {
  if (format === 'ttf' || format === 'otf') {
    const own = describeFontFile(file.data.slice().buffer)
    if (own) return own
  }
  const guessed = familyFromFileName(file.name)
  const parsed = parseFontStyle(guessed.style)
  return {
    family: guessed.family,
    weight: guessed.variable ? '100 900' : String(parsed.weight),
    style: parsed.italic ? ('italic' as const) : ('normal' as const)
  }
}

/** A file name a document may keep, made from `name` and the format it is in. */
function keptFileName(name: string, format: string, taken: Set<string>): string {
  const stem =
    name
      .replace(/\.[^.]+$/, '')
      .replaceAll(/[^\p{L}\p{N}._ -]+/gu, '-')
      .replaceAll(/^[^\p{L}\p{N}]+/gu, '') || 'font'
  let file = `${stem}.${format}`
  for (let count = 2; taken.has(file) || !isProjectFontFileName(file); count++)
    file = `${stem.slice(0, 120)}-${count}.${format}`
  taken.add(file)
  return file
}

/** The licence a licence file's text names, by SPDX identifier, when it is a known one. */
function licenseOf(text: string): string | null {
  if (/SIL OPEN FONT LICENSE/i.test(text)) return 'OFL-1.1'
  if (/Apache License,?\s+Version 2\.0/i.test(text)) return 'Apache-2.0'
  if (/UBUNTU FONT LICENCE/i.test(text)) return 'UFL-1.0'
  return null
}

export interface AddedFonts {
  fonts: ProjectFont[]
  /** Files that are no font Kalka can keep, by name. */
  rejected: string[]
}

/**
 * Families for font files someone added: TrueType, OpenType, WOFF and WOFF2, grouped by the
 * family each file names, or its file name says for a compressed file. A licence file added with
 * them is kept beside each family; without one the licence is unknown, for the person to check.
 */
export function fontsFromFiles(files: readonly AddedFontFile[]): AddedFonts {
  const byFamily = new Map<string, ProjectFont>()
  const rejected: string[] = []
  let licenseText: string | null = null
  const taken = new Map<string, Set<string>>()
  for (const file of files) {
    if (LICENSE_FILE.test(file.name)) {
      licenseText = new TextDecoder().decode(file.data)
      continue
    }
    const format = fontFileFormat(file.data)
    if (!format) {
      rejected.push(file.name)
      continue
    }
    const { family, weight, style } = describe(file, format)
    const font = byFamily.get(family) ?? {
      family,
      source: 'file' as const,
      license: null,
      licenseText: null,
      faces: []
    }
    const names = taken.get(family) ?? new Set<string>()
    taken.set(family, names)
    const face: ProjectFontFace = {
      file: keptFileName(file.name, format, names),
      weight,
      style,
      data: file.data
    }
    font.faces.push(face)
    byFamily.set(family, font)
  }
  const fonts = [...byFamily.values()]
  if (licenseText !== null)
    for (const font of fonts) {
      font.licenseText = licenseText
      font.license = licenseOf(licenseText)
    }
  return { fonts, rejected }
}

/**
 * `added` joined to the family the document already keeps under its name: its new files beside
 * the old ones, which a file of the same name replaces.
 */
export function mergeProjectFont(existing: ProjectFont | undefined, added: ProjectFont) {
  if (!existing || existing.source !== added.source) return added
  const files = new Set(added.faces.map((face) => face.file))
  return {
    ...existing,
    license: added.license ?? existing.license,
    licenseText: added.licenseText ?? existing.licenseText,
    faces: [...existing.faces.filter((face) => !files.has(face.file)), ...added.faces]
  }
}
