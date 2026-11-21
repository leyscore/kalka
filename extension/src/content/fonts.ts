// Puts the fonts a copy uses inside it. Kalka lays a paste out on its own page, and a site's font
// files usually refuse other sites, so a copy that only links them would be measured, and drawn,
// in a fallback font. The page itself may read them: the copy carries them as data URLs.

/** A font file the page loaded: only those are drawn, so only those come along. */
function loadedFonts(): Set<string> {
  return new Set(
    performance
      .getEntriesByType('resource')
      .map((entry) => entry.name)
      .filter((name) => /\.(?:woff2?|ttf|otf)(?:[?#]|$)/i.test(name))
  )
}

/** Fonts larger than this stay links: a copy is meant to fit in the clipboard. */
const MAX_FONT_BYTES = 1_500_000

async function dataURL(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { credentials: 'omit' })
    if (!response.ok) return null
    const blob = await response.blob()
    if (blob.size > MAX_FONT_BYTES) return null
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        resolve(typeof reader.result === 'string' ? reader.result : null)
      })
      reader.addEventListener('error', () => {
        resolve(null)
      })
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

const FONT_URL = /url\((["']?)(https?:[^"')]+)\1\)/g

/**
 * Replaces the links to the font files the page loaded with the files themselves, in the
 * copy's `<style>` blocks only. A font the page cannot fetch again stays a link.
 */
export async function inlineFonts(html: string): Promise<string> {
  const loaded = loadedFonts()
  const styles = [...html.matchAll(/<style>[\s\S]*?<\/style>/g)].map((match) => match[0])
  const urls = new Set(
    styles
      .flatMap((style) => [...style.matchAll(FONT_URL)].map((match) => match[2] ?? ''))
      .filter((url) => loaded.has(url))
  )
  if (urls.size === 0) return html
  const files = new Map<string, string>()
  await Promise.all(
    [...urls].map(async (url) => {
      const data = await dataURL(url)
      if (data) files.set(url, data)
    })
  )
  return html.replace(/<style>[\s\S]*?<\/style>/g, (style) =>
    style.replace(FONT_URL, (match, quote: string, url: string) => {
      const data = files.get(url)
      return data ? `url(${quote}${data}${quote})` : match
    })
  )
}
