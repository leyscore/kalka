import { isValid, toUint8Array } from 'js-base64'

import type { Fill, ImageScaleMode, SceneGraph, SceneNode } from '@kalka/scene-graph'
import { TRANSPARENT } from '@kalka/scene-graph/constants'
import { parseCSSColor } from '@kalka/scene-graph/css'
import {
  pickStyle,
  readLayerStyle,
  type CSSDeclarations,
  type ReadContext
} from '@kalka/scene-graph/css-model'
import { computeImageHash } from '@kalka/scene-graph/images'

import { DOM_CSS_PLUGIN_ID, IMAGE_SOURCE_URL_KEY, PHOTO_DESCRIPTION_KEY } from '../export/tags'
import type { DesignElement } from '../types'
import { photoPlaceholderSVG } from './photo-placeholder'

/** The image hash an `<img src>` names in the graph, for sources that are not data URLs. */
export type ImageSourceResolver = (source: string) => string | null

function imageScaleModeFromObjectFit(value: string | undefined): ImageScaleMode | null {
  if (value === 'contain' || value === 'scale-down') return 'FIT'
  if (value === 'cover') return 'FILL'
  return null
}

function bytesFromDataURL(value: string | undefined): Uint8Array | null {
  if (!value?.startsWith('data:')) return null
  const commaIndex = value.indexOf(',')
  if (commaIndex === -1) return null
  const metadata = value.slice(0, commaIndex)
  const body = value.slice(commaIndex + 1)
  // Invalid Base64 in imported HTML drops that image instead of the whole import.
  if (!metadata.endsWith(';base64') || !isValid(body)) return null
  return toUint8Array(body)
}

function imageFill(hash: string, style: CSSDeclarations): Fill {
  return {
    type: 'IMAGE',
    imageHash: hash,
    imageScaleMode: imageScaleModeFromObjectFit(pickStyle(style, 'object-fit')) ?? 'FILL',
    color: TRANSPARENT,
    opacity: 1,
    visible: true
  }
}

/** The image an `<img>` shows becomes the layer's fill: from a data URL, or a file the caller names. */
function readImage(
  graph: SceneGraph,
  node: SceneNode,
  style: CSSDeclarations,
  element: DesignElement,
  resolveImage: ImageSourceResolver | undefined
): void {
  if (element.tagName.toLowerCase() !== 'img') return
  const source = element.attrs.src
  if ('data-photo' in element.attrs) {
    const photo = element.attrs['data-photo']
    node.pluginData.push({ pluginId: DOM_CSS_PLUGIN_ID, key: PHOTO_DESCRIPTION_KEY, value: photo })
    // No picture yet, or the placeholder an earlier export wrote: draw it again at today's size.
    if (!source || source.startsWith('data:image/svg+xml')) {
      readPhotoPlaceholder(graph, node, style, element, photo)
      return
    }
  }
  const resolved = source && resolveImage ? resolveImage(source) : null
  if (resolved) {
    node.fills = [imageFill(resolved, style)]
    return
  }
  const bytes = bytesFromDataURL(source)
  if (!bytes) {
    if (source)
      node.pluginData.push({
        pluginId: DOM_CSS_PLUGIN_ID,
        key: IMAGE_SOURCE_URL_KEY,
        value: source
      })
    return
  }
  const imageHash = computeImageHash(bytes)
  graph.images.set(imageHash, bytes)
  node.fills = [imageFill(imageHash, style)]
}

/** The stand-in for a photograph still to come, drawn at the size the element measured. */
function readPhotoPlaceholder(
  graph: SceneGraph,
  node: SceneNode,
  style: CSSDeclarations,
  element: DesignElement,
  description: string
): void {
  const markup = photoPlaceholderSVG({
    description,
    width: element.layoutBox?.width || undefined,
    height: element.layoutBox?.height || undefined,
    ink: parseCSSColor(pickStyle(style, 'color'))
  })
  node.fills = [svgImageFill(graph, markup)]
  if (description.trim() && node.name === element.tagName) node.name = description.trim()
}

/** An SVG file as the image that fills a layer, stored in the graph. */
export function svgImageFill(graph: SceneGraph, markup: string): Fill {
  const bytes = new TextEncoder().encode(markup)
  const imageHash = computeImageHash(bytes)
  graph.images.set(imageHash, bytes)
  return imageFill(imageHash, {})
}

export interface ElementStyleContext {
  /** The element the CSS is on: its measured box scales gradients, an `<img>` carries an image. */
  element?: DesignElement
  resolveImage?: ImageSourceResolver
  projected?: ReadContext['projected']
}

/** A layer's CSS read through the mapping table, then what only the element itself says. */
export function readElementStyle(
  graph: SceneGraph,
  node: SceneNode,
  style: CSSDeclarations,
  { element, resolveImage, projected }: ElementStyleContext = {}
): void {
  readLayerStyle(node, style, { box: element?.layoutBox, projected })
  if (element && node.type !== 'TEXT') readImage(graph, node, style, element, resolveImage)
}
