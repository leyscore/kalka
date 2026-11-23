import { linkedStylesheets, webFontCSS } from '@/app/document/io/web-fonts'

import { isDesignClipboardHTML } from './html'

/** A whole page lays out at a desktop window's width, as its author mostly designed it. */
const PAGE_VIEWPORT_WIDTH = 1440

/**
 * A whole page rather than a fragment: a saved file or page source carries a doctype or a head
 * with its styles. A selection copied from a browser comes wrapped in `<html><body>` but has
 * neither, and keeps the importer's own window width.
 */
export function isWholePage(html: string): boolean {
  if (/^\s*<!doctype\s+html/i.test(html)) return true
  const head = /<head[\s>][\s\S]*?<\/head>/i.exec(html)
  return head !== null && /<(?:style|link)[\s>]/i.test(head[0])
}

/** Markup a person copied from a page or a code editor, rather than Kalka's or Figma's layers. */
export function isExternalHTML(html: string): boolean {
  return !isDesignClipboardHTML(html) && /<[a-z][\s\S]*>/i.test(html)
}

/** Source code copied as plain text that reads as HTML, such as a component from an editor. */
export function isHTMLSource(text: string): boolean {
  const trimmed = text.trim()
  return trimmed.startsWith('<') && trimmed.endsWith('>') && /<[a-z][\w-]*[\s>/]/i.test(trimmed)
}

/**
 * External HTML as Kalka's own clipboard data, so it pastes like copied layers: at the same
 * place, as one undo step, selected. The DOM/CSS importer lays it out in a sandboxed document
 * that keeps nothing able to run.
 */
export async function externalHTMLAsDesignClipboard(html: string): Promise<string | null> {
  const [{ browserHTMLToSceneGraph }, { buildKalkaClipboardHTML }] = await Promise.all([
    import('@kalka/dom-css/browser'),
    // Kalka's clipboard format carries the `.fig` codec, which only a paste needs.
    import('@kalka/core/clipboard')
  ])
  const page = isWholePage(html)
  // The page's web fonts measure its text; its other linked stylesheets stay unread.
  const cssText = await webFontCSS(linkedStylesheets(html))
  const graph = await browserHTMLToSceneGraph(html, {
    pageName: 'Pasted HTML',
    cssText: cssText || undefined,
    compute: page ? { viewportWidth: PAGE_VIEWPORT_WIDTH } : undefined
  })
  const roots = graph.getPages().flatMap((page) => graph.getChildren(page.id))
  if (roots.length === 0) return null
  return buildKalkaClipboardHTML(roots, graph)
}
