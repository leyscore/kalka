import { serializeHTML } from '../export/html'
import { parseStyleDeclarations } from '../import/declarations'
import type {
  CSSComputeOptions,
  CSSRuntime,
  DesignDocument,
  DesignElement,
  DesignNode,
  LayoutBox
} from '../types'
import { isSafeAttribute, UNSAFE_OR_HIDDEN_TAGS } from './sanitize'

export interface BrowserCSSRuntimeOptions {
  document?: Document
  sandbox?: 'shadow-root' | 'iframe'
}

const DEFAULT_COMPUTED_PROPERTIES = [
  'align-items',
  'aspect-ratio',
  'background-color',
  'background-image',
  'border-bottom-color',
  'border-bottom-style',
  'border-bottom-left-radius',
  'border-bottom-right-radius',
  'border-bottom-width',
  'border-left-color',
  'border-left-style',
  'border-left-width',
  'border-radius',
  'border-right-color',
  'border-right-style',
  'border-right-width',
  'border-top-color',
  'border-top-style',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-top-width',
  'box-shadow',
  'color',
  'column-gap',
  'display',
  'align-self',
  'bottom',
  'flex-direction',
  'flex-wrap',
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'gap',
  'height',
  'justify-content',
  'letter-spacing',
  'left',
  'margin-bottom',
  'margin-left',
  'margin-right',
  'margin-top',
  'line-height',
  'max-height',
  'max-width',
  'min-height',
  'min-width',
  'object-fit',
  'opacity',
  'overflow',
  'padding-bottom',
  'padding-left',
  'padding-right',
  'padding-top',
  'position',
  'right',
  'row-gap',
  'text-align',
  'text-decoration-line',
  'text-shadow',
  'text-transform',
  'top',
  'rotate',
  'transform',
  'visibility',
  'white-space',
  'width',
  'z-index'
] as const

function resolveBrowserDocument(documentOverride: Document | undefined): Document {
  if (documentOverride) return documentOverride
  if (typeof document === 'undefined') {
    throw new TypeError('Browser CSS runtime requires a DOM document')
  }
  return document
}

function attributesToRecord(element: Element): Record<string, string> {
  const attrs: Record<string, string> = {}
  for (const attr of Array.from(element.attributes)) {
    if (isSafeAttribute(attr.name, attr.value)) attrs[attr.name] = attr.value
  }
  return attrs
}

function domNodeToDesignNode(node: Node): DesignNode | null {
  if (node.nodeType === 3) {
    const text = node.textContent ?? ''
    return text.length > 0 ? { type: 'text', text } : null
  }

  if (node.nodeType !== 1) return null

  const element = node as Element
  if (UNSAFE_OR_HIDDEN_TAGS.has(element.tagName.toLowerCase())) return null
  const children = Array.from(element.childNodes)
    .map(domNodeToDesignNode)
    .filter((child): child is DesignNode => child !== null)
  // The attribute as written: a shorthand that uses a variable, such as `background:
  // var(--glass)`, reads back empty through `element.style`, and its paint would be lost.
  const declared = parseStyleDeclarations(element.getAttribute('style') ?? undefined)

  return {
    type: 'element',
    tagName: element.tagName.toLowerCase(),
    attrs: attributesToRecord(element),
    children,
    inlineStyle: Object.keys(declared).length > 0 ? declared : undefined
  }
}

function parseHTMLWithDocument(browserDocument: Document, html: string): DesignDocument {
  const Parser = browserDocument.defaultView?.DOMParser
  if (!Parser) throw new TypeError('Browser CSS runtime requires DOMParser')
  const parser = new Parser()
  const parsed = parser.parseFromString(html, 'text/html')
  return {
    type: 'document',
    children: Array.from(parsed.body.childNodes)
      .map(domNodeToDesignNode)
      .filter((node): node is DesignNode => node !== null)
  }
}

const MEASURE_ATTRIBUTE = 'data-kalka-measure'

/**
 * The design document to render, each element marked with its index: the HTML parser rewrites
 * invalid nesting (a `div` in a `p`), so rendered elements are found by mark, not by position.
 */
function markedForMeasure(designDocument: DesignDocument): {
  marked: DesignDocument
  elements: DesignElement[]
} {
  const marked = structuredClone(designDocument)
  const elements: DesignElement[] = []
  const visit = (node: DesignNode) => {
    if (node.type === 'text') return
    node.attrs[MEASURE_ATTRIBUTE] = String(elements.length)
    elements.push(node)
    node.children.forEach(visit)
  }
  marked.children.forEach(visit)
  return { marked, elements }
}

function computedStyleToRecord(
  style: CSSStyleDeclaration,
  options: CSSComputeOptions
): Record<string, string> {
  const entries: Record<string, string> = {}
  const properties = options.includeBrowserDefaults
    ? Array.from(style)
    : DEFAULT_COMPUTED_PROPERTIES

  for (const property of properties) {
    const value = style.getPropertyValue(property)
    if (value) entries[property] = value
  }

  return entries
}

function requestFrame(browserDocument: Document): Promise<void> {
  const requestAnimationFrame = browserDocument.defaultView?.requestAnimationFrame
  if (!requestAnimationFrame) return Promise.resolve()
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}

const DEFAULT_VIEWPORT_WIDTH = 1000

const AT_REST_CSS = '*,*::before,*::after{animation:none!important;transition:none!important}'

/** How long measuring waits for the page's web fonts before it goes ahead without them. */
const FONT_WAIT_MS = 4000

function fontsLoaded(browserDocument: Document): Promise<void> {
  const view = browserDocument.defaultView
  if (!view || !('fonts' in browserDocument)) return Promise.resolve()
  return new Promise((resolve) => {
    const timer = view.setTimeout(resolve, FONT_WAIT_MS)
    void browserDocument.fonts.ready.then(() => {
      view.clearTimeout(timer)
      resolve()
      return undefined
    })
  })
}

function applySandboxHostStyle(element: HTMLElement, width = DEFAULT_VIEWPORT_WIDTH): void {
  element.style.cssText = [
    'position: fixed',
    'left: -100000px',
    'top: 0',
    `width: ${width}px`,
    'height: auto',
    'visibility: hidden',
    'pointer-events: none',
    'contain: layout style paint'
  ].join(';')
}

async function computeStylesInShadowRoot(
  browserDocument: Document,
  designDocument: DesignDocument,
  cssText: string,
  options: CSSComputeOptions
): Promise<DesignDocument> {
  const host = browserDocument.createElement('div')
  applySandboxHostStyle(host, options.viewportWidth)

  const shadow = host.attachShadow({ mode: 'open' })
  const style = browserDocument.createElement('style')
  style.textContent = cssText
  shadow.append(style)

  const content = browserDocument.createElement('div')
  const { marked, elements } = markedForMeasure(designDocument)
  content.innerHTML = serializeHTML(marked)
  shadow.append(content)
  browserDocument.body.append(host)

  try {
    await requestFrame(browserDocument)
    return copyComputedStyles(marked, elements, content, options)
  } finally {
    host.remove()
  }
}

async function computeStylesInIframe(
  browserDocument: Document,
  designDocument: DesignDocument,
  cssText: string,
  options: CSSComputeOptions
): Promise<DesignDocument> {
  const iframe = browserDocument.createElement('iframe')
  applySandboxHostStyle(iframe, options.viewportWidth)
  browserDocument.body.append(iframe)

  try {
    const iframeDocument = iframe.contentDocument
    if (!iframeDocument) throw new TypeError('Browser CSS runtime could not create iframe document')
    iframeDocument.open()
    // A browser's default 8px body margin would narrow the page the content lays out in; the
    // page's own stylesheet, added after, still sets the body's margin when it has one.
    // Animations and transitions would be measured mid-way; a design is read at rest.
    iframeDocument.write(
      `<!doctype html><html><head><style>body{margin:0}</style></head><body></body></html>`
    )
    iframeDocument.close()

    const style = iframeDocument.createElement('style')
    style.textContent = `${cssText}\n${AT_REST_CSS}`
    iframeDocument.head.append(style)

    const content = iframeDocument.createElement('div')
    const { marked, elements } = markedForMeasure(designDocument)
    content.innerHTML = serializeHTML(marked)
    iframeDocument.body.append(content)

    // Text measured in a fallback font would size boxes and wrap lines as the page never does.
    // Laying the content out first is what starts its fonts loading.
    void content.getBoundingClientRect()
    await fontsLoaded(iframeDocument)
    await requestFrame(iframeDocument)
    return copyComputedStyles(marked, elements, content, options)
  } finally {
    iframe.remove()
  }
}

function boxOf(rect: DOMRect, origin: DOMRect): LayoutBox {
  return {
    x: rect.left - origin.left,
    y: rect.top - origin.top,
    width: rect.width,
    height: rect.height
  }
}

/**
 * An element's box before its transform: the layer model draws a transformed element at its
 * own size, so a rotated or tilted element keeps its width and sits where its middle shows.
 */
function layoutBoxOf(element: Element, origin: DOMRect): LayoutBox {
  const rect = element.getBoundingClientRect()
  const view = element.ownerDocument.defaultView
  const style = view?.getComputedStyle(element)
  // `rotate`, `scale` and `translate` transform as `transform` does; Tailwind 4 writes them.
  const transformed =
    !!style &&
    [style.transform, style.rotate, style.scale, style.translate].some(
      (value) => value !== 'none' && value !== ''
    )
  const sized = element as Partial<HTMLElement>
  if (!transformed || sized.offsetWidth === undefined || sized.offsetHeight === undefined)
    return boxOf(rect, origin)
  const width = sized.offsetWidth
  const height = sized.offsetHeight
  return {
    x: rect.left + rect.width / 2 - width / 2 - origin.left,
    y: rect.top + rect.height / 2 - height / 2 - origin.top,
    width,
    height
  }
}

/** The box a text node's lines take, from a range over it. */
function textBox(node: Node, origin: DOMRect): LayoutBox | undefined {
  const range = node.ownerDocument?.createRange()
  if (!range) return undefined
  range.selectNodeContents(node)
  const rect = range.getBoundingClientRect()
  return rect.width > 0 || rect.height > 0 ? boxOf(rect, origin) : undefined
}

function copyComputedStyles(
  marked: DesignDocument,
  elements: DesignElement[],
  content: Element,
  options: CSSComputeOptions
): DesignDocument {
  const view = content.ownerDocument.defaultView
  if (!view) throw new TypeError('Browser CSS runtime requires getComputedStyle')

  const rendered = new Map<string, Element>()
  for (const element of content.querySelectorAll(`[${MEASURE_ATTRIBUTE}]`))
    rendered.set(element.getAttribute(MEASURE_ATTRIBUTE) ?? '', element)

  const origin = content.getBoundingClientRect()
  for (const [index, designElement] of elements.entries()) {
    Reflect.deleteProperty(designElement.attrs, MEASURE_ATTRIBUTE)
    const domElement = rendered.get(String(index))
    if (!domElement) continue
    designElement.computedStyle = computedStyleToRecord(view.getComputedStyle(domElement), options)
    designElement.layoutBox = layoutBoxOf(domElement, origin)
    // Its text runs, in order, against the rendered element's own text nodes.
    const texts = Array.from(domElement.childNodes).filter((child) => child.nodeType === 3)
    let next = 0
    for (const child of designElement.children) {
      if (child.type !== 'text') continue
      const domText = texts.at(next++)
      if (domText) child.layoutBox = textBox(domText, origin)
    }
  }
  const body = content.ownerDocument.body
  marked.viewport = {
    width: options.viewportWidth ?? DEFAULT_VIEWPORT_WIDTH,
    height: Math.max(origin.height, content.scrollHeight),
    bodyStyle: computedStyleToRecord(view.getComputedStyle(body), options)
  }
  return marked
}

export function createBrowserCSSRuntime(options: BrowserCSSRuntimeOptions = {}): CSSRuntime {
  const browserDocument = resolveBrowserDocument(options.document)
  const sandbox = options.sandbox ?? 'shadow-root'

  return {
    kind: 'browser',
    parseHTML: (html) => parseHTMLWithDocument(browserDocument, html),
    serializeHTML,
    computeStyles: (designDocument, cssText = '', computeOptions = {}) =>
      sandbox === 'iframe'
        ? computeStylesInIframe(browserDocument, designDocument, cssText, computeOptions)
        : computeStylesInShadowRoot(browserDocument, designDocument, cssText, computeOptions)
  }
}
