import { sceneNodeToDesignDocument, type VectorElementRenderer } from '@kalka/dom-css/export'
import type { SceneGraph } from '@kalka/scene-graph'

import { buildNode } from './build'
import {
  addArtboardFont,
  createArtboardFrame,
  placeArtboardFrame,
  type ArtboardFontFace
} from './frame'
import type { DomSceneProjector } from './projector'

/** How opaque a preview draws: enough to read, still visibly not part of the document yet. */
const GHOST_OPACITY = '0.88'

/**
 * Layers that are not in the document yet, drawn over the canvas as they would look, such as
 * the JSX an agent is still writing. They live on a private graph and never enter the editor's.
 */
export interface DomScenePreview {
  /** Stable for one stream of previews, so each update redraws in place instead of reloading. */
  key: string
  graph: SceneGraph
  /** The page of `graph`, and of the document, the preview belongs to. */
  pageId: string
  /** The page children of `graph` the preview draws. */
  nodeIds: readonly string[]
  /** A page child of the document the preview stands in for, hidden while the preview shows. */
  replaceId?: string
  /**
   * Where among the page's children new top-level layers go, so the preview stacks there; on
   * top of every layer when absent. A replacement stacks where the layer it replaces does.
   */
  insertIndex?: number
}

/** One drawn page child of a preview, in an artboard document of its own. */
interface GhostFrame {
  frame: HTMLIFrameElement
  /** Null until the iframe's document has loaded. */
  doc: Document | null
  /** The layer drawn last, or waiting for the document to load. */
  nodeId: string | null
  graph: SceneGraph | null
}

interface Ghost {
  preview: DomScenePreview
  /** Holds the preview's frames at its place among the artboards, faded as one. */
  container: HTMLElement
  frames: GhostFrame[]
}

export interface GhostLayerOptions {
  vectorElement?: VectorElementRenderer
  fonts?: () => readonly ArtboardFontFace[]
  /** Families text falls back to for characters its font lacks, as the projector lists them. */
  fontFallbacks?: () => readonly string[]
}

/**
 * Draws previews as real DOM among the page's artboards, at the place in their stacking order the
 * layers they will become take, through the same projection. Nothing here is interactive or read
 * back by layout: the document, its history, and what collaborators receive stay as they are.
 */
export class GhostLayer {
  private readonly ghosts = new Map<string, Ghost>()
  /** The previews last synced, so an unchanged list costs nothing. */
  private synced: readonly DomScenePreview[] = []
  private syncedPage: string | null = null
  /** Document artboards hidden because a preview stands in for them. */
  private readonly hidden = new Set<HTMLIFrameElement>()

  constructor(
    private readonly projector: DomSceneProjector,
    private readonly options: GhostLayerOptions = {}
  ) {}

  /** The keys of the previews on screen. */
  get keys(): string[] {
    return [...this.ghosts.keys()]
  }

  /** Shows `previews` that belong to `pageId`, redrawing only those that changed. */
  sync(previews: readonly DomScenePreview[], pageId: string): void {
    if (previews !== this.synced || pageId !== this.syncedPage) {
      this.synced = previews
      this.syncedPage = pageId
      const shown = previews.filter((preview) => preview.pageId === pageId)
      const keys = new Set(shown.map((preview) => preview.key))
      for (const [key, ghost] of this.ghosts) {
        if (keys.has(key)) continue
        ghost.container.remove()
        this.ghosts.delete(key)
      }
      for (const preview of shown) this.draw(preview)
    }
    this.hideReplaced()
  }

  /** A font loaded after the previews opened. */
  addFont(face: ArtboardFontFace): void {
    for (const ghost of this.ghosts.values()) {
      for (const slot of ghost.frames) if (slot.doc) addArtboardFont(slot.doc, face)
    }
  }

  destroy(): void {
    for (const frame of this.hidden) frame.style.visibility = ''
    this.hidden.clear()
    for (const ghost of this.ghosts.values()) ghost.container.remove()
    this.ghosts.clear()
  }

  private draw(preview: DomScenePreview): void {
    const ghost = this.ghosts.get(preview.key) ?? this.createGhost(preview)
    this.ghosts.set(preview.key, ghost)
    ghost.preview = preview
    const order = String(this.projector.stackOrderAt(this.pageIndex(preview)))
    if (ghost.container.style.zIndex !== order) ghost.container.style.zIndex = order
    const frames = ghost.frames
    // Page children keep their slot by position: a restaged preview gives them new ids.
    while (frames.length > preview.nodeIds.length) frames.pop()?.frame.remove()
    preview.nodeIds.forEach((nodeId, index) => {
      const slot = frames[index] ?? this.createFrame(ghost, index)
      frames[index] = slot
      slot.nodeId = nodeId
      slot.graph = preview.graph
      this.drawSlot(slot)
    })
  }

  /** The page child index the preview draws at, as the canvas will once it is written. */
  private pageIndex(preview: DomScenePreview): number {
    const children = this.projector.graph.getNode(preview.pageId)?.childIds ?? []
    const replaced = preview.replaceId ? children.indexOf(preview.replaceId) : -1
    if (replaced >= 0) return replaced
    return Math.min(preview.insertIndex ?? children.length, children.length)
  }

  private createGhost(preview: DomScenePreview): Ghost {
    const container = this.projector.world.ownerDocument.createElement('div')
    container.dataset.kalkaGhosts = ''
    container.style.cssText = `position:absolute;left:0;top:0;pointer-events:none;opacity:${GHOST_OPACITY}`
    // After the artboards, so the projector, which inserts its frames before the ones that
    // follow, never moves it; its stacking order places it between them.
    this.projector.world.append(container)
    return { preview, container, frames: [] }
  }

  private createFrame(ghost: Ghost, index: number): GhostFrame {
    const key = ghost.preview.key
    const frame = createArtboardFrame(ghost.container.ownerDocument, key)
    delete frame.dataset.kalkaArtboard
    frame.dataset.kalkaGhost = `${key}:${index}`
    const slot: GhostFrame = { frame, doc: null, nodeId: null, graph: null }
    frame.addEventListener(
      'load',
      () => {
        slot.doc = frame.contentDocument
        if (!slot.doc) return
        for (const face of this.options.fonts?.() ?? []) addArtboardFont(slot.doc, face)
        this.drawSlot(slot)
        this.hideReplaced()
      },
      { once: true }
    )
    ghost.container.append(frame)
    return slot
  }

  private drawSlot(slot: GhostFrame): void {
    const { graph, nodeId, doc } = slot
    const node = nodeId ? graph?.getNode(nodeId) : undefined
    if (!graph || !node) return
    placeArtboardFrame(slot.frame, doc, graph, node)
    if (!doc) return
    const projected = sceneNodeToDesignDocument(graph, node.id, {
      includeSourceIds: false,
      vectorElement: this.options.vectorElement,
      derivedSizes: true,
      fontFallbacks: this.options.fontFallbacks?.()
    }).children.at(0)
    if (!projected) {
      doc.body.replaceChildren()
      return
    }
    doc.body.replaceChildren(buildNode(doc, projected))
  }

  /**
   * Hides the artboards previews stand in for once the previews can be seen, so the swap never
   * shows an empty spot. Runs every frame: the projector may rebuild an artboard's frame.
   */
  private hideReplaced(): void {
    const wanted = new Set<HTMLIFrameElement>()
    for (const { preview, frames } of this.ghosts.values()) {
      if (!preview.replaceId || !frames.every((slot) => slot.doc)) continue
      const frame = this.projector.artboardOf(preview.replaceId)?.frame
      if (frame) wanted.add(frame)
    }
    for (const frame of this.hidden) {
      if (wanted.has(frame)) continue
      frame.style.visibility = ''
      this.hidden.delete(frame)
    }
    for (const frame of wanted) {
      if (frame.style.visibility !== 'hidden') frame.style.visibility = 'hidden'
      this.hidden.add(frame)
    }
  }
}
