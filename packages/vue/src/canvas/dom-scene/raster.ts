import { fromUint8Array } from 'js-base64'

import { computeContentBounds, vectorElement } from '@kalka/core/io'
import { sceneNodeToDesignDocument } from '@kalka/dom-css/export'
import type { SceneGraph } from '@kalka/scene-graph'

import { buildNode, patchAttributes, elementAttributes } from './build'
import { ARTBOARD_CSP, ARTBOARD_CSS, type ArtboardFontFace } from './frame'

/** A standalone page that draws some layers exactly as their artboards do, for a raster export. */
export interface RasterDocument {
  html: string
  /** The page's size in CSS pixels, before any export scale. */
  width: number
  height: number
}

function fontFaceCSS(face: ArtboardFontFace): string {
  const data = fromUint8Array(new Uint8Array(face.data))
  return `@font-face{font-family:${JSON.stringify(face.family)};src:url(data:font/ttf;base64,${data});font-weight:${face.weight};font-style:${face.style}}`
}

/**
 * Lays `nodeIds` out on one page sized to what they draw, shadows and strokes included, each at
 * its place relative to the others. Layers are built by the same projection and DOM builder as
 * the canvas, fonts and images are inlined, and the artboard CSP keeps the page off the network.
 * Only fonts the layers name are embedded.
 */
export function rasterDocument(
  graph: SceneGraph,
  nodeIds: readonly string[],
  fonts: readonly ArtboardFontFace[],
  ownerDocument: Document = document
): RasterDocument | null {
  const bounds = computeContentBounds(graph, [...nodeIds])
  if (!bounds) return null
  const width = Math.max(1, Math.ceil(bounds.maxX - bounds.minX))
  const height = Math.max(1, Math.ceil(bounds.maxY - bounds.minY))

  const doc = ownerDocument.implementation.createHTMLDocument('')
  for (const id of nodeIds) {
    const node = graph.getNode(id)
    const projected = sceneNodeToDesignDocument(graph, id, {
      includeSourceIds: false,
      tokens: false,
      vectorElement,
      derivedSizes: true
    }).children.at(0)
    if (!node || projected?.type !== 'element') continue
    const built = buildNode(doc, projected)
    if (!(built instanceof Element)) continue
    // As in its artboard: a layer that hugs its content keeps its own width.
    const attrs = elementAttributes(projected)
    const hugsWidth =
      node.type === 'TEXT' ? node.textAutoResize === 'WIDTH_AND_HEIGHT' : node.layoutMode !== 'NONE'
    let style = attrs.get('style') ?? ''
    if (!projected.inlineStyle?.width && hugsWidth) style += 'width:max-content;'
    // A nested layer is placed by its parent; here its box below places it instead.
    attrs.set('style', `${style}position:relative;left:0;top:0;right:auto;bottom:auto;margin:0;`)
    patchAttributes(built, attrs)
    // The box its artboard iframe would be, placed relative to the export's bounds.
    const position = graph.getAbsolutePosition(id)
    const box = doc.createElement('div')
    box.setAttribute(
      'style',
      `position:absolute;left:${position.x - bounds.minX}px;top:${position.y - bounds.minY}px;width:${Math.max(1, node.width)}px;height:${Math.max(1, node.height)}px`
    )
    box.append(built)
    doc.body.append(box)
  }

  const body = doc.body.innerHTML
  const usedFonts = fonts.filter((face) => body.includes(face.family))
  const css = ARTBOARD_CSS + usedFonts.map(fontFaceCSS).join('')
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${ARTBOARD_CSP}"><style>${css}</style></head><body style="position:relative;width:${width}px;height:${height}px">${body}</body></html>`
  return { html, width, height }
}
