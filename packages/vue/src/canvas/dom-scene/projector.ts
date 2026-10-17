import {
  sceneNodeToDesignDocument,
  type DesignTokens,
  type DesignElement,
  type DesignNode,
  type VectorElementRenderer
} from '@kalka/dom-css/export'
import type { SceneGraph, SceneNode } from '@kalka/scene-graph'
import { blendModeToCSS } from '@kalka/scene-graph/css-model'

import { LAYER_ID_ATTR, buildNode, elementAttributes, patchAttributes } from './build'
import {
  addArtboardFont,
  createArtboardFrame,
  placeArtboardFrame,
  setArtboardTokens,
  type ArtboardFontFace
} from './frame'

/** Changes to a layer that restyle its children too: their CSS depends on how it lays them out. */
const CHILD_STYLE_KEYS = new Set<keyof SceneNode>([
  'type',
  'layoutMode',
  'layoutWrap',
  'primaryAxisSizing',
  'counterAxisSizing',
  'gridTemplateColumns',
  'gridTemplateRows'
])

interface Artboard {
  id: string
  frame: HTMLIFrameElement
  /** Null until the iframe's document has loaded. */
  doc: Document | null
  /** Whether the DOM changed since its geometry was last read. */
  stale: boolean
  observer: ResizeObserver | null
}

/** A layer's geometry as the browser laid it out, relative to its parent's padding box. */
export interface MeasuredGeometry {
  x?: number
  y?: number
  width: number
  height: number
}

export interface DomSceneProjectorOptions {
  getGraph: () => SceneGraph
  /** The layer whose children are drawn, the current page. */
  getPageId: () => string
  /** Draws vector layers as inline SVG; without it they draw as boxes. */
  vectorElement?: VectorElementRenderer
  /** Called after the DOM changed, once the browser can lay it out. */
  onPatched?: (artboardIds: ReadonlySet<string>) => void
  /** Fonts loaded so far; each new artboard adds them to its own font set. */
  fonts?: () => readonly ArtboardFontFace[]
  /**
   * Called when an artboard's layout changed without the projector touching it: fonts that
   * finished loading, images that decoded, text that reflowed.
   */
  onReflow?: (artboardId: string) => void
  /**
   * Fields a layer is drawn with instead of its own while an edit previews them, such as the
   * vertices of a path being edited. The graph is not changed.
   */
  livePatch?: (id: string) => Partial<SceneNode> | null
  /** The variable references layers are projected with, as `var(--name)`. */
  tokens?: () => DesignTokens
}

/**
 * Projects the scene graph into real DOM: one iframe per top-level layer of the page, one
 * element per layer inside it. Graph events mark layers dirty; {@link flush} patches only those
 * elements, so an edit costs what it touches, not what the page holds.
 *
 * The browser lays out and draws; this class never computes a position itself.
 */
export class DomSceneProjector {
  readonly world: HTMLElement
  private readonly artboards = new Map<string, Artboard>()
  private readonly elements = new Map<string, Element>()
  private readonly dirty = new Set<string>()
  /** What each text element was last built from, so unchanged text is left alone. */
  private readonly textContent = new WeakMap<Element, string>()
  /** Layers edited in place, such as text under the in-page editor: not patched meanwhile. */
  private readonly locked = new Set<string>()
  /** Layers holding a mask: the CSS of their other children depends on where it sits. */
  private readonly maskParents = new Set<string>()
  private pageDirty = true
  private pageId: string | null = null
  private destroyed = false

  constructor(
    host: HTMLElement,
    private readonly options: DomSceneProjectorOptions
  ) {
    this.world = host.ownerDocument.createElement('div')
    this.world.dataset.kalkaWorld = ''
    this.world.style.cssText = 'position:absolute;left:0;top:0;transform-origin:0 0'
    host.append(this.world)
  }

  get graph(): SceneGraph {
    return this.options.getGraph()
  }

  get needsFlush(): boolean {
    // A switch to an empty page changes nothing else, yet must clear the previous page's artboards.
    return this.pageDirty || this.dirty.size > 0 || this.currentPageId() !== this.pageId
  }

  /** The element drawing a layer, if it is on the current page. */
  elementOf(id: string): Element | undefined {
    return this.elements.get(id)
  }

  artboardOf(id: string): { frame: HTMLIFrameElement; doc: Document | null } | undefined {
    return this.artboards.get(id)
  }

  get artboardIds(): IterableIterator<string> {
    return this.artboards.keys()
  }

  // ------------------------------------------------------------------ invalidation

  /**
   * Hands a layer's element to another owner, such as the text editor: the projector leaves
   * it untouched until `unlock`, which rebuilds it from the graph.
   */
  lock(id: string): Element | undefined {
    this.locked.add(id)
    return this.elements.get(id)
  }

  unlock(id: string): void {
    if (!this.locked.delete(id)) return
    const element = this.elements.get(id)
    const node = this.graph.getNode(id)
    if (element) this.removeElement(element)
    if (!node) return
    const artboardId = this.topLevelOf(node)
    // Its parent puts the rebuilt element back; an artboard rebuilds itself.
    this.dirty.add(artboardId === id || !node.parentId ? id : node.parentId)
  }

  #tokensCSS = ''

  /** The variables stylesheet every artboard carries, now and when it opens. */
  setTokensCSS(css: string): void {
    this.#tokensCSS = css
    for (const artboard of this.artboards.values()) {
      if (artboard.doc) setArtboardTokens(artboard.doc, css)
    }
    // Values moved, so layouts can too.
    for (const id of this.artboards.keys()) this.options.onReflow?.(id)
  }

  /** A font loaded after the artboards opened: every artboard gets it. */
  addFont(face: ArtboardFontFace): void {
    for (const artboard of this.artboards.values()) {
      if (artboard.doc) addArtboardFont(artboard.doc, face)
    }
  }

  invalidateAll(): void {
    this.pageDirty = true
    for (const id of this.artboards.keys()) this.dirty.add(id)
  }

  /** The page changed or the graph was replaced: every artboard is rebuilt. */
  reset(): void {
    for (const artboard of this.artboards.values()) {
      artboard.observer?.disconnect()
      artboard.frame.remove()
    }
    this.artboards.clear()
    this.elements.clear()
    this.maskParents.clear()
    this.dirty.clear()
    this.pageDirty = true
  }

  nodeUpdated(id: string, changes: Partial<SceneNode>): void {
    this.dirty.add(id)
    const node = this.graph.getNode(id)
    if (!node) return
    const keys = Object.keys(changes) as (keyof SceneNode)[]
    if (keys.some((key) => CHILD_STYLE_KEYS.has(key))) {
      for (const childId of node.childIds) this.dirty.add(childId)
    }
    // A mask is drawn as the `mask-image` of the layers above it.
    if (node.parentId && (node.isMask || 'isMask' in changes)) {
      this.maskParents.add(node.parentId)
      this.restyleChildren(node.parentId)
    }
    if (node.parentId) {
      if ('visible' in changes || 'internalOnly' in changes) this.dirty.add(node.parentId)
      if (node.parentId === this.currentPageId()) this.pageDirty = true
    }
  }

  structureChanged(...parentIds: (string | null | undefined)[]): void {
    const pageId = this.currentPageId()
    for (const id of parentIds) {
      if (!id) continue
      if (id === pageId) this.pageDirty = true
      else this.dirty.add(id)
      // Masks added, removed, or reordered change which layers they mask.
      if (this.maskParents.has(id)) this.restyleChildren(id)
    }
  }

  private restyleChildren(parentId: string): void {
    const parent = this.graph.getNode(parentId)
    if (!parent) return
    for (const childId of parent.childIds) this.dirty.add(childId)
    if (!parent.childIds.some((id) => this.graph.getNode(id)?.isMask))
      this.maskParents.delete(parentId)
  }

  /** Records a layer's element as built, and its parent when the layer is a mask. */
  private register(id: string, element: Element): void {
    this.elements.set(id, element)
    const node = this.graph.getNode(id)
    if (node?.isMask && node.parentId) this.maskParents.add(node.parentId)
  }

  // ------------------------------------------------------------------ flush

  /** Applies every pending change to the DOM. */
  flush(): void {
    if (this.destroyed) return
    const pageId = this.currentPageId()
    if (pageId !== this.pageId) {
      this.reset()
      this.pageId = pageId
    }
    const touched = new Set<string>()
    if (this.pageDirty) {
      this.pageDirty = false
      this.reconcileArtboards(touched)
    }
    if (this.dirty.size === 0) {
      if (touched.size > 0) this.options.onPatched?.(touched)
      return
    }
    const ids = [...this.dirty]
    this.dirty.clear()
    for (const id of ids) {
      const artboardId = this.patchLayer(id)
      if (artboardId) touched.add(artboardId)
    }
    for (const id of touched) {
      const artboard = this.artboards.get(id)
      const node = this.graph.getNode(id)
      if (!artboard) continue
      artboard.stale = true
      // What a layer draws past its box can change with any layer inside it.
      if (node) this.placeArtboard(node, artboard)
    }
    if (touched.size > 0) this.options.onPatched?.(touched)
  }

  // ------------------------------------------------------------------ measurement

  /**
   * The artboards that draw `nodeId` and everything inside it, or null when some of them cannot
   * be read yet (not on this page, or still loading), so another engine lays it out instead.
   */
  artboardsFor(nodeId: string): string[] | null {
    const graph = this.graph
    const pageId = this.currentPageId()
    if (nodeId === pageId) {
      const page = graph.getNode(pageId)
      if (!page || this.pageId !== pageId) return null
      const ids = this.visibleChildren(page).map((node) => node.id)
      return ids.every((id) => this.artboards.get(id)?.doc) ? ids : null
    }
    const node = graph.getNode(nodeId)
    const artboardId = node ? this.topLevelOf(node) : null
    if (!artboardId || this.pageId !== pageId) return null
    return this.artboards.get(artboardId)?.doc ? [artboardId] : null
  }

  isStale(artboardId: string): boolean {
    return this.artboards.get(artboardId)?.stale ?? false
  }

  /**
   * Reads every layer's box in an artboard, as the browser laid it out. One forced layout at
   * most. Rotated layers, and layers inside them, keep the geometry they have: a bounding box
   * is not their position. The artboard's own position is the canvas's, never read here.
   */
  measureArtboard(artboardId: string): Map<string, MeasuredGeometry> {
    const measured = new Map<string, MeasuredGeometry>()
    const artboard = this.artboards.get(artboardId)
    const root = this.elements.get(artboardId)
    if (!artboard?.doc || !root) return measured
    artboard.stale = false
    const rects = new Map<Element, DOMRect>()
    const rectOf = (element: Element) => {
      let rect = rects.get(element)
      if (!rect) {
        rect = element.getBoundingClientRect()
        rects.set(element, rect)
      }
      return rect
    }
    const rotated = (element: Element) => element.closest('[style*="rotate("]') !== null
    if (!rotated(root)) measured.set(artboardId, this.measuredSize(artboardId, root, rectOf(root)))
    for (const element of root.querySelectorAll(`[${LAYER_ID_ATTR}]`)) {
      const id = element.getAttribute(LAYER_ID_ATTR)
      const parent = element.parentElement?.closest(`[${LAYER_ID_ATTR}]`)
      if (!id || !parent || rotated(element)) continue
      const rect = rectOf(element)
      const box = rectOf(parent)
      measured.set(id, {
        x: rect.left - box.left - parent.clientLeft,
        y: rect.top - box.top - parent.clientTop,
        ...this.measuredSize(id, element, rect)
      })
    }
    return measured
  }

  /**
   * A layer's laid-out size. An SVG of no width or height draws nothing, so a vector drawing is
   * at least a pixel on each side; a layer thinner than that, such as a line, keeps its own size.
   */
  private measuredSize(id: string, element: Element, rect: DOMRect) {
    const node = element.localName === 'svg' ? this.graph.getNode(id) : undefined
    return {
      width: node && node.width < 1 ? node.width : rect.width,
      height: node && node.height < 1 ? node.height : rect.height
    }
  }

  destroy(): void {
    this.destroyed = true
    this.reset()
    this.world.remove()
  }

  // ------------------------------------------------------------------ artboards

  private currentPageId(): string {
    return this.options.getPageId()
  }

  private visibleChildren(node: SceneNode): SceneNode[] {
    const graph = this.graph
    return node.childIds
      .map((id) => graph.getNode(id))
      .filter((child): child is SceneNode => !!child && child.visible && !child.internalOnly)
  }

  private reconcileArtboards(touched: Set<string>): void {
    const page = this.graph.getNode(this.currentPageId())
    const wanted = page ? this.visibleChildren(page) : []
    const wantedIds = new Set(wanted.map((node) => node.id))

    for (const [id, artboard] of this.artboards) {
      if (wantedIds.has(id)) continue
      this.unregisterSubtree(artboard.doc?.body)
      artboard.observer?.disconnect()
      artboard.frame.remove()
      this.artboards.delete(id)
    }

    // Later layers draw above earlier ones, as on the canvas.
    let previous: HTMLIFrameElement | null = null
    for (const node of wanted) {
      let artboard = this.artboards.get(node.id)
      if (!artboard) {
        artboard = this.createArtboard(node.id)
        touched.add(node.id)
      }
      const expected: ChildNode | null = previous ? previous.nextSibling : this.world.firstChild
      if (expected !== artboard.frame) this.world.insertBefore(artboard.frame, expected)
      this.placeArtboard(node, artboard)
      previous = artboard.frame
    }
  }

  private createArtboard(id: string): Artboard {
    const frame = createArtboardFrame(this.world.ownerDocument, id)
    const artboard: Artboard = { id, frame, doc: null, stale: true, observer: null }
    frame.addEventListener(
      'load',
      () => {
        if (this.destroyed || this.artboards.get(id) !== artboard) return
        const doc = frame.contentDocument
        artboard.doc = doc
        if (doc) {
          for (const face of this.options.fonts?.() ?? []) addArtboardFont(doc, face)
          setArtboardTokens(doc, this.#tokensCSS)
          const reflowed = () => {
            artboard.stale = true
            this.options.onReflow?.(id)
          }
          doc.fonts.addEventListener('loadingdone', reflowed)
          artboard.observer = new ResizeObserver(reflowed)
          artboard.observer.observe(doc.body)
        }
        this.dirty.add(id)
        this.flush()
      },
      { once: true }
    )
    this.artboards.set(id, artboard)
    return artboard
  }

  /**
   * Sizes and places an artboard's iframe from the layer's geometry. The iframe carries the
   * layer's blend mode: inside its own document the layer has nothing below it to blend with.
   */
  private placeArtboard(node: SceneNode, artboard: Artboard): void {
    placeArtboardFrame(artboard.frame, artboard.doc, this.graph, node)
    const style = artboard.frame.style
    const blend = blendModeToCSS(node.blendMode) ?? ''
    if (style.mixBlendMode !== blend) style.mixBlendMode = blend
  }

  // ------------------------------------------------------------------ layers

  private topLevelOf(node: SceneNode): string | null {
    const pageId = this.currentPageId()
    let current: SceneNode | undefined = node
    while (current) {
      if (current.parentId === pageId) return current.id
      current = current.parentId ? this.graph.getNode(current.parentId) : undefined
    }
    return null
  }

  private project(id: string, shallow: boolean): DesignNode | null {
    const patch = this.options.livePatch?.(id)
    const node = patch ? this.graph.getNode(id) : undefined
    if (!patch || !node) return this.projectStored(id, shallow)
    // Drawn with the previewed fields for this projection only, as the Skia overlay did.
    const stored = Object.fromEntries(
      Object.keys(patch).map((key) => [key, node[key as keyof SceneNode]])
    )
    Object.assign(node, patch)
    try {
      return this.projectStored(id, shallow)
    } finally {
      Object.assign(node, stored)
    }
  }

  private projectStored(id: string, shallow: boolean): DesignNode | null {
    const doc = sceneNodeToDesignDocument(this.graph, id, {
      includeSourceIds: false,
      // Variable-bound values are `var(--name)`, defined by each artboard's tokens stylesheet.
      tokens: this.options.tokens?.() ?? false,
      vectorElement: this.options.vectorElement,
      shallow,
      derivedSizes: true
    })
    return doc.children[0] ?? null
  }

  /** Re-renders one layer's element and reconciles its children. Returns its artboard. */
  private patchLayer(id: string): string | null {
    const graph = this.graph
    const node = graph.getNode(id)
    if (!node) return null
    if (this.locked.has(id)) return this.topLevelOf(node)
    const artboardId = this.topLevelOf(node)
    if (!artboardId) return null
    const artboard = this.artboards.get(artboardId)
    if (!artboard?.doc) return null

    const current = this.elements.get(id)
    const isRoot = id === artboardId
    if (!current && !isRoot) {
      // A layer not drawn yet: its parent creates it when it reconciles.
      if (node.parentId) this.dirty.add(node.parentId)
      return artboardId
    }

    const projected = this.project(id, true)
    if (projected?.type !== 'element') {
      if (current) this.removeElement(current)
      return artboardId
    }

    if (!current || !this.canPatch(current, projected)) {
      this.replaceSubtree(artboard.doc, id, current, isRoot)
      return artboardId
    }

    patchAttributes(current, this.attributesFor(node, projected, isRoot))
    if (node.type === 'TEXT') {
      // Characters and their style runs: rebuilt only when they changed.
      const content = JSON.stringify(projected.children)
      if (this.textContent.get(current) !== content) {
        const doc = artboard.doc
        current.replaceChildren(...projected.children.map((child) => buildNode(doc, child)))
        this.textContent.set(current, content)
      }
    } else {
      this.reconcileChildren(artboard.doc, node, current)
    }
    return artboardId
  }

  /**
   * An element's attributes. An artboard that hugs its content in width is `max-content`: as a
   * block in its iframe it would otherwise take the iframe's width, the size it had before.
   */
  private attributesFor(node: SceneNode, projected: DesignElement, isRoot: boolean) {
    const attrs = elementAttributes(projected)
    const hugsWidth =
      node.type === 'TEXT' ? node.textAutoResize === 'WIDTH_AND_HEIGHT' : node.layoutMode !== 'NONE'
    if (isRoot && !projected.inlineStyle?.width && hugsWidth) {
      attrs.set('style', `${attrs.get('style') ?? ''}width:max-content;`)
    }
    return attrs
  }

  /** Whether an element can be patched in place instead of rebuilt. */
  private canPatch(element: Element, projected: DesignElement): boolean {
    if (element.localName !== projected.tagName) return false
    // Vector layers are whole drawings from the SVG export; they are redrawn, not patched.
    return projected.tagName !== 'svg'
  }

  private replaceSubtree(doc: Document, id: string, current: Element | undefined, isRoot: boolean) {
    const projected = this.project(id, false)
    if (current) this.unregisterSubtree(current)
    if (!projected) {
      current?.remove()
      return
    }
    const built = buildNode(doc, projected, (layerId, element) => this.register(layerId, element))
    const node = this.graph.getNode(id)
    if (isRoot && node && built instanceof Element && projected.type === 'element') {
      patchAttributes(built, this.attributesFor(node, projected, true))
    }
    if (current) current.replaceWith(built)
    else if (isRoot) doc.body.replaceChildren(built)
  }

  private reconcileChildren(doc: Document, node: SceneNode, element: Element): void {
    const wanted = this.visibleChildren(node)
    const wantedIds = new Set(wanted.map((child) => child.id))

    for (const child of element.querySelectorAll(`:scope > [${LAYER_ID_ATTR}]`)) {
      const childId = child.getAttribute(LAYER_ID_ATTR)
      if (childId && !wantedIds.has(childId)) this.removeElement(child)
    }

    let cursor: Element | null = null
    for (const child of wanted) {
      let childElement = this.elements.get(child.id)
      // A layer moved in from another artboard is rebuilt in this one's document.
      if (childElement && childElement.ownerDocument !== doc) {
        this.removeElement(childElement)
        childElement = undefined
      }
      if (!childElement) {
        const projected = this.project(child.id, false)
        if (!projected) continue
        childElement = buildNode(doc, projected, (layerId, built) =>
          this.register(layerId, built)
        ) as Element
      }
      const expected: Element | null = cursor
        ? cursor.nextElementSibling
        : element.firstElementChild
      if (expected !== childElement) {
        if (expected) expected.before(childElement)
        else element.append(childElement)
      }
      cursor = childElement
    }
  }

  private removeElement(element: Element): void {
    this.unregisterSubtree(element)
    element.remove()
  }

  private unregisterSubtree(root: Element | null | undefined): void {
    if (!root) return
    const own = root.getAttribute(LAYER_ID_ATTR)
    if (own && this.elements.get(own) === root) this.elements.delete(own)
    for (const element of root.querySelectorAll(`[${LAYER_ID_ATTR}]`)) {
      const id = element.getAttribute(LAYER_ID_ATTR)
      if (id && this.elements.get(id) === element) this.elements.delete(id)
    }
  }
}
