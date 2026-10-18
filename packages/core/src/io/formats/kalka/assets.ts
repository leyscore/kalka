import { computeImageHash, imageExtension } from '@kalka/scene-graph/images'

import { IMAGES_DIR } from './constants'

/** Characters an image hash keeps in its file name; others become `_<code point>_`. */
const FILE_SAFE = /[^A-Za-z0-9-]/gu

function fileSafe(hash: string): string {
  return hash.replace(FILE_SAFE, (char) => `_${char.codePointAt(0)?.toString(16) ?? ''}_`)
}

function fromFileSafe(name: string): string {
  return name.replaceAll(/_([0-9a-f]+)_/g, (_, code: string) =>
    String.fromCodePoint(Number.parseInt(code, 16))
  )
}

/** Where an image is saved in the folder: named by its hash, so saving twice writes the same. */
export function imageFilePath(hash: string, bytes: Uint8Array): string {
  return `${IMAGES_DIR}/${fileSafe(hash)}.${imageExtension(bytes)}`
}

/** The hash an image file under `assets/images/` holds, from its name. */
export function imageHashFromPath(path: string): string | null {
  if (!path.startsWith(`${IMAGES_DIR}/`)) return null
  const file = path.slice(IMAGES_DIR.length + 1)
  if (file.includes('/')) return null
  const dot = file.lastIndexOf('.')
  const stem = dot > 0 ? file.slice(0, dot) : file
  return stem ? fromFileSafe(stem) : null
}

/** Where a page, saved under `pages/`, finds a folder file. */
export function pageRelativePath(path: string): string {
  return `../${path}`
}

/** The image a page's `src` or `href` names, when it is one of the folder's images. */
export function imageSourceResolver(images: ReadonlyMap<string, Uint8Array>) {
  return (source: string): string | null => {
    if (!source.startsWith('../')) return null
    const hash = imageHashFromPath(source.slice(3))
    return hash !== null && images.has(hash) ? hash : null
  }
}

/** Image hashes by the hash of their bytes, to name images an SVG drawing embeds. */
export function imagesByContent(images: ReadonlyMap<string, Uint8Array>): Map<string, string> {
  return new Map([...images].map(([hash, bytes]) => [computeImageHash(bytes), hash]))
}
