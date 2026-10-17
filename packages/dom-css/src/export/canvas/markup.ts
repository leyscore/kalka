import type { DesignElement, DesignNode, DesignStyleDeclaration } from '#dom-css/types'

import type { SceneNode } from '@kalka/scene-graph'

import { escapeAttr, escapeText, VOID_ELEMENTS } from '../html'
import { HTML_TAG_RESET_CSS } from '../tag-reset'

/**
 * The markup of the DOM canvas, which the editor builds as DOM and the CLI's render host loads
 * as HTML: both lay layers out from the same elements, attributes and base stylesheet.
 */

/** The attribute that ties a DOM element to its scene-graph layer. */
export const LAYER_ID_ATTR = 'data-kalka-id'

/** The projection's own id attribute; the canvas writes {@link LAYER_ID_ATTR} instead. */
const PROJECTION_ID_ATTR = 'data-kalka-node-id'

/**
 * An artboard document: one iframe per top-level layer, so its CSS is a real page of its own
 * (real `@media`, no leak into the editor or out of it) laid out and drawn by the browser.
 *
 * `allow-same-origin` without `allow-scripts`: the editor reads and measures the document, the
 * design itself never runs code. The CSP keeps pasted HTML off the network.
 */
export const ARTBOARD_SANDBOX = 'allow-same-origin'

export const ARTBOARD_CSP =
  "default-src 'none'; style-src 'unsafe-inline'; img-src data: blob:; font-src data: blob:"

/** The base stylesheet of every artboard document, which raster exports share. */
export const ARTBOARD_CSS = [
  'html,body{margin:0;padding:0;background:transparent;overflow:hidden}',
  '*,*::before,*::after{box-sizing:border-box}',
  // A layer written as an h1 or a button draws as its CSS says, not with browser defaults.
  HTML_TAG_RESET_CSS,
  // A layer's text keeps the font the projection writes; this is only the fallback.
  'body{font-family:Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}',
  'img{display:block}',
  // Projected text is a span with a width; it lays out as a box.
  '[data-kalka-text]{display:block}',
  // A shader layer plays its drawing behind its own content (dom-scene/shaders.ts).
  ':where([data-paper-shader]){isolation:isolate;position:relative}',
  '[data-kalka-shader-video]{position:absolute;inset:0;z-index:-1;display:block;width:100%;height:100%;object-fit:fill;border-radius:inherit;pointer-events:none}'
].join('')

export function artboardSrcdoc(): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${ARTBOARD_CSP}"><style>${ARTBOARD_CSS}</style></head><body></body></html>`
}

export function styleText(style: DesignStyleDeclaration | undefined): string {
  if (!style) return ''
  let text = ''
  for (const [property, value] of Object.entries(style)) {
    if (value !== '') text += `${property}:${value};`
  }
  return text
}

/** The attributes an element should carry, the layer id and style included. */
export function elementAttributes(element: DesignElement): Map<string, string> {
  const attrs = new Map<string, string>()
  for (const [name, value] of Object.entries(element.attrs)) {
    if (name !== PROJECTION_ID_ATTR) attrs.set(name, value)
  }
  if (element.sourceSceneNodeId) attrs.set(LAYER_ID_ATTR, element.sourceSceneNodeId)
  if (element.sourceSceneNode?.type === 'TEXT') attrs.set('data-kalka-text', '')
  const style = styleText(element.inlineStyle)
  if (style) attrs.set('style', style)
  return attrs
}

/**
 * The attributes of an artboard's own element. One that hugs its content in width is
 * `max-content`: as a block in its iframe it would otherwise take the iframe's width, the size
 * it had before.
 */
export function artboardAttributes(node: SceneNode, projected: DesignElement): Map<string, string> {
  const attrs = elementAttributes(projected)
  const hugsWidth =
    node.type === 'TEXT' ? node.textAutoResize === 'WIDTH_AND_HEIGHT' : node.layoutMode !== 'NONE'
  if (!projected.inlineStyle?.width && hugsWidth) {
    attrs.set('style', `${attrs.get('style') ?? ''}width:max-content;`)
  }
  return attrs
}

/** HTML for what `buildNode` builds as DOM: the same elements, every attribute kept. */
function markup(node: DesignNode, attrs: Map<string, string> | null, inSVG: boolean): string {
  if (node.type === 'text') return escapeText(node.text)
  const svg = inSVG || node.tagName === 'svg'
  let open = `<${node.tagName}`
  for (const [name, value] of attrs ?? elementAttributes(node)) {
    open += ` ${name}="${escapeAttr(value)}"`
  }
  if (!svg && VOID_ELEMENTS.has(node.tagName.toLowerCase())) return `${open}>`
  const children = node.children.map((child) => markup(child, null, svg)).join('')
  return `${open}>${children}</${node.tagName}>`
}

/** An artboard's element as HTML, with the attributes the canvas gives the DOM it builds. */
export function artboardMarkup(node: SceneNode, projected: DesignElement): string {
  return markup(projected, artboardAttributes(node, projected), false)
}
