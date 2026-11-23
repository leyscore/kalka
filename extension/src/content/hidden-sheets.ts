// A stylesheet served from another site hides its rules from the page, and with them the
// `@font-face` rules that say which files draw the page's text. Where that site lets the page
// fetch the stylesheet again, its text gives those rules back; where it does not, the extension
// reads it.
import type { ReadFiles } from './data-url'

/** A `@font-face` rule read from a stylesheet's text. */
export interface SheetFace {
  family: string
  /** The rule, with its font files' addresses made absolute. */
  rule: string
}

const FACE_RULE = /@font-face\s*\{[^}]*\}/g
const FAMILY = /font-family\s*:\s*([^;}]+)/i
const URL_VALUE = /url\(\s*(["']?)([^"')]+)\1\s*\)/g

/** The `@font-face` rules in a stylesheet's text, as they read from the address it came from. */
export function sheetFaces(css: string, base: string): SheetFace[] {
  const faces: SheetFace[] = []
  for (const [rule] of css.matchAll(FACE_RULE)) {
    const family = FAMILY.exec(rule)?.[1]
      ?.trim()
      .replace(/^["']|["']$/g, '')
    if (!family) continue
    faces.push({
      family,
      rule: rule.replace(URL_VALUE, (match, _quote: string, url: string) => {
        if (url.startsWith('data:')) return match
        try {
          return `url("${new URL(url, base).href}")`
        } catch {
          return match
        }
      })
    })
  }
  return faces
}

/** Stylesheets longer than this are not read again: font rules live in short ones. */
const MAX_SHEET_BYTES = 3_000_000

const read = new Map<string, SheetFace[]>()

function hides(sheet: CSSStyleSheet): boolean {
  try {
    void sheet.cssRules
    return false
  } catch {
    return true
  }
}

async function fetched(href: string): Promise<string | null> {
  try {
    const response = await fetch(href, { credentials: 'omit' })
    return response.ok ? await response.text() : null
  } catch {
    // A site that refuses the page keeps its rules from it.
    return null
  }
}

/**
 * Reads again the stylesheets that hide their rules, so a copy can take their fonts: the page
 * fetches them, and `readFiles` reads the ones their site refuses to the page.
 */
export async function readHiddenSheets(readFiles?: ReadFiles): Promise<void> {
  const hidden = [...document.styleSheets]
    .filter((sheet) => hides(sheet))
    .map((sheet) => sheet.href)
    .filter((href): href is string => href !== null && !read.has(href))
  const texts = new Map<string, string>()
  await Promise.all(
    hidden.map(async (href) => {
      const css = await fetched(href)
      if (css !== null) texts.set(href, css)
    })
  )
  const refused = hidden.filter((href) => !texts.has(href))
  if (readFiles && refused.length > 0) {
    // Without the extension's reading, those stylesheets keep their rules.
    const again = await readFiles(refused, 'text').catch(() => ({}))
    for (const [href, css] of Object.entries(again)) texts.set(href, css)
  }
  for (const href of hidden) {
    const css = texts.get(href) ?? ''
    read.set(href, css.length <= MAX_SHEET_BYTES ? sheetFaces(css, href) : [])
  }
}

/** The font rules of a stylesheet that hides them, once `readHiddenSheets` read it. */
export function hiddenFaces(href: string | null): SheetFace[] {
  return href ? (read.get(href) ?? []) : []
}
