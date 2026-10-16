import { buildOpenPencilClipboardHTML } from '@kalka/core/clipboard'

import { isDesignClipboardHTML } from './html'

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
  const { browserHTMLToSceneGraph } = await import('@kalka/dom-css/browser')
  const graph = await browserHTMLToSceneGraph(html, { pageName: 'Pasted HTML' })
  const roots = graph.getPages().flatMap((page) => graph.getChildren(page.id))
  if (roots.length === 0) return null
  return buildOpenPencilClipboardHTML(roots, graph)
}
