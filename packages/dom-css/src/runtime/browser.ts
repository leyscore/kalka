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
import { drawnSVG, readFieldText, SVG_NAMESPACE } from './drawn'
import { isSafeAttribute, UNSAFE_OR_HIDDEN_TAGS } from './sanitize'

export interface BrowserCSSRuntimeOptions {
  document?: Document
  sandbox?: 'shadow-root' | 'iframe'
}

const DEFAULT_COMPUTED_PROPERTIES = [
  'align-items',
  'aspect-ratio',
  'backdrop-filter',
  'background-clip',
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
  'filter',
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

/**
 * How long to wait for a frame before measuring anyway. A hidden or occluded window draws no
 * frames, so an agent working while the user looks elsewhere would otherwise wait forever; the
 * measures read below force layout themselves, so they are right without the frame.
 */
const FRAME_WAIT_MS = 100

function requestFrame(browserDocument: Document): Promise<void> {
  const view = browserDocument.defaultView
  if (!view?.requestAnimationFrame) return Promise.resolve()
  return new Promise((resolve) => {
    const timer = view.setTimeout(resolve, FRAME_WAIT_MS)
    view.requestAnimationFrame(() => {
      view.clearTimeout(timer)
      resolve()
    })
  })
}

const DEFAULT_VIEWPORT_WIDTH = 1000

const AT_REST_CSS = '*,*::before,*::after{animation:none!important;transition:none!important}'
/** Lays a page out as if nothing were transformed, to read the boxes its layout gives. */
const UNTRANSFORMED_CSS =
  '*{transform:none!important;rotate:none!important;scale:none!important;translate:none!important}'
/** Marks the measuring page's own stylesheet, which is not the author's. */
const AT_REST_ATTRIBUTE = 'data-kalka-at-rest'

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
    // The content must not inherit the editor's own color, font or visibility; text with no
    // font of its own falls back to the artboards' default.
    'all: initial',
    'font-family: Inter, system-ui, sans-serif',
    'position: fixed',
    'left: -100000px',
    'top: 0',
    `width: ${width}px`,
    'height: auto',
    // Not `visibility: hidden`: it inherits into the content, which would read as hidden layers.
    'opacity: 0',
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
    style.textContent = cssText
    const atRest = iframeDocument.createElement('style')
    atRest.setAttribute(AT_REST_ATTRIBUTE, '')
    atRest.textContent = AT_REST_CSS
    iframeDocument.head.append(style, atRest)

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

/**
 * How far into its box a text node's first line starts: text after an inline box on the same
 * line begins mid-line and wraps back to the block's edge, so its box starts left of its words.
 */
function firstLineIndent(node: Node): number | undefined {
  const range = node.ownerDocument?.createRange()
  if (!range) return undefined
  range.selectNodeContents(node)
  const box = range.getBoundingClientRect()
  // From its first word: the space before it is not part of the layer's text.
  const blank = (node.nodeValue ?? '').search(/\S/)
  if (blank > 0) range.setStart(node, blank)
  const lines = range.getClientRects()
  const first = lines.item(0)
  if (!first || lines.length < 2) return undefined
  const indent = first.left - box.left
  return indent >= 1 ? indent : undefined
}

/** Motion is not part of a design at rest. */
const UNKEPT_RULE_PROPERTY = /^(animation|transition)(-|$)/

/** A stylesheet's rules; none for one from another origin, whose result is still computed. */
function readableRules(sheet: CSSStyleSheet): CSSRuleList | null {
  try {
    return sheet.cssRules
  } catch {
    return null
  }
}

/** The page's style rules that apply in its window, in the order the cascade reads them. */
function activeStyleRules(root: Document | ShadowRoot, view: Window & typeof globalThis) {
  const rules: CSSStyleRule[] = []
  const collect = (list: CSSRuleList) => {
    for (const rule of Array.from(list)) {
      if (rule instanceof view.CSSStyleRule) rules.push(rule)
      else if (rule instanceof view.CSSMediaRule) {
        if (view.matchMedia(rule.conditionText).matches) collect(rule.cssRules)
      } else if (rule instanceof view.CSSSupportsRule) {
        if (view.CSS.supports(rule.conditionText)) collect(rule.cssRules)
      }
    }
  }
  for (const sheet of Array.from(root.styleSheets)) {
    const owner = sheet.ownerNode
    if (owner instanceof view.Element && owner.hasAttribute(AT_REST_ATTRIBUTE)) continue
    const sheetRules = readableRules(sheet)
    if (sheetRules) collect(sheetRules)
  }
  return rules
}

/**
 * What the page's stylesheets declare for an element, as its author wrote it: the import keeps
 * what a layer's fields cannot say, such as a tiled dot pattern or a mask. A value that uses a
 * variable is taken as computed, since the variable stays behind with the page.
 */
function ruleDeclarations(
  element: Element,
  rules: readonly CSSStyleRule[],
  computed: CSSStyleDeclaration
): Record<string, string> {
  const declared: Record<string, string> = {}
  for (const rule of rules) {
    let matches = false
    try {
      matches = element.matches(rule.selectorText)
    } catch {
      continue
    }
    if (!matches) continue
    for (const property of Array.from(rule.style)) {
      if (UNKEPT_RULE_PROPERTY.test(property)) continue
      const written = rule.style.getPropertyValue(property)
      // A shorthand writes every longhand it leaves out as `initial`; those say nothing.
      if (written === 'initial') continue
      // A variable is the page's value, read once substituted. The longhands of a shorthand
      // written with one (`background: var(--paper)`) read empty until then.
      const value =
        written === '' || written.includes('var(') ? computed.getPropertyValue(property) : written
      if (value) declared[property] = value
    }
  }
  return declared
}

/** An element's computed style, and what the page's rules declare for it as written. */
function readElementStyle(
  designElement: DesignElement,
  domElement: Element,
  view: Window & typeof globalThis,
  rules: readonly CSSStyleRule[],
  options: CSSComputeOptions
): void {
  const computed = view.getComputedStyle(domElement)
  designElement.computedStyle = computedStyleToRecord(computed, options)
  // Content the page does not draw, such as the answer in a closed `<details>`, keeps a
  // `display` of its own; the browser says it has no box.
  if (
    computed.display !== 'contents' &&
    'checkVisibility' in domElement &&
    !domElement.checkVisibility()
  )
    designElement.computedStyle.display = 'none'
  if (rules.length === 0) return
  const declared = ruleDeclarations(domElement, rules, computed)
  if (Object.keys(declared).length > 0)
    designElement.inlineStyle = { ...declared, ...designElement.inlineStyle }
}

/** Where an element and its own text runs were laid out, and an SVG's drawing. */
function readElementBoxes(designElement: DesignElement, domElement: Element, origin: DOMRect) {
  designElement.layoutBox = layoutBoxOf(domElement, origin)
  if (domElement.namespaceURI === SVG_NAMESPACE && domElement.localName === 'svg') {
    const markup = drawnSVG(domElement, designElement.layoutBox)
    if (markup) designElement.drawnSVG = markup
  }
  readFieldText(designElement, domElement)
  // Its text runs, in order, against the rendered element's own text nodes.
  const texts = Array.from(domElement.childNodes).filter((child) => child.nodeType === 3)
  let next = 0
  for (const child of designElement.children) {
    if (child.type !== 'text') continue
    const domText = texts.at(next++)
    if (!domText) continue
    child.layoutBox = textBox(domText, origin)
    const indent = firstLineIndent(domText)
    if (indent === undefined) delete child.firstLineIndent
    else child.firstLineIndent = indent
  }
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
  const root = content.getRootNode()
  const rules =
    root instanceof view.Document || root instanceof view.ShadowRoot
      ? activeStyleRules(root, view)
      : []
  const measured: Array<[DesignElement, Element]> = []
  for (const [index, designElement] of elements.entries()) {
    Reflect.deleteProperty(designElement.attrs, MEASURE_ATTRIBUTE)
    const domElement = rendered.get(String(index))
    if (!domElement) continue
    measured.push([designElement, domElement])
    readElementStyle(designElement, domElement, view, rules, options)
  }

  // Boxes are read where the layout put them, before any transform: a layer keeps its transform
  // as CSS, and a scaled container's children would otherwise come scaled twice.
  const untransformed = content.ownerDocument.createElement('style')
  untransformed.textContent = UNTRANSFORMED_CSS
  ;(root instanceof view.ShadowRoot ? root : content.ownerDocument.head).append(untransformed)
  try {
    for (const [designElement, domElement] of measured)
      readElementBoxes(designElement, domElement, origin)
  } finally {
    untransformed.remove()
  }
  // Only a page laid out at a chosen width becomes an artboard of its own; HTML written into a
  // design (write_html, pasted fragments) keeps its own root.
  if (options.viewportWidth !== undefined) {
    const body = content.ownerDocument.body
    marked.viewport = {
      width: options.viewportWidth,
      height: Math.max(origin.height, content.scrollHeight),
      bodyStyle: computedStyleToRecord(view.getComputedStyle(body), options)
    }
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
