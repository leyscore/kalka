// What the inspector panel says about the page before an element is picked: its title, address
// and preview image, the typefaces of its headings and text, and the colors it uses most.
import { hexColor } from './describe'

export interface Overview {
  title: string
  address: string
  image: string | null
  headings: string | null
  body: string | null
  colors: string[]
}

/** How many elements the page summary reads at most, so a huge page opens the inspector fast. */
const MAX_ELEMENTS = 4000
const MAX_COLORS = 12

/** The first family of a computed `font-family`, without its quotes. */
export function firstFamily(fontFamily: string): string | null {
  const family =
    fontFamily
      .split(',')[0]
      ?.trim()
      .replace(/^["']|["']$/g, '') ?? ''
  return family || null
}

/** The values seen most often first, each once; ties keep the order they were first seen. */
export function mostUsed(values: Iterable<string>, limit: number): string[] {
  const counts = new Map<string, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value]) => value)
}

/** An opaque computed color as hex, or null for transparent and translucent ones. */
function solid(color: string): string | null {
  const hex = hexColor(color)
  return /^#[0-9A-F]{6}$/.test(hex) ? hex : null
}

function previewImage(): string | null {
  const meta = document.querySelector<HTMLMetaElement>(
    'meta[property="og:image"], meta[name="og:image"], meta[name="twitter:image"], meta[property="twitter:image"]'
  )
  const content = meta?.content.trim()
  if (!content) return null
  try {
    return new URL(content, document.baseURI).href
  } catch {
    return null
  }
}

function shown(element: Element): boolean {
  const box = element.getBoundingClientRect()
  return box.width > 0 && box.height > 0
}

export function readOverview(): Overview {
  const elements = [...document.body.querySelectorAll('*')].slice(0, MAX_ELEMENTS).filter(shown)
  const colors: string[] = []
  const headingFonts: string[] = []
  const textFonts: string[] = []
  for (const element of elements) {
    const style = getComputedStyle(element)
    if (style.visibility === 'hidden') continue
    const background = solid(style.backgroundColor)
    if (background) colors.push(background)
    const hasText = [...element.childNodes].some(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
    )
    if (hasText) {
      const text = solid(style.color)
      if (text) colors.push(text)
      const family = firstFamily(style.fontFamily)
      if (family) (/^H[1-3]$/.test(element.tagName) ? headingFonts : textFonts).push(family)
    }
  }
  const page = solid(getComputedStyle(document.body).backgroundColor)
  return {
    title: document.title.trim() || location.hostname,
    address: `${location.hostname}${location.pathname === '/' ? '' : location.pathname}`,
    image: previewImage(),
    headings: mostUsed(headingFonts, 1)[0] ?? null,
    body: mostUsed(textFonts, 1)[0] ?? firstFamily(getComputedStyle(document.body).fontFamily),
    colors: mostUsed(page ? [page, ...colors] : colors, MAX_COLORS)
  }
}
