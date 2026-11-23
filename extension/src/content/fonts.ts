// Puts the fonts a copy uses inside it. Kalka lays a paste out on its own page, and a site's font
// files usually refuse other sites, so a copy that only links them would be measured, and drawn,
// in a fallback font. The page itself may read them: the copy carries them as data URLs.
import { dataURL } from './data-url'

/** Every file the page loaded: only the fonts among them are drawn, so only those come along. */
function loadedFiles(): Set<string> {
  return new Set(performance.getEntriesByType('resource').map((entry) => entry.name))
}

/** Fonts larger than this stay links: a copy is meant to fit in the clipboard. */
const MAX_FONT_BYTES = 1_500_000

const FONT_URL = /url\((["']?)(https?:[^"')]+)\1\)/g

const FACE_RULE = /@font-face\s*\{[^}]*\}/g

/**
 * The files the `@font-face` rules of a copy's `<style>` blocks link. A font service names its
 * files without an extension, so the rule, not the name, says a file is a font.
 */
export function fontURLs(html: string): Set<string> {
  const urls = new Set<string>()
  for (const [style] of html.matchAll(/<style>[\s\S]*?<\/style>/g))
    for (const [rule] of style.matchAll(FACE_RULE))
      for (const match of rule.matchAll(FONT_URL)) if (match[2]) urls.add(match[2])
  return urls
}

/**
 * Replaces the links to the font files the page loaded with the files themselves, in the
 * `@font-face` rules of the copy's `<style>` blocks only. A font the page cannot fetch again
 * stays a link.
 */
export async function inlineFonts(html: string): Promise<string> {
  const loaded = loadedFiles()
  const urls = [...fontURLs(html)].filter((url) => loaded.has(url))
  if (urls.length === 0) return html
  const files = new Map<string, string>()
  await Promise.all(
    urls.map(async (url) => {
      const data = await dataURL(url, MAX_FONT_BYTES)
      if (data) files.set(url, data)
    })
  )
  return html.replace(/<style>[\s\S]*?<\/style>/g, (style) =>
    style.replace(FACE_RULE, (rule) =>
      rule.replace(FONT_URL, (match, quote: string, url: string) => {
        const data = files.get(url)
        return data ? `url(${quote}${data}${quote})` : match
      })
    )
  )
}
