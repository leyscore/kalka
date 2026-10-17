import type { BrowserFontFace } from '@kalka/core/text'
import { HTML_TAG_RESET_CSS } from '@kalka/dom-css/export'
import type { SceneGraph, SceneNode } from '@kalka/scene-graph'
import { getNodeWorldBounds } from '@kalka/scene-graph/coordinate'
import {
  computeDescendantVisualBounds,
  effectOverflow,
  nodeVisualBounds,
  strokeOverflow,
  unionVisualBounds
} from '@kalka/scene-graph/geometry'
import type { Vector } from '@kalka/scene-graph/primitives'

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

export function createArtboardFrame(ownerDocument: Document, nodeId: string): HTMLIFrameElement {
  const frame = ownerDocument.createElement('iframe')
  frame.setAttribute('sandbox', ARTBOARD_SANDBOX)
  frame.setAttribute('aria-hidden', 'true')
  frame.setAttribute('tabindex', '-1')
  frame.dataset.kalkaArtboard = nodeId
  // A design draws in light colors whatever the editor's theme. The frame states the same color
  // scheme as its document: when they differ, browsers paint the frame opaque, and a frame
  // without fills would show white instead of the canvas.
  frame.style.cssText =
    'position:absolute;left:0;top:0;border:0;margin:0;padding:0;background:transparent;pointer-events:none;overflow:hidden;color-scheme:light'
  frame.srcdoc = artboardSrcdoc()
  return frame
}

export type ArtboardFontFace = BrowserFontFace

/** How far, in whole pixels, a layer draws past each side of its box. */
export interface ArtboardInk {
  top: number
  right: number
  bottom: number
  left: number
}

const CLIPPING_TYPES = new Set<SceneNode['type']>(['FRAME', 'COMPONENT', 'INSTANCE'])

/**
 * Where a top-level layer's box sits before it turns, which is where its element is laid out:
 * CSS turns the element about its center, or a line about its start, as the layer does. The
 * absolute position is where the turned box's corner lands instead.
 */
export function artboardOrigin(graph: SceneGraph, node: SceneNode): Vector {
  const parent = node.parentId ? graph.getAbsolutePosition(node.parentId) : { x: 0, y: 0 }
  return { x: parent.x + node.x, y: parent.y + node.y }
}

/**
 * What a top-level layer draws outside its box: strokes centred on or outside the edge,
 * arrowheads, shadows and blurs, and the children of a layer that does not clip them. A frame
 * that clips is measured alone, without walking what it holds.
 */
export function artboardInk(graph: SceneGraph, node: SceneNode): ArtboardInk {
  const origin = artboardOrigin(graph, node)
  const position = (id: string) => (id === node.id ? origin : graph.getAbsolutePosition(id))
  const drawn =
    CLIPPING_TYPES.has(node.type) && node.clipsContent
      ? nodeVisualBounds(node, position)
      : computeDescendantVisualBounds([node.id], (id) => graph.getNode(id), position)
  // Visual bounds turn every layer about its center; a line turns about where it starts.
  const box = getNodeWorldBounds({ ...node, ...origin })
  const effects = effectOverflow(node.effects)
  const stroke = strokeOverflow(node.strokes, node.strokeCap, node.vectorNetwork)
  const bounds = unionVisualBounds(drawn, {
    minX: box.x - stroke - effects.left,
    minY: box.y - stroke - effects.top,
    maxX: box.x + box.width + stroke + effects.right,
    maxY: box.y + box.height + stroke + effects.bottom
  })
  if (!bounds) return { top: 0, right: 0, bottom: 0, left: 0 }
  const reach = (value: number) => Math.max(0, Math.ceil(value - 1e-6))
  return {
    top: reach(origin.y - bounds.minY),
    right: reach(bounds.maxX - origin.x - node.width),
    bottom: reach(bounds.maxY - origin.y - node.height),
    left: reach(origin.x - bounds.minX)
  }
}

/**
 * Sizes and places an artboard's iframe from the layer's geometry. The iframe reaches past the
 * layer's box as far as the layer draws, and its body is padded by as much, so the layer still
 * sits at its own position: a document clips what lies outside it.
 */
export function placeArtboardFrame(
  frame: HTMLIFrameElement,
  doc: Document | null,
  graph: SceneGraph,
  node: SceneNode
): void {
  const position = artboardOrigin(graph, node)
  const ink = artboardInk(graph, node)
  const style = frame.style
  const left = `${position.x - ink.left}px`
  const top = `${position.y - ink.top}px`
  const width = `${Math.max(1, node.width) + ink.left + ink.right}px`
  const height = `${Math.max(1, node.height) + ink.top + ink.bottom}px`
  if (style.left !== left) style.left = left
  if (style.top !== top) style.top = top
  if (style.width !== width) style.width = width
  if (style.height !== height) style.height = height
  const body = doc?.body
  if (!body) return
  const padding = `${ink.top}px ${ink.right}px ${ink.bottom}px ${ink.left}px`
  if (body.style.padding !== padding) body.style.padding = padding
}

/**
 * Adds a font to an artboard's own font set. Each iframe is a document of its own: fonts the
 * editor loaded are not visible in it until added there, through its own `FontFace`.
 */
const TOKENS_STYLE_ATTR = 'data-kalka-tokens'

/** Replaces the variables stylesheet of an artboard document. */
export function setArtboardTokens(doc: Document, css: string): void {
  let style = doc.head.querySelector<HTMLStyleElement>(`style[${TOKENS_STYLE_ATTR}]`)
  if (!style) {
    style = doc.createElement('style')
    style.setAttribute(TOKENS_STYLE_ATTR, '')
    doc.head.append(style)
  }
  style.textContent = css
}

export function addArtboardFont(doc: Document, face: ArtboardFontFace): void {
  const view = doc.defaultView
  if (!view) return
  const fontFace = new view.FontFace(face.family, face.data, {
    weight: face.weight,
    style: face.style
  })
  doc.fonts.add(fontFace)
  void fontFace.load().catch(() => doc.fonts.delete(fontFace))
}
