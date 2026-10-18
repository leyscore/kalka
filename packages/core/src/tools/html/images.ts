import { fromUint8Array } from 'js-base64'

import { replaceHTMLDataImages, rewriteHTMLImageSources } from '@kalka/dom-css/export'
import type { SceneGraph } from '@kalka/scene-graph'
import { computeImageHash, imageDimensions, imageExtension } from '@kalka/scene-graph/images'

/**
 * How HTML for agents names a document image instead of embedding its bytes:
 * `kalka-image:<hash>`, the name the image is stored under.
 */
export const IMAGE_REFERENCE_SCHEME = 'kalka-image:'

const IMAGE_REFERENCE = /kalka-image:([0-9A-Za-z_-]+)/g
const REFERENCE_HASH = /^[0-9A-Za-z_-]+$/

const MIME_TYPES: Readonly<Record<string, string>> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  svg: 'image/svg+xml'
}

/** An image HTML for agents refers to, described rather than embedded. */
export interface HTMLImageReference {
  src: string
  mimeType: string
  width?: number
  height?: number
  byteLength: number
}

/** The hash each image is stored under, by the hash of its bytes; most are the same. */
function storedHashes(graph: SceneGraph): Map<string, string> {
  return new Map([...graph.images].map(([hash, bytes]) => [computeImageHash(bytes), hash]))
}

/**
 * `html` with each embedded image replaced by a `kalka-image:<hash>` reference, and the images
 * it refers to, so an agent reads the structure without kilobytes of Base64.
 */
export function referenceHTMLImages(
  graph: SceneGraph,
  html: string
): { html: string; images: HTMLImageReference[] } {
  const images = new Map<string, HTMLImageReference>()
  let hashes: Map<string, string> | undefined
  const referenced = replaceHTMLDataImages(html, (bytes) => {
    hashes ??= storedHashes(graph)
    const hash = hashes.get(computeImageHash(bytes))
    // A name a reference cannot spell, from an older document, keeps the image embedded.
    if (hash === undefined || !REFERENCE_HASH.test(hash)) return undefined
    const src = `${IMAGE_REFERENCE_SCHEME}${hash}`
    if (!images.has(src)) {
      const size = imageDimensions(bytes)
      images.set(src, {
        src,
        mimeType: MIME_TYPES[imageExtension(bytes)] ?? 'application/octet-stream',
        ...size,
        byteLength: bytes.length
      })
    }
    return src
  })
  return { html: referenced, images: [...images.values()] }
}

/**
 * `html` with each `kalka-image:<hash>` reference to an image the document holds embedded again,
 * so HTML read with `get_html` can be written back with its images.
 */
export function resolveHTMLImageReferences(graph: SceneGraph, html: string): string {
  if (!html.includes(IMAGE_REFERENCE_SCHEME)) return html
  return rewriteHTMLImageSources(html, (text) =>
    text.replace(IMAGE_REFERENCE, (reference, hash: string) => {
      const bytes = graph.images.get(hash)
      if (!bytes) return reference
      const mimeType = MIME_TYPES[imageExtension(bytes)] ?? 'image/png'
      return `data:${mimeType};base64,${fromUint8Array(bytes)}`
    })
  )
}
