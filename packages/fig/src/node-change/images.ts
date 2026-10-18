import type { NodeChange } from '@kalka/kiwi/fig/codec'
import { computeImageHash } from '@kalka/scene-graph'

import { bytesToHex, hexToBytes } from './bytes'

/** The fields of a paint that reference an image. */
const IMAGE_FIELDS = ['image', 'imageThumbnail', 'animatedImage'] as const

/** An image reference as a written paint holds it. */
export interface ImageReference {
  hash?: Uint8Array | string
  dataBlob?: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !ArrayBuffer.isView(value)
}

function isImageReference(value: unknown): value is ImageReference {
  return isRecord(value) && 'hash' in value
}

/**
 * Calls `visit` with every image reference in `value`, however deep: paints sit in fills,
 * strokes, backgrounds, text and vector style overrides, and instance overrides.
 */
function walk(value: unknown, visit: (image: ImageReference) => void): void {
  if (Array.isArray(value)) {
    for (const item of value) walk(item, visit)
    return
  }
  if (!isRecord(value)) return
  for (const field of IMAGE_FIELDS) {
    const image = value[field]
    if (isImageReference(image)) visit(image)
  }
  for (const child of Object.values(value)) walk(child, visit)
}

/** Every image reference the records' paints hold. */
export function forEachImageReference(
  changes: readonly NodeChange[],
  visit: (image: ImageReference) => void
): void {
  walk(changes, visit)
}

function referenceName(image: ImageReference): string | null {
  if (image.hash === undefined) return null
  return typeof image.hash === 'string' ? image.hash : bytesToHex(image.hash)
}

/**
 * Images the records carry in the message's own blobs, by the name their paints use: Figma's
 * clipboard does this, and so do documents saved before Figma kept images beside the message.
 */
export function embeddedImages(
  changes: readonly NodeChange[],
  blobs: readonly Uint8Array[]
): Map<string, Uint8Array> {
  const images = new Map<string, Uint8Array>()
  walk(changes, (image) => {
    const name = referenceName(image)
    const bytes = image.dataBlob === undefined ? undefined : blobs[image.dataBlob]
    if (name && bytes && !images.has(name)) images.set(name, bytes)
  })
  return images
}

/**
 * Figma reads an image only under the SHA-1 of its bytes, and documents saved before images were
 * named by their SHA-1 hold them under other names. Points every image reference in `changes` at
 * its SHA-1. Returns the new name of every image renamed; references to images `images` lacks
 * are left as they are.
 */
export function nameImagesForFigma(
  changes: readonly NodeChange[],
  images: ReadonlyMap<string, Uint8Array>
): Map<string, string> {
  const names = new Map<string, string>()
  const figmaName = (name: string): string | null => {
    const known = names.get(name)
    if (known) return known
    const bytes = images.get(name)
    if (!bytes) return null
    const hash = computeImageHash(bytes)
    names.set(name, hash)
    return hash
  }
  walk(changes, (image) => {
    const name = referenceName(image)
    const renamed = name ? figmaName(name) : null
    if (!renamed || renamed === name) return
    image.hash = typeof image.hash === 'string' ? renamed : hexToBytes(renamed)
  })
  return names
}

/**
 * `images` as a `.fig` archive stores them: each under the name `names` gave it, or the SHA-1 of
 * its bytes when no record references it, and each name once, so images that were stored twice
 * under different names are written once.
 */
export function figImageEntries(
  images: ReadonlyMap<string, Uint8Array>,
  names: ReadonlyMap<string, string>
): Array<{ name: string; data: Uint8Array }> {
  const entries = new Map<string, Uint8Array>()
  for (const [name, data] of images) entries.set(names.get(name) ?? computeImageHash(data), data)
  return [...entries].map(([name, data]) => ({ name: `images/${name}`, data }))
}
