import {
  ARTBOARD_CSS,
  artboardAttributes,
  sceneNodeToDesignDocument,
  type VectorElementRenderer
} from '@kalka/dom-css/export'
import type { SceneGraph } from '@kalka/scene-graph'

import { buildNode, patchAttributes } from './build'
import { artboardFrameBox, type ArtboardFontFace } from './frame'
import { fontFaceCSS } from './raster'
import { SNAPSHOT_MAX_PIXELS } from './tiers'

const SVG_NS = 'http://www.w3.org/2000/svg'
const XHTML_NS = 'http://www.w3.org/1999/xhtml'

/** How many device pixels a snapshot takes per canvas unit: the zoom's, within its budget. */
export function snapshotScale(
  box: { width: number; height: number },
  zoom: number,
  pixelRatio: number,
  maxPixels = SNAPSHOT_MAX_PIXELS
): number {
  const wanted = Math.max(zoom * pixelRatio, 1e-3)
  const area = box.width * box.height
  if (area <= 0) return wanted
  return Math.min(wanted, Math.sqrt(maxPixels / area))
}

export interface SnapshotSource {
  graph: SceneGraph
  nodeId: string
  fonts: readonly ArtboardFontFace[]
  vectorElement?: VectorElementRenderer
  fontFallbacks?: readonly string[]
}

/** The rules embedding each face, kept for the files they were made from. */
export class EmbeddedFonts {
  private readonly rules = new WeakMap<ArrayBuffer, string>()

  ruleFor(face: ArtboardFontFace): string {
    let rule = this.rules.get(face.data)
    if (!rule) {
      rule = fontFaceCSS(face)
      this.rules.set(face.data, rule)
    }
    return rule
  }
}

export interface SnapshotImage {
  /** An SVG document that draws the artboard as its iframe would. */
  svg: string
  /** Its size in device pixels. */
  width: number
  height: number
}

/**
 * An artboard as a standalone SVG image: its layers built by the same projection and DOM builder
 * as its iframe, in a `foreignObject` the size of the iframe, with the fonts its text names
 * embedded. The browser draws it as it draws the iframe; an image loads nothing, so images and
 * fonts are inlined, as the projection already inlines images.
 */
export function snapshotImage(
  source: SnapshotSource,
  scale: number,
  fonts: EmbeddedFonts,
  ownerDocument: Document = document
): SnapshotImage | null {
  const { graph, nodeId } = source
  const node = graph.getNode(nodeId)
  if (!node) return null
  const projected = sceneNodeToDesignDocument(graph, nodeId, {
    includeSourceIds: false,
    tokens: false,
    vectorElement: source.vectorElement,
    derivedSizes: true,
    fontFallbacks: source.fontFallbacks
  }).children.at(0)
  if (projected?.type !== 'element') return null
  const box = artboardFrameBox(graph, node)
  const doc = ownerDocument.implementation.createHTMLDocument('')
  const built = buildNode(doc, projected)
  if (!(built instanceof Element)) return null
  patchAttributes(built, artboardAttributes(node, projected))

  const html = doc.createElementNS(XHTML_NS, 'html')
  const head = doc.createElementNS(XHTML_NS, 'head')
  const style = doc.createElementNS(XHTML_NS, 'style')
  const body = doc.createElementNS(XHTML_NS, 'body')
  body.setAttribute(
    'style',
    `width:${box.width}px;height:${box.height}px;padding:${box.ink.top}px ${box.ink.right}px ${box.ink.bottom}px ${box.ink.left}px`
  )
  body.append(built)
  const markup = new XMLSerializer().serializeToString(body)
  const used = source.fonts.filter((face) => markup.includes(face.family))
  style.textContent = ARTBOARD_CSS + used.map((face) => fonts.ruleFor(face)).join('')
  head.append(style)
  html.append(head, body)

  const width = Math.max(1, Math.round(box.width * scale))
  const height = Math.max(1, Math.round(box.height * scale))
  const svg = doc.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('width', String(width))
  svg.setAttribute('height', String(height))
  svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`)
  const foreign = doc.createElementNS(SVG_NS, 'foreignObject')
  foreign.setAttribute('width', String(box.width))
  foreign.setAttribute('height', String(box.height))
  foreign.append(html)
  svg.append(foreign)
  return { svg: new XMLSerializer().serializeToString(svg), width, height }
}

/** Draws a snapshot image into a bitmap; null when the browser could not. */
export async function rasterizeSnapshot(image: SnapshotImage): Promise<ImageBitmap | null> {
  const url = URL.createObjectURL(new Blob([image.svg], { type: 'image/svg+xml' }))
  try {
    const element = new Image(image.width, image.height)
    element.decoding = 'async'
    element.src = url
    await element.decode()
    return await createImageBitmap(element)
  } catch {
    return null
  } finally {
    URL.revokeObjectURL(url)
  }
}
