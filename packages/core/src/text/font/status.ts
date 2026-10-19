import type { SceneGraph, SceneNode } from '@kalka/scene-graph'

import { DEFAULT_FONT_FAMILY } from '#core/constants'
import type { FontLoadedSource, FontUnavailableReason } from '#core/text/font/sources'
import { fontManager, type FontManager } from '#core/text/fonts'
import { cssFontFamily } from '#core/text/inter'
import { collectNodeFontFaces } from '#core/text/requirements'

export type FontFaceStatus = 'available' | 'substituted' | 'unresolved'

export interface DocumentFontFaceStatus {
  family: string
  style: string
  status: FontFaceStatus
  source: FontLoadedSource | null
  substituteFamily: string | null
  /** Why the requested face could not be loaded, when the host reported a reason. */
  reason: FontUnavailableReason | null
  nodeIds: string[]
  nodeNames: string[]
}

export interface DocumentFontStatus {
  faithful: boolean
  faces: DocumentFontFaceStatus[]
  issues: DocumentFontFaceStatus[]
}

interface MutableFontFaceUse {
  /** The family the text names. */
  family: string
  /** The family Kalka loads it under. */
  loadedFamily: string
  style: string
  nodeIds: Set<string>
  nodeNames: Set<string>
}

function faceKey(family: string, style: string): string {
  return `${family}\0${style}`
}

function rootTextNodes(graph: SceneGraph, rootIds: readonly string[]): SceneNode[] {
  return rootIds.flatMap((rootId) =>
    graph.flattenTree(rootId).flatMap(({ node }) => (node.type === 'TEXT' ? [node] : []))
  )
}

/** The faces one text layer uses, as Kalka loads them, keyed so a layer's set compares cheaply. */
interface NodeFaces {
  name: string
  faces: { family: string; style: string }[]
  key: string
}

function nodeFaces(node: SceneNode, interVersion: SceneGraph['interVersion']): NodeFaces {
  const faces = collectNodeFontFaces(node, interVersion)
  return {
    name: node.name,
    faces,
    key: faces.map(({ family, style }) => faceKey(family, style)).join('\n')
  }
}

function faceUses(byNode: Iterable<[string, NodeFaces]>): MutableFontFaceUse[] {
  const uses = new Map<string, MutableFontFaceUse>()
  for (const [nodeId, { name, faces }] of byNode) {
    for (const { family: loadedFamily, style } of faces) {
      const key = faceKey(loadedFamily, style)
      const use = uses.get(key) ?? {
        family: cssFontFamily(loadedFamily),
        loadedFamily,
        style,
        nodeIds: new Set<string>(),
        nodeNames: new Set<string>()
      }
      use.nodeIds.add(nodeId)
      use.nodeNames.add(name)
      uses.set(key, use)
    }
  }
  return [...uses.values()]
}

function collectFaceUses(graph: SceneGraph, rootIds: readonly string[]): MutableFontFaceUse[] {
  return faceUses(
    rootTextNodes(graph, rootIds).map((node) => [node.id, nodeFaces(node, graph.interVersion)])
  )
}

function faceStatus(use: MutableFontFaceUse, manager: FontManager): DocumentFontFaceStatus {
  const exactSource = manager.loadedFontSource(use.loadedFamily, use.style)
  if (exactSource) {
    return {
      family: use.family,
      style: use.style,
      status: 'available',
      source: exactSource,
      substituteFamily: null,
      reason: null,
      nodeIds: [...use.nodeIds],
      nodeNames: [...use.nodeNames]
    }
  }

  if (manager.isLoaded(use.loadedFamily)) {
    return {
      family: use.family,
      style: use.style,
      status: 'substituted',
      source: null,
      substituteFamily: use.family,
      reason: manager.unavailableReason(use.loadedFamily, use.style),
      nodeIds: [...use.nodeIds],
      nodeNames: [...use.nodeNames]
    }
  }

  const defaultSource = manager.loadedFontSource(DEFAULT_FONT_FAMILY, 'Regular')
  return {
    family: use.family,
    style: use.style,
    status: defaultSource ? 'substituted' : 'unresolved',
    source: null,
    substituteFamily: defaultSource ? DEFAULT_FONT_FAMILY : null,
    reason: manager.unavailableReason(use.loadedFamily, use.style),
    nodeIds: [...use.nodeIds],
    nodeNames: [...use.nodeNames]
  }
}

function statusOfUses(uses: MutableFontFaceUse[], manager: FontManager): DocumentFontStatus {
  const faces = uses
    .map((use) => faceStatus(use, manager))
    .sort((a, b) => a.family.localeCompare(b.family) || a.style.localeCompare(b.style))
  const issues = faces.filter((face) => face.status !== 'available')
  return { faithful: issues.length === 0, faces, issues }
}

export function documentFontStatus(
  graph: SceneGraph,
  rootIds: string | readonly string[],
  manager: FontManager = fontManager
): DocumentFontStatus {
  const roots = typeof rootIds === 'string' ? [rootIds] : rootIds
  return statusOfUses(collectFaceUses(graph, roots), manager)
}

/**
 * The faces a page's text uses, kept current one layer at a time, so an edit to one text costs
 * that text rather than a walk of the page. Gives the same status as {@link documentFontStatus}.
 */
export class PageFontUses {
  private readonly byNode = new Map<string, NodeFaces>()

  constructor(
    private readonly graph: SceneGraph,
    readonly pageId: string
  ) {
    for (const node of rootTextNodes(graph, [pageId]))
      this.byNode.set(node.id, nodeFaces(node, graph.interVersion))
  }

  /**
   * Reads one layer again, after it was created, changed or deleted. True when what it adds to
   * the status changed: its faces, its name, or whether it is on the page at all.
   */
  update(nodeId: string): boolean {
    const node = this.graph.getNode(nodeId)
    const before = this.byNode.get(nodeId)
    if (node?.type !== 'TEXT' || !this.isOnPage(node)) {
      return this.byNode.delete(nodeId)
    }
    const after = nodeFaces(node, this.graph.interVersion)
    this.byNode.set(nodeId, after)
    return before?.key !== after.key || before.name !== after.name
  }

  status(manager: FontManager = fontManager): DocumentFontStatus {
    return statusOfUses(faceUses(this.byNode), manager)
  }

  private isOnPage(node: SceneNode): boolean {
    let current: SceneNode | undefined = node
    while (current?.parentId) {
      if (current.parentId === this.pageId) return true
      current = this.graph.getNode(current.parentId)
    }
    return false
  }
}
