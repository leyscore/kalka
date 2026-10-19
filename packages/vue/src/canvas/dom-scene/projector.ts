import {
  LAYER_ID_ATTR,
  artboardAttributes,
  elementAttributes,
  measureLayerBoxes,
  sceneNodeToDesignDocument,
  type DesignTokens,
  type DesignElement,
  type DesignNode,
  type MeasuredGeometry,
  type VectorElementRenderer
} from '@kalka/dom-css/export'
import type { SceneGraph, SceneNode } from '@kalka/scene-graph'
import { blendModeToCSS } from '@kalka/scene-graph/css-model'

import { buildNode, patchAttributes } from './build'
import {
  addArtboardFont,
  placeArtboardFrame,
  setArtboardTokens,
  type ArtboardFontFace
} from './frame'
import { maskedParentsAround } from './masks'
import { measureScopes } from './measure-scope'
import { PatternUsers } from './patterns'
import { ArtboardSlot } from './slot'
import { ArtboardSlots, type ArtboardSlotsHost, type ProjectorView } from './slots'
import { isLive, type ArtboardTier } from './tiers'

export type { ProjectorView } from './slots'

/** Changes to a layer that restyle its children too: their CSS depends on how it lays them out. */
const CHILD_STYLE_KEYS = new Set<keyof SceneNode>([
  'type',
  'layoutMode',
  'layoutWrap',
  'primaryAxisSizing',
  'counterAxisSizing',
  'gridTemplateColumns',
  'gridTemplateRows',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft'
])

/** Changes to a layer that restyle its parent: whether it fills decides what the parent hugs. */
const PARENT_STYLE_KEYS = new Set<keyof SceneNode>([
  'visible',
  'internalOnly',
  'layoutGrow',
  'layoutAlignSelf',
  'layoutPositioning'
])

/** The stacking order of the artboard of the `index`th shown page child; odd orders lie between. */
function artboardStackOrder(index: number): number {
  return 2 * index + 2
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
   * Fields layers are drawn with instead of their own while an edit previews them, such as the
   * vertices of a path being edited or the angle of a turn, by layer id. They apply wherever the
   * layer is drawn, also when its parent rebuilds it. The graph is not changed.
   */
  livePatches?: () => ReadonlyMap<string, Partial<SceneNode>>
  /** The variable references layers are projected with, as `var(--name)`. */
  tokens?: () => DesignTokens
  /**
   * Families text falls back to for characters its font lacks, listed after its font. Every
   * artboard is projected again when the list changes, as when a fallback font arrives.
   */
  fontFallbacks?: () => readonly string[]
  /**
   * Called when an artboard's tier has work to do outside a view change: a feature asked for it
   * live, or its iframe took over from its stand-in.
   */
  onTiersChanged?: () => void
  /**
   * The layers the user works on, such as the selection or a path being edited: their artboards
   * stay live where they would be pictured, so a gesture on them draws as it goes.
   */
  activeLayers?: () => Iterable<string>
}

/**
 * Projects the scene graph into real DOM: one iframe per top-level layer of the page, one
 * element per layer inside it. Graph events mark layers dirty; {@link flush} patches only those
 * elements, so an edit costs what it touches, not what the page holds.
 *
 * Each artboard is held at a tier from how far it lies from the screen ({@link ArtboardTier}):
 * only those on screen or about to be have a live iframe, the others a snapshot or a placeholder.
 * The projector alone moves artboards between tiers. Nothing may assume an artboard has a live
 * document: {@link retain}, {@link whenLive} and {@link withLiveArtboard} wake one for a feature
 * that reads or edits its DOM, and layout goes to the offscreen engine for those without one.
 *
 * The browser lays out and draws; this class never computes a position itself.
 */
export class DomSceneProjector {
  readonly world: HTMLElement
  private readonly artboards: ArtboardSlots
  private readonly elements = new Map<string, Element>()
  private readonly dirty = new Set<string>()
  /** What each text element was last built from, so unchanged text is left alone. */
  private readonly textContent = new WeakMap<Element, string>()
  /** Layers edited in place, such as text under the in-page editor, with their artboards. */
  private readonly locked = new Map<string, string | null>()
  /** Layers holding a mask: the CSS of their other children depends on where it sits. */
  private readonly maskParents = new Set<string>()
  private readonly patternUsers = new PatternUsers()
  private pageDirty = true
  private pageId: string | null = null
  private destroyed = false

  constructor(
    host: HTMLElement,
    private readonly options: DomSceneProjectorOptions
  ) {
    this.world = host.ownerDocument.createElement('div')
    this.world.dataset.kalkaWorld = ''
    // The world becomes a compositor layer of its own while the view moves (`TierWork.follow`).
    this.world.style.cssText = 'position:absolute;left:0;top:0;transform-origin:0 0'
    host.append(this.world)
    this.artboards = new ArtboardSlots(this.slotsHost())
  }

  get graph(): SceneGraph {
    return this.options.getGraph()
  }

  get needsFlush(): boolean {
    // A switch to an empty page changes nothing else, yet must clear the previous page's artboards.
    return this.pageDirty || this.dirty.size > 0 || this.projectionChanged()
  }

  /** The fallback families as text was last projected with them. */
  private projectedFallbacks = ''

  private fallbacksKey = () => (this.options.fontFallbacks?.() ?? []).join('\0')

  private projectionChanged(): boolean {
    return this.currentPageId() !== this.pageId || this.fallbacksKey() !== this.projectedFallbacks
  }

  /** The element drawing a layer, if it is on the current page and its artboard is live. */
  elementOf(id: string): Element | undefined {
    return this.elements.get(id)
  }

  /** The page's artboards, by the id of their layer. */
  get artboardIds(): IterableIterator<string> {
    return this.artboards.keys()
  }

  /** The tier an artboard is held at, or undefined when it is not on the page drawn. */
  tierOf(artboardId: string): ArtboardTier | undefined {
    return this.artboards.get(artboardId)?.tier
  }

  /** The artboard drawing a layer of the page shown: its top-level ancestor, or itself. */
  artboardIdOf(nodeId: string): string | null {
    const node = this.graph.getNode(nodeId)
    return node ? this.topLevelOf(node) : null
  }

  // ------------------------------------------------------------------ tiers

  /**
   * The view each artboard's tier is reckoned from. Until a view is given, every artboard is
   * held live, as a canvas that is not on screen yet lays out the page it will show.
   */
  setView(view: ProjectorView): void {
    this.artboards.setView(view)
  }

  /**
   * Keeps an artboard live, woken now if it sleeps, until the returned release: for features
   * that read or edit its DOM, such as the text editor.
   */
  retain(artboardId: string): () => void {
    return this.artboards.retain(artboardId)
  }

  /**
   * Resolves once an artboard has a live document that shows the graph, waking it if it sleeps;
   * false when it left the page first. Hold it with {@link retain} to keep it live after.
   */
  whenLive(artboardId: string): Promise<boolean> {
    return this.artboards.whenLive(artboardId)
  }

  /** Runs `read` on a layer's artboard document once it is live; null when it is not drawn. */
  async withLiveArtboard<T>(nodeId: string, read: (doc: Document) => T): Promise<T | null> {
    const artboardId = this.artboardIdOf(nodeId)
    if (!artboardId) return null
    const release = this.retain(artboardId)
    try {
      if (!(await this.whenLive(artboardId))) return null
      if (this.needsFlush) this.flush()
      const doc = this.artboards.get(artboardId)?.doc
      return doc ? read(doc) : null
    } finally {
      release()
    }
  }

  /** Hides the artboards of the page children previews stand in for, and shows the others. */
  setReplaced(ids: ReadonlySet<string>): void {
    this.artboards.setReplaced(ids)
  }

  /**
   * Moves artboards to the tiers the view asks for. Painting stops and starts at once; waking
   * and sleeping wait for the view to rest, a few artboards a frame. True while some are left.
   */
  applyTiers(): boolean {
    return this.artboards.apply()
  }

  /** Whether a snapshot is due: an artboard that sleeps in the far tier shows an old one or none. */
  get needsCapture(): boolean {
    return this.artboards.needsCapture
  }

  /**
   * Takes the snapshot due next, the nearest first, off the gesture path: one at a time, as the
   * canvas's idle work. Resolves with whether one was shown.
   */
  captureNext(): Promise<boolean> {
    return this.artboards.captureNext()
  }

  /**
   * An artboard placed on the page but never laid out, which sleeps: its layers keep the geometry
   * the file gave them until the offscreen engine lays it out, as the canvas's idle work.
   */
  nextUnmeasured(): string | null {
    return this.artboards.nextUnmeasured()
  }

  /** Records that the offscreen engine laid a sleeping artboard out. */
  markMeasured(artboardId: string): void {
    const slot = this.artboards.get(artboardId)
    if (slot) slot.measured = true
  }

  private holdsLock(artboardId: string): boolean {
    for (const owner of this.locked.values()) if (owner === artboardId) return true
    return false
  }

  private isActive(artboardId: string): boolean {
    for (const id of this.options.activeLayers?.() ?? []) {
      if (this.artboardIdOf(id) === artboardId) return true
    }
    return false
  }

  private wake(slot: ArtboardSlot): void {
    slot.wake((loaded) => this.loaded(loaded))
  }

  private sleep(slot: ArtboardSlot): void {
    this.unregisterSubtree(slot.doc?.body)
    slot.sleep(this.graph.getNode(slot.id))
    slot.stale = false
    slot.patched = null
  }

  /** What the artboards' tiers ask of the projector. */
  private slotsHost(): ArtboardSlotsHost {
    return {
      graph: () => this.graph,
      destroyed: () => this.destroyed,
      ownerDocument: this.world.ownerDocument,
      wake: (slot) => this.wake(slot),
      sleep: (slot) => this.sleep(slot),
      holdsLock: (id) => this.holdsLock(id),
      isActive: (id) => this.isActive(id),
      reflow: (id) => this.options.onReflow?.(id),
      changed: () => this.options.onTiersChanged?.(),
      snapshotSource: (id) => ({
        graph: this.graph,
        nodeId: id,
        fonts: this.options.fonts?.() ?? [],
        vectorElement: this.options.vectorElement,
        fontFallbacks: this.options.fontFallbacks?.()
      })
    }
  }

  // ------------------------------------------------------------------ invalidation

  /**
   * Hands a layer's element to another owner, such as the text editor: the projector leaves
   * it untouched until `unlock`, which rebuilds it from the graph. Its artboard stays live
   * meanwhile, woken if it slept: the element is there once it has loaded.
   */
  lock(id: string): Element | undefined {
    const artboardId = this.artboardIdOf(id)
    this.locked.set(id, artboardId)
    if (artboardId && !this.artboards.get(artboardId)?.live) this.options.onTiersChanged?.()
    return this.elements.get(id)
  }

  unlock(id: string): void {
    if (!this.locked.has(id)) return
    this.locked.delete(id)
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
    for (const slot of this.artboards.values()) {
      slot.version++
      if (slot.doc) setArtboardTokens(slot.doc, css)
    }
    // Values moved, so layouts can too.
    for (const slot of this.artboards.values()) if (slot.live) this.options.onReflow?.(slot.id)
  }

  /** A font loaded after the artboards opened: every artboard gets it. */
  addFont(face: ArtboardFontFace): void {
    for (const slot of this.artboards.values()) {
      slot.version++
      if (slot.doc) addArtboardFont(slot.doc, face)
    }
  }

  invalidateAll(): void {
    this.pageDirty = true
    for (const id of this.artboards.keys()) this.dirty.add(id)
  }

  /** The page changed or the graph was replaced: every artboard is rebuilt. */
  reset(): void {
    this.artboards.clear()
    this.elements.clear()
    this.maskParents.clear()
    this.patternUsers.clear()
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
    const pageId = this.currentPageId()
    for (const masked of maskedParentsAround(this.graph, node.parentId, pageId))
      this.restyleChildren(masked)
    for (const userId of this.patternUsers.affectedBy(this.graph, node)) this.dirty.add(userId)
    if (node.parentId) {
      if (keys.some((key) => PARENT_STYLE_KEYS.has(key))) this.dirty.add(node.parentId)
      if (node.parentId === pageId) this.pageDirty = true
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
      for (const masked of maskedParentsAround(this.graph, id, pageId)) this.restyleChildren(masked)
    }
  }

  private restyleChildren(parentId: string): void {
    const parent = this.graph.getNode(parentId)
    if (!parent) return
    for (const childId of parent.childIds) this.dirty.add(childId)
    if (!parent.childIds.some((id) => this.graph.getNode(id)?.isMask))
      this.maskParents.delete(parentId)
  }

  /** Records a built element, its parent if it is a mask, and the patterns it repeats. */
  private register(id: string, element: Element): void {
    this.elements.set(id, element)
    const node = this.graph.getNode(id)
    if (node?.isMask && node.parentId) this.maskParents.add(node.parentId)
    if (node) this.patternUsers.record(this.graph, node)
  }

  // ------------------------------------------------------------------ flush

  /** Applies every pending change to the DOM. */
  flush(): void {
    if (this.destroyed) return
    if (this.projectionChanged()) {
      this.reset()
      this.pageId = this.currentPageId()
      this.projectedFallbacks = this.fallbacksKey()
    }
    const touched = new Set<string>()
    if (this.pageDirty) {
      this.pageDirty = false
      this.reconcileArtboards(touched)
    }
    if (this.dirty.size > 0) this.patchDirty(touched)
    if (touched.size > 0) this.options.onPatched?.(touched)
  }

  /** Patches the dirty layers of live artboards; those of sleeping ones only date their stand-ins. */
  private patchDirty(touched: Set<string>): void {
    const ids = [...this.dirty]
    this.dirty.clear()
    /** Artboards without a live document whose layers changed: built whole once it loads. */
    const asleep = new Set<string>()
    for (const id of ids) {
      const node = this.graph.getNode(id)
      const artboardId = node ? this.topLevelOf(node) : null
      const slot = artboardId ? this.artboards.get(artboardId) : undefined
      if (!node || !artboardId || !slot) continue
      if (!slot.doc) asleep.add(artboardId)
      else if (this.patchLayer(id, node, artboardId, slot.doc)) {
        touched.add(artboardId)
        slot.patched?.add(id)
      }
    }
    for (const id of touched) this.placeChanged(id, true)
    for (const id of asleep) this.placeChanged(id, false)
  }

  /** Places an artboard whose layers changed: what it draws past its box can change with them. */
  private placeChanged(id: string, live: boolean): void {
    const slot = this.artboards.get(id)
    const node = this.graph.getNode(id)
    if (!slot || !node) return
    slot.version++
    if (live) slot.stale = true
    this.placeArtboard(node, slot)
    if (!live) slot.updatePlaceholder(node)
  }

  // ------------------------------------------------------------------ measurement

  /**
   * The artboards that draw `nodeId` and everything inside it whose documents can be read now,
   * and those that cannot (asleep, or still loading), which another engine lays out; null when
   * none can be read or the layer is not on the page drawn, so another engine lays it all out.
   */
  layoutPlan(nodeId: string): { live: string[]; elsewhere: string[] } | null {
    const graph = this.graph
    const pageId = this.currentPageId()
    if (this.pageId !== pageId) return null
    let ids: string[]
    if (nodeId === pageId) {
      const page = graph.getNode(pageId)
      if (!page) return null
      ids = this.visibleChildren(page).map((node) => node.id)
    } else {
      const node = graph.getNode(nodeId)
      const artboardId = node ? this.topLevelOf(node) : null
      if (!artboardId) return null
      ids = [artboardId]
    }
    const live = ids.filter((id) => this.readable(id))
    if (live.length === 0) return null
    return { live, elsewhere: ids.filter((id) => !this.readable(id)) }
  }

  /** Whether an artboard's document is loaded and built, so its layout can be read. */
  private readable(artboardId: string): boolean {
    return !!this.artboards.get(artboardId)?.doc && this.elements.has(artboardId)
  }

  /**
   * The stacking order of something drawn at page child `index` of the current page: above the
   * artboards of the layers before it and below the rest.
   */
  stackOrderAt(index: number): number {
    const page = this.graph.getNode(this.currentPageId())
    const before = page
      ? this.visibleChildren({ ...page, childIds: page.childIds.slice(0, index) })
      : []
    return artboardStackOrder(before.length) - 1
  }

  /** Whether a live artboard's DOM changed since its geometry was last read. */
  isStale(artboardId: string): boolean {
    const slot = this.artboards.get(artboardId)
    return !!slot?.doc && slot.stale
  }

  /**
   * Whether the artboard's next reading lays out what the document already holds, as after it
   * loaded or a font arrived, rather than the result of an edit.
   */
  readsDerivedLayout(artboardId: string): boolean {
    return this.artboards.get(artboardId)?.derived ?? false
  }

  /** Whether the canvas is on screen, so a page it is given lays out as it loads. */
  get shown(): boolean {
    return this.world.isConnected && this.world.getClientRects().length > 0
  }

  /**
   * Whether every artboard the view holds live shows the graph: loaded with its fonts, built,
   * and its layout read. Artboards that sleep draw their stand-ins and wait for nothing.
   */
  get settled(): boolean {
    for (const slot of this.artboards.values()) {
      if (!isLive(slot.target)) continue
      const doc = slot.doc
      if (!slot.ready || doc?.readyState !== 'complete' || doc.fonts.status === 'loading')
        return false
      if (slot.stale) return false
    }
    return true
  }

  /**
   * Reads every layer's box in an artboard, as the browser laid it out. One forced layout at
   * most. Rotated or flipped layers, and layers inside them, keep the geometry they have: a box
   * is not their position. The artboard's own position is the canvas's, never read here.
   */
  measureArtboard(artboardId: string): Map<string, MeasuredGeometry> {
    const slot = this.artboards.get(artboardId)
    const root = this.elements.get(artboardId)
    if (!slot?.doc || !root) return new Map()
    const scopes = slot.patched
      ? measureScopes(root, slot.patched, (id) => this.drawnElementFor(id), LAYER_ID_ATTR)
      : null
    slot.stale = false
    slot.patched = new Set()
    slot.derived = false
    slot.measured = true
    return measureLayerBoxes(
      root,
      artboardId,
      LAYER_ID_ATTR,
      (id, element, rect) => this.measuredSize(id, element, rect),
      scopes ?? undefined
    )
  }

  /** A layer's element, or that of its closest drawn parent when it has none now. */
  private drawnElementFor(id: string): Element | null {
    for (let node = this.graph.getNode(id); node;) {
      const element = this.elements.get(node.id)
      if (element?.isConnected) return element
      node = node.parentId ? this.graph.getNode(node.parentId) : undefined
    }
    return null
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

    for (const [id, slot] of this.artboards.entries()) {
      if (wantedIds.has(id)) continue
      this.unregisterSubtree(slot.doc?.body)
      slot.destroy()
      this.artboards.delete(id)
    }

    // Later layers draw above earlier ones, as on the canvas. The stacking order says so too,
    // so a preview can draw between two artboards without moving their frames.
    let previous: Element | null = null
    for (const [index, node] of wanted.entries()) {
      let slot = this.artboards.get(node.id)
      if (!slot) {
        slot = this.createArtboard(node)
        touched.add(node.id)
      } else {
        this.placeArtboard(node, slot)
      }
      for (const element of slot.elements) {
        const expected: ChildNode | null = previous ? previous.nextSibling : this.world.firstChild
        if (expected !== element) this.world.insertBefore(element, expected)
        previous = element
      }
      slot.setOrder(String(artboardStackOrder(index)))
    }
  }

  /**
   * A new artboard on the page: live at once when the view holds it near, as when a page opens,
   * otherwise a placeholder until it comes near.
   */
  private createArtboard(node: SceneNode): ArtboardSlot {
    const slot = new ArtboardSlot(node.id, this.world, 'dormant')
    slot.replaced = this.artboards.replaced.has(node.id)
    this.artboards.set(slot)
    this.placeArtboard(node, slot)
    const tier = this.artboards.targetTier(slot)
    slot.tier = tier
    slot.target = tier
    if (isLive(tier)) this.wake(slot)
    else slot.showPlaceholder(node)
    return slot
  }

  /** An artboard's iframe loaded its document: it gets its fonts and tokens and is built. */
  private loaded(slot: ArtboardSlot): void {
    if (this.destroyed || this.artboards.get(slot.id) !== slot) return
    const doc = slot.doc
    if (doc) {
      for (const face of this.options.fonts?.() ?? []) addArtboardFont(doc, face)
      setArtboardTokens(doc, this.#tokensCSS)
      const reflowed = () => {
        if (slot.doc !== doc) return
        slot.stale = true
        slot.patched = null
        slot.version++
        this.options.onReflow?.(slot.id)
      }
      doc.fonts.addEventListener('loadingdone', () => {
        if (slot.doc !== doc) return
        slot.derived = true
        reflowed()
      })
      slot.observer = new ResizeObserver(reflowed)
      slot.observer.observe(doc.body)
      const node = this.graph.getNode(slot.id)
      if (node) placeArtboardFrame(slot.frame, doc, this.graph, node)
    }
    this.dirty.add(slot.id)
    this.flush()
    // It takes over from its stand-in once its text has the fonts it is laid out with.
    const ready = () => {
      if (this.destroyed || this.artboards.get(slot.id) !== slot || slot.doc !== doc) return
      slot.markReady()
      this.options.onTiersChanged?.()
    }
    if (doc) void doc.fonts.ready.then(ready, ready)
    else ready()
  }

  /**
   * Sizes and places an artboard's iframe, or what stands in for it, from the layer's geometry.
   * It carries the layer's blend mode: inside its own document the layer has nothing below it
   * to blend with.
   */
  private placeArtboard(node: SceneNode, slot: ArtboardSlot): void {
    // A turn being previewed changes how far the layer draws past its box.
    const box = this.withLivePatches(() =>
      placeArtboardFrame(slot.frame, slot.doc, this.graph, node)
    )
    slot.place(box, blendModeToCSS(node.blendMode) ?? '')
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
    return this.withLivePatches(() => this.projectStored(id, shallow))
  }

  /** Runs `read` with the layers' previewed fields in place, then puts their own back. */
  private withLivePatches<T>(read: () => T): T {
    const restore: [SceneNode, Partial<SceneNode>][] = []
    for (const [id, patch] of this.options.livePatches?.() ?? []) {
      const node = this.graph.getNode(id)
      if (!node) continue
      restore.push([
        node,
        Object.fromEntries(Object.keys(patch).map((key) => [key, node[key as keyof SceneNode]]))
      ])
      Object.assign(node, patch)
    }
    try {
      return read()
    } finally {
      for (const [node, stored] of restore.reverse()) Object.assign(node, stored)
    }
  }

  private projectStored(id: string, shallow: boolean): DesignNode | null {
    const doc = sceneNodeToDesignDocument(this.graph, id, {
      includeSourceIds: false,
      // Variable-bound values are `var(--name)`, defined by each artboard's tokens stylesheet.
      tokens: this.options.tokens?.() ?? false,
      vectorElement: this.options.vectorElement,
      shallow,
      derivedSizes: true,
      fontFallbacks: this.options.fontFallbacks?.()
    })
    return doc.children[0] ?? null
  }

  /** Re-renders one layer's element and reconciles its children. False when it is not drawn. */
  private patchLayer(id: string, node: SceneNode, artboardId: string, doc: Document): boolean {
    if (this.locked.has(id)) return true

    const current = this.elements.get(id)
    const isRoot = id === artboardId
    if (!current && !isRoot) {
      // A layer not drawn yet: its parent creates it when it reconciles.
      if (node.parentId) this.dirty.add(node.parentId)
      return true
    }

    const projected = this.project(id, true)
    if (projected?.type !== 'element') {
      if (current) this.removeElement(current)
      return true
    }

    if (!current || !this.canPatch(current, projected)) {
      this.replaceSubtree(doc, id, current, isRoot)
      return true
    }

    patchAttributes(current, this.attributesFor(node, projected, isRoot))
    if (node.type === 'TEXT') {
      // Characters and their style runs: rebuilt only when they changed.
      const content = JSON.stringify(projected.children)
      if (this.textContent.get(current) !== content) {
        current.replaceChildren(...projected.children.map((child) => buildNode(doc, child)))
        this.textContent.set(current, content)
      }
    } else {
      this.reconcileChildren(doc, node, current)
    }
    return true
  }

  /** An element's attributes; an artboard's own element hugs its content as in its iframe. */
  private attributesFor(node: SceneNode, projected: DesignElement, isRoot: boolean) {
    return isRoot ? artboardAttributes(node, projected) : elementAttributes(projected)
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
