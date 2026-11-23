// Turns an element of the page into standalone HTML: a copy of its subtree where each element
// carries the styles the browser computed for it, URLs made absolute, pseudo-elements turned
// into real elements and the fonts it uses declared. Kalka pastes that HTML as editable layers;
// any other editor reads it as plain HTML and CSS.
import {
  finalDeclarations,
  parseDeclarations,
  shifted,
  statesOrigin,
  unplaced,
  writeDeclarations
} from './declarations'
import type { Shots } from './shots'

/** How the styles are written: inline on each element (Kalka) or as classes in a stylesheet. */
export type CaptureFormat = 'kalka' | 'html'

export interface Capture {
  html: string
  /** Elements in the copy, the layers Kalka will build. */
  layers: number
  images: number
  fonts: string[]
  /** Parts that could not come along as they are, such as a frame from another site. */
  replaced: number
}

/** The properties that decide how an element looks and lays out. */
export const PROPERTIES = [
  'display',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'z-index',
  'box-sizing',
  'width',
  'height',
  'min-width',
  'min-height',
  'max-width',
  'max-height',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'flex-direction',
  'flex-wrap',
  'justify-content',
  'align-items',
  'justify-items',
  'align-content',
  'align-self',
  'justify-self',
  'flex-grow',
  'flex-shrink',
  'flex-basis',
  'order',
  'gap',
  'row-gap',
  'column-gap',
  'grid-template-columns',
  'grid-template-rows',
  // The names `grid-column: hero` places by, and the direction the unplaced ones fill in.
  'grid-template-areas',
  'grid-auto-flow',
  'grid-column',
  'grid-row',
  'overflow',
  'color',
  'background-color',
  'background-image',
  'background-size',
  'background-position',
  'background-repeat',
  'border-top',
  'border-right',
  'border-bottom',
  'border-left',
  'border-radius',
  'box-shadow',
  'opacity',
  'visibility',
  'transform',
  'translate',
  'rotate',
  'scale',
  'transform-origin',
  'filter',
  'backdrop-filter',
  'mix-blend-mode',
  'clip-path',
  'mask-image',
  'mask-size',
  'mask-position',
  'mask-repeat',
  'object-fit',
  'object-position',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'font-stretch',
  'font-feature-settings',
  'font-variation-settings',
  'font-variant-numeric',
  'font-variant-ligatures',
  'font-kerning',
  'line-height',
  'letter-spacing',
  'text-align',
  'text-transform',
  'text-decoration',
  'white-space',
  'text-wrap-mode',
  'text-wrap-style',
  'word-break',
  'overflow-wrap',
  'hyphens',
  'text-indent',
  'word-spacing',
  'text-overflow',
  'list-style-type',
  'vertical-align',
  'aspect-ratio'
] as const

/** Inherited properties: written only where they change from the parent. */
const INHERITED = new Set<string>([
  'color',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'font-stretch',
  'font-feature-settings',
  'font-variation-settings',
  'font-variant-numeric',
  'font-variant-ligatures',
  'font-kerning',
  'line-height',
  'letter-spacing',
  'text-align',
  'text-transform',
  'white-space',
  'text-wrap-mode',
  'text-wrap-style',
  'word-break',
  'overflow-wrap',
  'hyphens',
  'text-indent',
  'word-spacing',
  'list-style-type',
  'visibility'
])

// A `<source>` only offers its parent files to choose from: the copy keeps the one chosen.
const DROPPED_TAGS = new Set([
  'SCRIPT',
  'NOSCRIPT',
  'STYLE',
  'LINK',
  'META',
  'TEMPLATE',
  'SOURCE',
  'TRACK'
])

/** Elements whose size is their own, not their content's: they keep a width and height. */
const SIZED = new Set([
  'IMG',
  'SVG',
  'VIDEO',
  'CANVAS',
  'INPUT',
  'TEXTAREA',
  'SELECT',
  'IFRAME',
  'HR',
  'BUTTON'
])

/**
 * The browser's own style for each tag, read in an empty document: what a pasted element gets
 * without the page's stylesheets, so what the copy must write when the page says otherwise.
 */
class BrowserDefaults {
  private readonly frame = document.createElement('iframe')
  private readonly byTag = new Map<string, Map<string, string>>()

  constructor() {
    this.frame.setAttribute('aria-hidden', 'true')
    this.frame.style.cssText =
      'position: fixed; width: 0; height: 0; border: 0; visibility: hidden; pointer-events: none'
    document.documentElement.append(this.frame)
  }

  of(tag: string): Map<string, string> {
    const known = this.byTag.get(tag)
    if (known) return known
    const values = new Map<string, string>()
    const doc = this.frame.contentDocument
    const view = this.frame.contentWindow
    if (doc && view) {
      // A link is styled as one only with an address.
      const [name = 'div', link] = tag.split('[')
      const element = doc.createElement(name)
      if (link) element.setAttribute('href', '#')
      doc.body.append(element)
      const style = view.getComputedStyle(element)
      for (const property of PROPERTIES) values.set(property, style.getPropertyValue(property))
      element.remove()
    }
    this.byTag.set(tag, values)
    return values
  }

  release(): void {
    this.frame.remove()
  }
}

/** Whether anything turns, scales or moves the element: only then does its origin matter. */
function transformed(style: CSSStyleDeclaration): boolean {
  return statesOrigin([style.transform, style.translate, style.rotate, style.scale])
}

/** A value an animation left a hair away from its rest, which would only add noise. */
/** A transform matrix that moves nothing by more than half a pixel. */
function nearIdentity(value: string): boolean {
  const matrix = /^matrix\(([^)]*)\)$/.exec(value)
  if (!matrix) return false
  const [a = 0, b = 0, c = 0, d = 0, e = 0, f = 0] = (matrix[1] ?? '').split(',').map(Number)
  const unit = [a - 1, b, c, d - 1].every((part) => Math.abs(part) < 0.005)
  return unit && Math.abs(e) < 0.5 && Math.abs(f) < 0.5
}

function settled(property: string, value: string): string | null {
  if (property === 'opacity' && Number(value) >= 0.99) return null
  const faintBlur = /^blur\((0(\.\d+)?)px\)$/.test(value) && Number.parseFloat(value.slice(5)) < 0.2
  if (property === 'filter' && faintBlur) return null
  if (property === 'transform' && nearIdentity(value)) return null
  return value
}

/** Which of an element's sizes the copy writes. */
interface Sized {
  width: boolean
  height: boolean
}

/**
 * Which of an element's sizes the page's CSS sets rather than its content: each is set back to
 * `auto` for a moment, and a size that changes was the page's. The element's own style comes
 * back exactly as it was.
 */
function explicitSize(element: Element): Sized {
  if (!(element instanceof HTMLElement)) return { width: false, height: false }
  const before = { width: element.offsetWidth, height: element.offsetHeight }
  const attribute = element.getAttribute('style')
  const changes = (property: 'width' | 'height') => {
    element.style.setProperty(property, 'auto', 'important')
    const after = property === 'width' ? element.offsetWidth : element.offsetHeight
    if (attribute === null) element.removeAttribute('style')
    else element.setAttribute('style', attribute)
    return Math.abs(after - before[property]) > 0.5
  }
  return { width: changes('width'), height: changes('height') }
}

/**
 * The declarations an element's copy needs: every property where the page's value differs from
 * what the browser would give that tag on its own. An inherited property is written where it
 * changes from the parent, or where the browser styles the tag itself (a heading's weight, a
 * link's color), since the copy cannot count on the parent there.
 */
/** What the copy may leave out because the pasted element gets it anyway. */
interface Baseline {
  style: CSSStyleDeclaration
  parent: CSSStyleDeclaration | null
  own: Map<string, string>
  plain: Map<string, string>
}

/** Whether a property's value is what the pasted element would get without being told. */
function given(property: string, value: string, base: Baseline): boolean {
  // Its default is the middle of each box, so the tag's own value says nothing about this one.
  if (property === 'transform-origin') return !transformed(base.style)
  if (INHERITED.has(property)) {
    const tagSetsIt = base.own.get(property) !== base.plain.get(property)
    return !!base.parent && !tagSetsIt && base.parent.getPropertyValue(property) === value
  }
  if (property === 'display') return false
  if (base.own.get(property) === value) return true
  // A border drawn by neither: only its color, which follows the text, differs.
  return (
    property.startsWith('border-') &&
    value.includes(' none') &&
    !!base.own.get(property)?.includes(' none')
  )
}

function declarations(
  style: CSSStyleDeclaration,
  parent: CSSStyleDeclaration | null,
  tag: string,
  defaults: BrowserDefaults,
  sized: Sized = { width: true, height: true }
): string {
  const base: Baseline = { style, parent, own: defaults.of(tag), plain: defaults.of('div') }
  const out: string[] = []
  for (const property of PROPERTIES) {
    // Other boxes size to their content and their layout, as on the page.
    if ((property === 'width' && !sized.width) || (property === 'height' && !sized.height)) continue
    const value = settled(property, style.getPropertyValue(property))
    if (!value || given(property, value, base)) continue
    out.push(`${property}: ${value}`)
  }
  return out.join('; ')
}

/** The text a `content` value draws, or null when the pseudo-element draws none. */
export function pseudoText(content: string): string | null {
  if (!content || content === 'none' || content === 'normal') return null
  const quoted = /^["'](.*)["']$/s.exec(content)
  return quoted ? (quoted[1] ?? '').replace(/\\"/g, '"') : ''
}

function absolute(url: string): string {
  try {
    return new URL(url, document.baseURI).href
  } catch {
    return url
  }
}

interface Walk {
  layers: number
  images: number
  replaced: number
  families: Set<string>
  rules: string[]
  format: CaptureFormat
  /** Elements to keep even where the page does not show them, hidden: see `captureElement`. */
  keep: ReadonlySet<Element>
  defaults: BrowserDefaults
  /** Pictures of canvases that keep their pixels to themselves, such as WebGL ones. */
  canvases: ReadonlyMap<Element, string>
}

/** How an element the page hides at this width is written: hidden, taking no room. */
const HIDDEN = 'display: block; visibility: hidden; position: absolute'

function applyStyle(target: Element, style: string, walk: Walk): void {
  if (!style) return
  if (walk.format === 'kalka') {
    target.setAttribute('style', style)
    return
  }
  const name = `k${walk.rules.length + 1}`
  walk.rules.push(`.${name} { ${style} }`)
  target.setAttribute('class', name)
}

function pseudo(
  source: Element,
  which: '::before' | '::after',
  parent: CSSStyleDeclaration,
  walk: Walk
): Element | null {
  const style = getComputedStyle(source, which)
  const text = pseudoText(style.getPropertyValue('content'))
  if (text === null) return null
  const span = document.createElement('span')
  span.textContent = text
  applyStyle(span, declarations(style, parent, 'span', walk.defaults), walk)
  walk.layers++
  return span
}

/** A stand-in that keeps the place and size of a part that cannot come along. */
function placeholder(source: Element, label: string, walk: Walk): Element {
  const box = source.getBoundingClientRect()
  const div = document.createElement('div')
  div.textContent = label
  applyStyle(
    div,
    `width: ${box.width}px; height: ${box.height}px; display: flex; align-items: center; justify-content: center; background-color: #E4E6EE; color: #4A4F63; font-size: 12px`,
    walk
  )
  walk.replaced++
  walk.layers++
  return div
}

/** Parts that cannot come along as they are: frames, videos without a poster and canvases. */
function copyReplaced(
  source: Element,
  style: CSSStyleDeclaration,
  parent: CSSStyleDeclaration | null,
  walk: Walk
): Element | null {
  if (source instanceof HTMLIFrameElement) return placeholder(source, absolute(source.src), walk)
  if (source instanceof HTMLVideoElement && !source.poster)
    return placeholder(source, 'Video', walk)
  if (!(source instanceof HTMLCanvasElement)) return null
  try {
    const image = document.createElement('img')
    image.src = walk.canvases.get(source) ?? source.toDataURL('image/png')
    applyStyle(image, finalDeclarations(declarations(style, parent, 'img', walk.defaults)), walk)
    walk.layers++
    walk.images++
    return image
  } catch {
    return placeholder(source, 'Canvas', walk)
  }
}

/** Keeps only attributes that mean something outside the page: no handlers, ids or page styles. */
function copyAttributes(copy: Element, source: Element, walk: Walk): void {
  for (const name of copy.getAttributeNames()) {
    if (name.startsWith('on') || name === 'id' || name === 'class' || name === 'style') {
      copy.removeAttribute(name)
    }
  }
  if (copy instanceof HTMLImageElement && source instanceof HTMLImageElement) {
    copy.src = absolute(source.currentSrc || source.src)
    for (const name of ['srcset', 'sizes', 'loading']) copy.removeAttribute(name)
    walk.images++
  }
  if (copy instanceof HTMLAnchorElement && source instanceof HTMLAnchorElement) {
    copy.href = source.href
  }
  if (copy instanceof HTMLInputElement && source instanceof HTMLInputElement) {
    copy.setAttribute('value', source.value)
  }
  // A layer keeps the page's name for it: Kalka names layers after their classes.
  if (walk.format === 'kalka' && source.classList.length > 0) {
    copy.setAttribute('class', [...source.classList].join(' '))
  }
}

/**
 * How an SVG sits among its siblings, which the page's stylesheets set and which do not come
 * along: an icon beside wrapping text keeps its size only with `flex-shrink: 0`, and one centred
 * with `translate(-50%)` its place only with its transform.
 */
const SVG_PLACEMENT: readonly string[] = [
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'z-index',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'align-self',
  'justify-self',
  'flex-grow',
  'flex-shrink',
  'flex-basis',
  'order',
  'grid-column',
  'grid-row',
  'opacity',
  'transform',
  'translate',
  'rotate',
  'scale',
  'transform-origin'
]

/** The element a copy starts from, before its attributes, style and children. */
function emptyCopy(source: Element): Node {
  // A video is its poster, and the page's body a box that pasted markup can hold.
  if (source instanceof HTMLVideoElement)
    return Object.assign(document.createElement('img'), { src: absolute(source.poster) })
  return pageRoot(source.localName) ? document.createElement('div') : source.cloneNode(false)
}

/** An SVG keeps its own markup at its size; its paint is in its attributes. */
function copySVG(source: Element, style: CSSStyleDeclaration, walk: Walk): Element | null {
  if (source.tagName.toLowerCase() !== 'svg') return null
  const svg = source.cloneNode(true)
  if (!(svg instanceof Element)) return null
  const box = source.getBoundingClientRect()
  svg.setAttribute('width', String(box.width))
  svg.setAttribute('height', String(box.height))
  const base = walk.defaults.of('svg')
  const placement = SVG_PLACEMENT.flatMap((property) => {
    if (property === 'transform-origin' && !transformed(style)) return []
    const value = settled(property, style.getPropertyValue(property))
    return value && base.get(property) !== value ? [`${property}: ${value}`] : []
  })
  applyStyle(svg, finalDeclarations([`color: ${style.color}`, ...placement].join('; ')), walk)
  paintSVG(source, svg)
  return svg
}

/** The paint an SVG's shapes take from the page's stylesheets, which do not come along. */
const SVG_PAINT = [
  'fill',
  'fill-opacity',
  'stroke',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-opacity',
  'opacity'
] as const

/** Writes each shape's computed paint on its copy, so the drawing looks as it did on the page. */
function paintSVG(source: Element, copy: Element): void {
  const sources = [...source.querySelectorAll('*')]
  const copies = [...copy.querySelectorAll('*')]
  sources.forEach((shape, index) => {
    const target = copies[index]
    if (!target || target.localName !== shape.localName) return
    const style = getComputedStyle(shape)
    const paint = SVG_PAINT.map((property) => `${property}: ${style.getPropertyValue(property)}`)
    const own = target.getAttribute('style')
    target.setAttribute('style', [...(own ? [own] : []), ...paint].join('; '))
  })
}

/** The styles written on an element's copy. */
function elementStyle(
  source: Element,
  style: CSSStyleDeclaration,
  parent: CSSStyleDeclaration | null,
  defaults: BrowserDefaults
): string {
  const tag = source.tagName.toUpperCase()
  // An empty box, such as an icon's or a divider's, has no content to size it: it keeps its own.
  const empty = source.children.length === 0 && !source.textContent?.trim()
  // A positioned box gets its four offsets as the browser resolved them; together they would
  // set its size, so it keeps the size it had, which also puts it back where it was.
  const placed = style.position === 'absolute' || style.position === 'fixed'
  const key = source.localName === 'a' && source.hasAttribute('href') ? 'a[href]' : source.localName
  const own = SIZED.has(tag) || empty || placed
  const fixed = own ? { width: true, height: true } : explicitSize(source)
  const declared = declarations(style, parent, key, defaults, fixed)
  // The browser centres a button's content; the copy says so, as layers do not.
  const centred =
    tag === 'BUTTON' && !style.display.includes('flex') && !style.display.includes('grid')
  return centred
    ? `${declared}; display: flex; align-items: center; justify-content: center`
    : declared
}

/** The families an element's font stack names; the page may draw with any it loaded. */
function families(style: CSSStyleDeclaration): string[] {
  return style.fontFamily
    .split(',')
    .map((family) => family.trim().replace(/^["']|["']$/g, ''))
    .filter((family) => family !== '')
}

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'

/** An element's children copied in its place, for a box the page does not draw. */
function copyChildren(source: Element, parent: CSSStyleDeclaration | null, walk: Walk): Node {
  const fragment = document.createDocumentFragment()
  for (const child of source.childNodes) {
    const copied = copyNode(child, parent, walk)
    if (copied) fragment.append(copied)
  }
  return fragment
}

/** Text kept for screen readers only, in a box of a pixel that clips it: it would show on a layer. */
function screenReaderOnly(source: Element, style: CSSStyleDeclaration): boolean {
  const box = source.getBoundingClientRect()
  return box.width <= 1 && box.height <= 1 && (style.overflow === 'hidden' || style.clip !== 'auto')
}

/**
 * Whether a tag is the page's own root. Pasted markup cannot hold a second `<body>`: a parser
 * drops the tag with its width, font and background, so the copy of one is a plain box.
 */
export function pageRoot(localName: string): boolean {
  return localName === 'body' || localName === 'html'
}

function copyNode(source: Node, parent: CSSStyleDeclaration | null, walk: Walk): Node | null {
  if (source.nodeType === Node.TEXT_NODE) return document.createTextNode(source.textContent ?? '')
  if (!(source instanceof Element) || DROPPED_TAGS.has(source.tagName)) return null
  const style = getComputedStyle(source)
  // A box the page does not draw passes its children on: they come along without it.
  if (style.display === 'contents' && source.namespaceURI !== SVG_NAMESPACE)
    return copyChildren(source, parent, walk)
  if (screenReaderOnly(source, style)) return null
  const hidden = style.display === 'none'
  if (hidden && !walk.keep.has(source)) return null
  const replaced = copyReplaced(source, style, parent, walk)
  if (replaced) return replaced
  const picture =
    source instanceof HTMLPictureElement ? copyPicture(source, style, parent, walk) : null
  if (picture) {
    applyStyle(picture.copy, hiddenWhere(picture.declared, hidden), walk)
    return picture.copy
  }

  const copy = emptyCopy(source)
  if (!(copy instanceof Element)) return null
  walk.layers++
  copyAttributes(copy, source, walk)
  if (style.backgroundImage.includes('url(')) walk.images++
  for (const family of families(style)) walk.families.add(family)
  if (source.namespaceURI === SVG_NAMESPACE) return copySVG(source, style, walk)

  const declared = finalDeclarations(elementStyle(source, style, parent, walk.defaults))
  applyStyle(copy, hiddenWhere(declared, hidden), walk)
  fillChildren(copy, source, style, walk)
  return copy
}

/** An element's declarations, written hidden where the page hides it at this width. */
function hiddenWhere(declared: string, hidden: boolean): string {
  return hidden ? `${declared.replace(/(^|; )display: none/, '$1')}; ${HIDDEN}` : declared
}

/**
 * A `<picture>` as the one image it shows: its `<img>` with the file the browser chose, named
 * after the picture and placed as the picture is, so the picture and its image are one layer.
 * A positioned picture takes the image's box, where the image is smaller than it.
 */
function copyPicture(
  source: HTMLPictureElement,
  style: CSSStyleDeclaration,
  parent: CSSStyleDeclaration | null,
  walk: Walk
): { copy: Element; declared: string } | null {
  const image = [...source.children].find((child) => child instanceof HTMLImageElement)
  if (!(image instanceof HTMLImageElement)) return null
  const copy = image.cloneNode(false)
  if (!(copy instanceof HTMLImageElement)) return null
  walk.layers++
  copyAttributes(copy, image, walk)
  if (walk.format === 'kalka' && source.classList.length > 0)
    copy.setAttribute('class', [...source.classList].join(' '))
  const imageStyle = getComputedStyle(image)
  // A picture left inline draws no box of its own: the image is all there is.
  if (style.display === 'inline')
    return {
      copy,
      declared: finalDeclarations(elementStyle(image, imageStyle, style, walk.defaults))
    }
  const own = parseDeclarations(declarations(style, parent, 'img', walk.defaults))
  const outer = source.getBoundingClientRect()
  const inner = image.getBoundingClientRect()
  const positioned = style.position === 'absolute' || style.position === 'fixed'
  const smaller = inner.width < outer.width - 1 || inner.height < outer.height - 1
  const moved =
    positioned && smaller ? shifted(own, inner.left - outer.left, inner.top - outer.top) : null
  const box = moved ?? own
  if (moved) {
    box.set('width', `${inner.width}px`)
    box.set('height', `${inner.height}px`)
    for (const [side, by] of [
      ['right', outer.right - inner.right],
      ['bottom', outer.bottom - inner.bottom]
    ] as const) {
      const value = own.get(side)
      if (value !== undefined) box.set(side, `${Number.parseFloat(value) + by}px`)
    }
  }
  for (const property of ['object-fit', 'object-position'] as const)
    box.set(property, imageStyle.getPropertyValue(property))
  if (Number(imageStyle.opacity) === 0) box.set('opacity', '0')
  return { copy, declared: finalDeclarations(writeDeclarations(box)) }
}

/** A copy's content: its pseudo-elements, and its children or its shadow root's. */
function fillChildren(
  copy: Element,
  source: Element,
  style: CSSStyleDeclaration,
  walk: Walk
): void {
  const before = pseudo(source, '::before', style, walk)
  if (before) copy.append(before)
  const children = source.shadowRoot ? source.shadowRoot.childNodes : source.childNodes
  for (const child of children) {
    const copied = copyNode(child, style, walk)
    if (copied) copy.append(copied)
  }
  const after = pseudo(source, '::after', style, walk)
  if (after) copy.append(after)
}

/** Every `@font-face` rule of a list, including those inside `@media`, `@supports` or `@layer`. */
function faceRules(rules: CSSRuleList, out: CSSFontFaceRule[]): void {
  for (const rule of rules) {
    if (rule instanceof CSSFontFaceRule) out.push(rule)
    else if (rule instanceof CSSGroupingRule) faceRules(rule.cssRules, out)
  }
}

/** Where the web font stylesheets Kalka reads come from. */
const WEB_FONT_STYLESHEET_HOST = 'fonts.googleapis.com'

/** A web font stylesheet the page links from another site, which hides its rules from the page. */
export function webFontLink(href: string | null): string | null {
  if (!href) return null
  try {
    if (new URL(href).hostname !== WEB_FONT_STYLESHEET_HOST) return null
  } catch {
    return null
  }
  return `<link rel="stylesheet" href="${href.replaceAll('&', '&amp;').replaceAll('"', '&quot;')}">`
}

/**
 * The page's `@font-face` rules for the families the copy uses, with absolute URLs, and links to
 * the web font stylesheets whose rules the page cannot read, such as Google Fonts': without them
 * Kalka measures the text in a fallback font and wraps it where the page does not.
 */
function fontFaces(families: Set<string>): { faces: string[]; links: string[] } {
  const faces = new Set<string>()
  const links = new Set<string>()
  for (const sheet of document.styleSheets) {
    const rules: CSSFontFaceRule[] = []
    try {
      faceRules(sheet.cssRules, rules)
    } catch {
      // A stylesheet from another site hides its rules.
      const link = webFontLink(sheet.href)
      if (link) links.add(link)
      continue
    }
    const base = sheet.href ?? document.baseURI
    for (const rule of rules) {
      const family = rule.style
        .getPropertyValue('font-family')
        .trim()
        .replace(/^["']|["']$/g, '')
      if (!families.has(family)) continue
      faces.add(
        rule.cssText.replace(/url\((["']?)([^"')]+)\1\)/g, (_match, quote: string, url: string) => {
          try {
            return `url(${quote}${new URL(url, base).href}${quote})`
          } catch {
            return `url(${quote}${url}${quote})`
          }
        })
      )
    }
  }
  return { faces: [...faces], links: [...links] }
}

const TRANSPARENT_COLORS = new Set(['rgba(0, 0, 0, 0)', 'transparent'])

/** The red, green, blue and alpha of a computed `rgb()` or `rgba()` color. */
function channels(color: string): [number, number, number, number] | null {
  const parts = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/.exec(color)
  if (!parts) return null
  return [
    Number(parts[1]),
    Number(parts[2]),
    Number(parts[3]),
    parts[4] === undefined ? 1 : Number(parts[4])
  ]
}

/**
 * The color an element shows on the page: its own background over what is behind it. A copy
 * pasted elsewhere loses what was behind, so a translucent root keeps the color it looked.
 */
function shownBackground(own: string, behind: string | null): string | null {
  if (TRANSPARENT_COLORS.has(own)) return behind
  const top = channels(own)
  const under = behind ? channels(behind) : null
  if (!top || !under || top[3] >= 1) return null
  const mix = (index: number) =>
    Math.round((top[index] ?? 0) * top[3] + (under[index] ?? 0) * (1 - top[3]))
  return `#${[mix(0), mix(1), mix(2)].map((part) => part.toString(16).padStart(2, '0')).join('')}`
}

/** The colour behind an element: the first ancestor's background that is not transparent. */
function pageBackground(element: Element): string {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const color = getComputedStyle(node).backgroundColor
    if (!TRANSPARENT_COLORS.has(color)) return color
  }
  // A page that paints no background shows the browser's white.
  return '#FFFFFF'
}

/** What a copy can take besides the markup. */
export interface CaptureOptions {
  /**
   * Elements to write even where the page hides them, as hidden layers, so copies made at
   * several widths have the same elements in the same order.
   */
  keep?: ReadonlySet<Element>
  /** What the screen showed: the backdrop behind the element and its unreadable canvases. */
  shots?: Shots
}

/** Copies an element as standalone HTML. */
export function captureElement(
  element: Element,
  format: CaptureFormat,
  { keep = new Set(), shots }: CaptureOptions = {}
): Capture {
  const defaults = new BrowserDefaults()
  const walk: Walk = {
    keep,
    defaults,
    canvases: shots?.canvases ?? new Map(),
    layers: 0,
    images: 0,
    replaced: 0,
    families: new Set(),
    rules: [],
    format
  }
  // The root is copied without a parent, so it carries every inherited text style it had.
  const copy = copyNode(element, null, walk)
  const box = element.getBoundingClientRect()
  const container = document.createElement('div')
  if (copy instanceof Element) {
    // The copy keeps the width it had on the page, without the margins around it.
    // A transparent root shows what was behind it on the page, so the copy keeps that colour.
    const background = getComputedStyle(element).backgroundColor
    const behind = shownBackground(background, pageBackground(element))
    const extra = ['box-sizing: border-box', `width: ${Math.round(box.width)}px`, 'margin: 0']
    if (behind) extra.push(`background-color: ${behind}`)
    extra.push(...unplaced(getComputedStyle(element).position))
    // What the page drew behind it, from the screen, under the element's own background.
    if (shots?.backdrop) {
      const own = getComputedStyle(element).backgroundImage
      const layers = [...(own && own !== 'none' ? [own] : []), `url("${shots.backdrop}")`]
      extra.push(
        `background-image: ${layers.join(', ')}`,
        `background-size: ${layers.map((_, index) => (index === layers.length - 1 ? '100% 100%' : 'auto')).join(', ')}`
      )
      walk.images++
    }
    if (format === 'kalka') {
      const own = copy.getAttribute('style')
      copy.setAttribute('style', [...(own ? [own] : []), ...extra].join('; '))
    } else {
      walk.rules.push(`.k-root { ${extra.join('; ')} }`)
      copy.classList.add('k-root')
    }
    copy.setAttribute('data-kalka-source', location.href)
    container.append(copy)
  }
  defaults.release()
  const { faces, links } = fontFaces(walk.families)
  const sheet = [...faces, ...walk.rules].join('\n')
  const html = `${links.map((link) => `${link}\n`).join('')}${sheet ? `<style>\n${sheet}\n</style>\n` : ''}${container.innerHTML}`
  return {
    html,
    layers: walk.layers,
    images: walk.images,
    fonts: [...walk.families].filter(
      (family) =>
        faces.some((face) => face.includes(family)) ||
        links.some((link) => link.includes(`family=${family.replaceAll(' ', '+')}`))
    ),
    replaced: walk.replaced
  }
}
