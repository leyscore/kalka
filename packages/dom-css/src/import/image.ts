import { isValid, toUint8Array } from 'js-base64'

import type { Fill, ImageScaleMode, SceneGraph, SceneNode } from '@kalka/scene-graph'
import { TRANSPARENT } from '@kalka/scene-graph/constants'
import {
  pickStyle,
  readLayerStyle,
  type CSSDeclarations,
  type ReadContext
} from '@kalka/scene-graph/css-model'
import { computeImageHash } from '@kalka/scene-graph/images'

import { DOM_CSS_PLUGIN_ID, IMAGE_SOURCE_URL_KEY } from '../export/tags'
import type { DesignElement } from '../types'

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
