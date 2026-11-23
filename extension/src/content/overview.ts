// What the inspector panel says about the page before an element is picked: its title, address
// and preview image, the typefaces of its headings and text, the colors it uses most, and its
// images, to open one at full size.
import { hexColor } from './describe'

export interface Overview {
  title: string
  address: string
  image: string | null
  headings: string | null
  body: string | null
  colors: string[]
  /** Addresses of the pictures and background images shown on the page. */
  images: string[]
}

/** How many elements the page summary reads at most, so a huge page opens the inspector fast. */
const MAX_ELEMENTS = 4000
const MAX_COLORS = 12
const MAX_IMAGES = 36
/** Images smaller than this on screen are icons and bullets, not pictures. */
const MIN_IMAGE = 40

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

/** The addresses in a computed `background-image`, gradients left out. */
export function backgroundUrls(value: string): string[] {
  return [...value.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/g)].flatMap((match) =>
    match[2] ? [match[2]] : []
  )
}

/** An address resolved against the page, or null when it is not one. */
function absolute(address: string): string | null {
  try {
    return new URL(address, document.baseURI).href
  } catch {
    return null
  }
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
  return content ? absolute(content) : null
}

function shown(element: Element): boolean {
  const box = element.getBoundingClientRect()
  return box.width > 0 && box.height > 0
}

/** Whether an element is drawn big enough to hold a picture rather than an icon. */
function large(element: Element): boolean {
  const box = element.getBoundingClientRect()
  return box.width >= MIN_IMAGE && box.height >= MIN_IMAGE
}

export function readOverview(): Overview {
  const elements = [...document.body.querySelectorAll('*')].slice(0, MAX_ELEMENTS).filter(shown)
  const colors: string[] = []
  const headingFonts: string[] = []
  const textFonts: string[] = []
  const images: string[] = []
  for (const element of elements) {
    const style = getComputedStyle(element)
    if (style.visibility === 'hidden') continue
    const background = solid(style.backgroundColor)
    if (background) colors.push(background)
    if (large(element)) {
      const sources =
        element instanceof HTMLImageElement
          ? [element.currentSrc || element.src]
          : backgroundUrls(style.backgroundImage)
      for (const source of sources) {
        const address = source ? absolute(source) : null
        if (address) images.push(address)
      }
    }
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
    colors: mostUsed(page ? [page, ...colors] : colors, MAX_COLORS),
    // In page order, each once: a logo strip repeated for its scroll would otherwise come first.
    images: [...new Map(images.map((address) => [address, true])).keys()].slice(0, MAX_IMAGES)
  }
}
