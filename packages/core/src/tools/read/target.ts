import type { FigmaAPI, FigmaNodeProxy } from '#core/figma-api'

/** What a Figma-named read tool reads: the node it names, else the selection. */
export type FigmaToolTarget =
  | { kind: 'node'; nodes: FigmaNodeProxy[] }
  | { kind: 'selection'; nodes: FigmaNodeProxy[] }
  | { kind: 'none' }
  | { kind: 'missing'; nodeId: string }

/**
 * The layers a tool with Figma's `nodeId` argument reads: that node when one is named, the
 * selection when none is, and nothing when neither is, for the tool to fall back on its own.
 */
export function resolveFigmaToolTarget(figma: FigmaAPI, nodeId?: string): FigmaToolTarget {
  if (nodeId) {
    const node = figma.getNodeById(nodeId)
    return node ? { kind: 'node', nodes: [node] } : { kind: 'missing', nodeId }
  }
  const selection = figma.currentPage.selection
  return selection.length > 0 ? { kind: 'selection', nodes: selection } : { kind: 'none' }
}

/** The document's pages by ID and name, which Figma's tools list when a call names no node. */
export function documentPages(figma: FigmaAPI): Array<{ id: string; name: string }> {
  return figma.root.children.map((page) => ({ id: page.id, name: page.name }))
}
