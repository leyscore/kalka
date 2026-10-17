import { DOMParser, type Document } from '@xmldom/xmldom'

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'

function parseXML(source: string): Document | null {
  try {
    return new DOMParser({
      onError: (level, message) => {
        if (level !== 'warning') throw new Error(message)
      }
    }).parseFromString(source, 'image/svg+xml')
  } catch {
    return null
  }
}

/**
 * What an SVG file holds before its root element: a byte order mark, the XML declaration,
 * processing instructions, a doctype (with its internal subset), and comments.
 */
const XML_PROLOG =
  /^﻿?\s*(?:(?:<\?[\s\S]*?\?>|<!--[\s\S]*?-->|<!DOCTYPE[^[>]*(?:\[[\s\S]*?\])?\s*>)\s*)*/i

/**
 * SVG markup from its root element on. Files saved by editors start with an XML declaration or
 * a doctype, which may not sit inside an element, where the importer parses a document's body.
 */
export function stripXMLProlog(source: string): string {
  return source.replace(XML_PROLOG, '')
}

export function parseSVGDocument(source: string): Document | null {
  const xmlDocument = parseXML(stripXMLProlog(source))
  return xmlDocument?.documentElement?.localName === 'svg' ? xmlDocument : null
}

export function parseSVGFragment(source: string): Document | null {
  return parseXML(`<svg xmlns="${SVG_NAMESPACE}">${source}</svg>`)
}
