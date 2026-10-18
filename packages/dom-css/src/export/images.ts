import { isValid, toUint8Array } from 'js-base64'
import { parseFragment, type DefaultTreeAdapterTypes } from 'parse5'

import { computeImageHash, imageExtension } from '@kalka/scene-graph/images'

import type { ExportHTMLFile } from './bundle'

type ParseNode = DefaultTreeAdapterTypes.Node
type ParseElement = DefaultTreeAdapterTypes.Element

/**
 * An image a page embeds as Base64: every raster format and SVG files. SVG written out as text,
 * such as the tiles of patterns and the shapes of masks, is a few lines of vector code and stays
 * in the page.
 */
const DATA_IMAGE = /data:image\/[\w.+-]+;base64,([^"'\s()&<>]*)/g

/** The attributes that can hold an image: its source, an SVG `<image>`'s link, or CSS. */
const IMAGE_ATTRIBUTES = new Set(['src', 'srcset', 'poster', 'href', 'xlink:href', 'style'])

/** What an embedded image becomes, from its bytes; undefined leaves the data URL as it is. */
export type DataImageReplacer = (bytes: Uint8Array) => string | undefined

/** `text` with each embedded image, in CSS or an attribute value, replaced. */
export function replaceDataImages(text: string, replace: DataImageReplacer): string {
  if (!text.includes('data:image/')) return text
  return text.replace(DATA_IMAGE, (url, base64: string) => {
    // Documents can come from parsed HTML; an invalid payload stays rather than decode to other bytes.
    const bytes = isValid(base64) ? decoded(base64) : undefined
    return (bytes && replace(bytes)) ?? url
  })
}

/** The bytes Base64 holds, or undefined for a payload `isValid` lets through but cannot decode. */
function decoded(base64: string): Uint8Array | undefined {
  try {
    return toUint8Array(base64)
  } catch {
    return undefined
  }
}

function isElement(node: ParseNode): node is ParseElement {
  return 'attrs' in node && 'tagName' in node
}

/** The source ranges of `html` where images can be: image attributes and `<style>` text. */
function imageRanges(html: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = []
  const visit = (node: ParseNode) => {
    if (isElement(node)) {
      const attrs = node.sourceCodeLocation?.attrs
      for (const attr of node.attrs) {
        const at = IMAGE_ATTRIBUTES.has(attr.name) ? attrs?.[attr.name] : undefined
        if (at) ranges.push([at.startOffset, at.endOffset])
      }
      if (node.tagName === 'style') {
        for (const child of node.childNodes) {
          const at = child.nodeName === '#text' ? child.sourceCodeLocation : undefined
          if (at) ranges.push([at.startOffset, at.endOffset])
        }
      }
    }
    if ('childNodes' in node) for (const child of node.childNodes) visit(child)
  }
  visit(parseFragment(html, { sourceCodeLocationInfo: true }))
  return ranges.toSorted((a, b) => a[0] - b[0])
}

/**
 * `html` with `rewrite` applied to where images can be — image attributes and `<style>` rules —
 * and every other character kept as written, so text that happens to look like a URL stays.
 */
export function rewriteHTMLImageSources(html: string, rewrite: (text: string) => string): string {
  let result = ''
  let at = 0
  for (const [start, end] of imageRanges(html)) {
    if (start < at) continue
    result += html.slice(at, start) + rewrite(html.slice(start, end))
    at = end
  }
  return result + html.slice(at)
}

/** Each embedded image of an HTML page or fragment replaced, in attributes and `<style>`. */
export function replaceHTMLDataImages(html: string, replace: DataImageReplacer): string {
  if (!html.includes('data:image/')) return html
  return rewriteHTMLImageSources(html, (text) => replaceDataImages(text, replace))
}

/** A relative path as a URL: each segment escaped, so names with spaces or `#` still resolve. */
export function relativeURL(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/')
}

/**
 * Collects the images a bundle links instead of embedding: each one a file under
 * `<folder>/images/` named by the SHA-1 of its bytes and the extension they call for, so the same
 * image is one file however often it is used and exporting again writes the same names.
 */
export function imageFileCollector(folder: string) {
  const files = new Map<string, ExportHTMLFile>()
  return {
    /** The files linked so far, in the order they were first linked. */
    files: (): ExportHTMLFile[] => [...files.values()],
    /** A replacer linking images from a file in the folder `from`; `''` for the page's own. */
    linkFrom(from: string): DataImageReplacer {
      return (bytes) => {
        const extension = imageExtension(bytes)
        if (extension === 'bin') return undefined
        const path = `${folder}/images/${computeImageHash(bytes)}.${extension}`
        if (!files.has(path)) files.set(path, { path, content: bytes })
        return relativeURL(from && path.startsWith(`${from}/`) ? path.slice(from.length + 1) : path)
      }
    }
  }
}
