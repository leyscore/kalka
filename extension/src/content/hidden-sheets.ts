// A stylesheet served from another site hides its rules from the page, and with them the
// `@font-face` rules that say which files draw the page's text. Where that site lets the page
// fetch the stylesheet again, its text gives those rules back.

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

/** Reads again the stylesheets that hide their rules, so a copy can take their fonts. */
export async function readHiddenSheets(): Promise<void> {
  const hidden = [...document.styleSheets]
    .filter((sheet) => hides(sheet))
    .map((sheet) => sheet.href)
    .filter((href): href is string => href !== null && !read.has(href))
  await Promise.all(
    hidden.map(async (href) => {
      try {
        const response = await fetch(href, { credentials: 'omit' })
        const css = response.ok ? await response.text() : ''
        read.set(href, css.length <= MAX_SHEET_BYTES ? sheetFaces(css, href) : [])
      } catch {
        // A site that refuses the page keeps its rules to itself.
        read.set(href, [])
      }
    })
  )
}

/** The font rules of a stylesheet that hides them, once `readHiddenSheets` read it. */
export function hiddenFaces(href: string | null): SheetFace[] {
  return href ? (read.get(href) ?? []) : []
}
