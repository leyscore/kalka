// Turns an element of the page into standalone HTML: a copy of its subtree where each element
// carries the styles the browser computed for it, URLs made absolute, pseudo-elements turned
// into real elements and the fonts it uses declared. Kalka pastes that HTML as editable layers;
// any other editor reads it as plain HTML and CSS.

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
const PROPERTIES = [
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
  'align-content',
  'align-self',
  'flex-grow',
  'flex-shrink',
  'flex-basis',
  'order',
  'gap',
  'row-gap',
  'column-gap',
  'grid-template-columns',
  'grid-template-rows',
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
  'transform',
  'filter',
  'backdrop-filter',
  'mix-blend-mode',
  'object-fit',
  'object-position',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'line-height',
  'letter-spacing',
  'text-align',
  'text-transform',
  'text-decoration',
  'white-space',
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
  'line-height',
  'letter-spacing',
  'text-align',
  'text-transform',
  'white-space',
  'list-style-type'
])

/** Values that change nothing on any element, so the copy stays short. */
const NEUTRAL = new Set([
  'none',
  'normal',
  'auto',
  '0px',
  '0',
  'static',
  'visible',
  'rgba(0, 0, 0, 0)',
  'start',
  'stretch',
  'nowrap',
  'baseline',
  '0% 0%',
  'repeat',
  'fill',
  '50% 50%',
  'content-box',
  'row',
  'inline',
  '0px none rgb(0, 0, 0)',
  'matrix(1, 0, 0, 1, 0, 0)'
])

/** Kept even when neutral, because the copy loses the page's own rules around it. */
const ALWAYS = new Set(['display'])

const DROPPED_TAGS = new Set(['SCRIPT', 'NOSCRIPT', 'STYLE', 'LINK', 'META', 'TEMPLATE'])

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

/** Elements the browser draws with a border and a background of their own. */
const CONTROLS = new Set(['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'FIELDSET'])

/** Defaults that `NEUTRAL` cannot hold, since the same value means something on other properties. */
const DEFAULTS: Record<string, string> = {
  'flex-shrink': '1',
  opacity: '1',
  'flex-grow': '0',
  order: '0',
  'z-index': 'auto',
  // The initial value; written out, Kalka's importer sizes flex items wrongly with it.
  'box-sizing': 'content-box'
}

function declarations(
  style: CSSStyleDeclaration,
  parent: CSSStyleDeclaration | null,
  sized = true,
  reset = false
): string {
  const out: string[] = []
  for (const property of PROPERTIES) {
    const value = style.getPropertyValue(property)
    if (!value) continue
    // Other boxes size to their content and their layout, as on the page.
    if (!sized && (property === 'width' || property === 'height')) continue
    if (property.startsWith('border-') && property !== 'border-radius' && value.includes(' none')) {
      // Controls have a border of their own in the browser; the copy must say it has none.
      if (reset) out.push(`${property}: 0`)
      continue
    }
    if (INHERITED.has(property) && parent && parent.getPropertyValue(property) === value) continue
    if (DEFAULTS[property] === value) continue
    if (!ALWAYS.has(property) && !INHERITED.has(property) && NEUTRAL.has(value)) continue
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
}

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
  applyStyle(span, declarations(style, parent), walk)
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
    image.src = source.toDataURL('image/png')
    applyStyle(image, declarations(style, parent), walk)
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

/** An SVG keeps its own markup at its size; its paint is in its attributes. */
function copySVG(source: Element, style: CSSStyleDeclaration, walk: Walk): Element | null {
  if (source.tagName.toLowerCase() !== 'svg') return null
  const svg = source.cloneNode(true)
  if (!(svg instanceof Element)) return null
  const box = source.getBoundingClientRect()
  svg.setAttribute('width', String(box.width))
  svg.setAttribute('height', String(box.height))
  applyStyle(svg, `color: ${style.color}`, walk)
  return svg
}

/** The styles written on an element's copy. */
function elementStyle(
  source: Element,
  style: CSSStyleDeclaration,
  parent: CSSStyleDeclaration | null
): string {
  const tag = source.tagName.toUpperCase()
  const control = CONTROLS.has(tag)
  // Controls do not inherit text styles in the browser: they keep their own.
  const declared = declarations(style, control ? null : parent, SIZED.has(tag), control)
  // The browser centres a button's content; the copy says so, as layers do not.
  const centred =
    tag === 'BUTTON' && !style.display.includes('flex') && !style.display.includes('grid')
  return centred
    ? `${declared}; display: flex; align-items: center; justify-content: center`
    : declared
}

function firstFamily(style: CSSStyleDeclaration): string {
  return (
    style.fontFamily
      .split(',')[0]
      ?.trim()
      .replace(/^["']|["']$/g, '') ?? ''
  )
}

function copyNode(source: Node, parent: CSSStyleDeclaration | null, walk: Walk): Node | null {
  if (source.nodeType === Node.TEXT_NODE) return document.createTextNode(source.textContent ?? '')
  if (!(source instanceof Element) || DROPPED_TAGS.has(source.tagName)) return null
  const style = getComputedStyle(source)
  if (style.display === 'none') return null
  const replaced = copyReplaced(source, style, parent, walk)
  if (replaced) return replaced

  const copy =
    source instanceof HTMLVideoElement
      ? Object.assign(document.createElement('img'), { src: absolute(source.poster) })
      : source.cloneNode(false)
  if (!(copy instanceof Element)) return null
  walk.layers++
  copyAttributes(copy, source, walk)
  if (style.backgroundImage.includes('url(')) walk.images++
  const family = firstFamily(style)
  if (family) walk.families.add(family)
  if (source.namespaceURI === 'http://www.w3.org/2000/svg') return copySVG(source, style, walk)

  applyStyle(copy, elementStyle(source, style, parent), walk)
  const before = pseudo(source, '::before', style, walk)
  if (before) copy.append(before)
  const children = source.shadowRoot ? source.shadowRoot.childNodes : source.childNodes
  for (const child of children) {
    const copied = copyNode(child, style, walk)
    if (copied) copy.append(copied)
  }
  const after = pseudo(source, '::after', style, walk)
  if (after) copy.append(after)
  return copy
}

/** The page's `@font-face` rules for the families the copy uses, with absolute URLs. */
function fontFaces(families: Set<string>): string[] {
  const faces: string[] = []
  for (const sheet of document.styleSheets) {
    let rules: CSSRuleList
    try {
      rules = sheet.cssRules
    } catch {
      // A stylesheet from another site hides its rules.
      continue
    }
    const base = sheet.href ?? document.baseURI
    for (const rule of rules) {
      if (!(rule instanceof CSSFontFaceRule)) continue
      const family = rule.style
        .getPropertyValue('font-family')
        .trim()
        .replace(/^["']|["']$/g, '')
      if (!families.has(family)) continue
      faces.push(
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
  return faces
}

const TRANSPARENT_COLORS = new Set(['rgba(0, 0, 0, 0)', 'transparent'])

/** The colour behind an element: the first ancestor's background that is not transparent. */
function pageBackground(element: Element): string | null {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const color = getComputedStyle(node).backgroundColor
    if (!TRANSPARENT_COLORS.has(color)) return color
  }
  return null
}

export function captureElement(element: Element, format: CaptureFormat): Capture {
  const walk: Walk = {
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
    const behind = TRANSPARENT_COLORS.has(background) ? pageBackground(element) : null
    const extra = ['box-sizing: border-box', `width: ${Math.round(box.width)}px`, 'margin: 0']
    if (behind) extra.push(`background-color: ${behind}`)
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
  const faces = fontFaces(walk.families)
  const sheet = [...faces, ...walk.rules].join('\n')
  const html = `${sheet ? `<style>\n${sheet}\n</style>\n` : ''}${container.innerHTML}`
  return {
    html,
    layers: walk.layers,
    images: walk.images,
    fonts: [...walk.families],
    replaced: walk.replaced
  }
}
