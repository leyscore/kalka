import type { SceneNode } from '@kalka/scene-graph'
import { colorToCSS } from '@kalka/scene-graph/color'

import { createArtboardFrame, placeBox, type ArtboardFrameBox } from './frame'
import type { ArtboardTier } from './tiers'

/** Marks the element standing in for an artboard that has no live iframe, by its layer id. */
export const STAND_IN_ATTR = 'data-kalka-stand-in'

/** What a placeholder fills its box with: the layer's own solid fill, or nothing. */
function placeholderBackground(node: SceneNode): string {
  const fill = node.fills.find((paint) => paint.visible && paint.type === 'SOLID')
  if (fill?.type !== 'SOLID') return ''
  return colorToCSS({ ...fill.color, a: fill.color.a * fill.opacity * node.opacity })
}

function placeholderRadius(node: SceneNode): string {
  if (node.independentCorners) {
    return `${node.topLeftRadius}px ${node.topRightRadius}px ${node.bottomRightRadius}px ${node.bottomLeftRadius}px`
  }
  return node.cornerRadius > 0 ? `${node.cornerRadius}px` : ''
}

/** The layer's own box within its iframe's. */
function innerBox(box: ArtboardFrameBox): ArtboardFrameBox {
  const { ink } = box
  return {
    x: box.x + ink.left,
    y: box.y + ink.top,
    width: Math.max(0, box.width - ink.left - ink.right),
    height: Math.max(0, box.height - ink.top - ink.bottom),
    ink: { top: 0, right: 0, bottom: 0, left: 0 }
  }
}

const STAND_IN_STYLE = 'position:absolute;left:0;top:0;margin:0;padding:0;pointer-events:none'

/** A snapshot bitmap on screen, and what it shows. */
export interface ShownSnapshot {
  /** The artboard's version when it was taken. */
  version: number
  /** Device pixels per canvas unit. */
  scale: number
  pixels: number
}

/**
 * One artboard as the canvas holds it, which only the projector changes: a live iframe, or,
 * while it has none or the one it has is still loading, a stand-in in its place, the snapshot
 * last taken of it or a placeholder of its fill.
 */
export class ArtboardSlot {
  /** The tier it is held at now. */
  tier: ArtboardTier
  /** The tier its place on screen asks for, which a gesture can hold it from for a while. */
  target: ArtboardTier
  box: ArtboardFrameBox | null = null
  frame: HTMLIFrameElement | null = null
  /** Null until the iframe's document has loaded, and while it has no iframe. */
  doc: Document | null = null
  /** Whether the iframe's document is built with its fonts in, so it can take over from the stand-in. */
  ready = false
  /** Whether the DOM changed since its geometry was last read. */
  stale = true
  /**
   * The layers patched since its geometry was last read, which bound what can have moved; null
   * when anything can have, as after it loads or its fonts or size change.
   */
  patched: Set<string> | null = null
  /**
   * Whether what changed since the last reading derives from the document rather than an edit:
   * the artboard loaded, or a font arrived in it.
   */
  derived = true
  observer: ResizeObserver | null = null
  /** Whether its layout was read since it was placed on the page, live or offscreen. */
  measured = false
  /** Counts the changes to what it draws, so a snapshot knows whether it still shows it. */
  version = 0
  snapshot: ShownSnapshot | null = null
  /** The version a snapshot could not be taken of, so it is not tried again until it changes. */
  failedCapture: number | null = null
  /** Holds keeping it live, such as a text edit inside it or a feature reading its DOM. */
  retained = 0
  /** Hidden because a preview stands in for it. */
  replaced = false
  /** Called once with whether it became live, by those waiting for it to. */
  readonly waiters: ((live: boolean) => void)[] = []
  private standIn: HTMLElement | null = null
  private blend = ''
  private order = ''

  constructor(
    readonly id: string,
    private readonly world: HTMLElement,
    tier: ArtboardTier
  ) {
    this.tier = tier
    this.target = tier
  }

  /** The elements that draw it, in stacking order. */
  get elements(): HTMLElement[] {
    const elements: HTMLElement[] = []
    if (this.frame) elements.push(this.frame)
    if (this.standIn) elements.push(this.standIn)
    return elements
  }

  get live(): boolean {
    return this.frame !== null
  }

  /** Creates its iframe; `loaded` runs once its document is there. */
  wake(loaded: (slot: ArtboardSlot) => void): void {
    if (this.frame) return
    const frame = createArtboardFrame(this.world.ownerDocument, this.id)
    frame.style.visibility = 'hidden'
    this.frame = frame
    this.doc = null
    this.ready = false
    this.stale = true
    this.patched = null
    this.derived = true
    frame.addEventListener(
      'load',
      () => {
        if (this.frame !== frame) return
        this.doc = frame.contentDocument
        loaded(this)
      },
      { once: true }
    )
    this.applyStyle()
    // Inserted where its stand-in is, so it stacks in the same place.
    if (this.standIn) this.standIn.before(frame)
    else if (this.box) this.world.append(frame)
  }

  /** Frees its iframe, its document and script realm with it; its stand-in shows instead. */
  sleep(node: SceneNode | undefined): void {
    this.observer?.disconnect()
    this.observer = null
    this.frame?.remove()
    this.frame = null
    this.doc = null
    this.ready = false
    if (!this.standIn && node) this.showPlaceholder(node)
  }

  /** Its iframe shows its document: the stand-in goes, with the snapshot it held. */
  markReady(): void {
    if (!this.frame || this.ready) return
    this.ready = true
    this.dropStandIn()
    this.applyVisibility()
    for (const resolve of this.waiters.splice(0)) resolve(true)
  }

  /** Shows a placeholder of the layer's fill, unless a stand-in is already shown. */
  showPlaceholder(node: SceneNode): void {
    if (this.standIn) return
    const element = this.world.ownerDocument.createElement('div')
    element.setAttribute(STAND_IN_ATTR, this.id)
    element.setAttribute('aria-hidden', 'true')
    element.style.cssText = STAND_IN_STYLE
    this.paintPlaceholder(element, node)
    this.insertStandIn(element)
  }

  /** Repaints a placeholder from the layer, as after an edit. */
  updatePlaceholder(node: SceneNode): void {
    if (this.standIn && !this.snapshot) this.paintPlaceholder(this.standIn, node)
  }

  /** Shows a snapshot bitmap as its stand-in, unless its iframe has taken over meanwhile. */
  showSnapshot(bitmap: ImageBitmap, version: number, scale: number): boolean {
    if (this.ready) {
      bitmap.close()
      return false
    }
    const canvas = this.world.ownerDocument.createElement('canvas')
    canvas.setAttribute(STAND_IN_ATTR, this.id)
    canvas.setAttribute('aria-hidden', 'true')
    canvas.style.cssText = STAND_IN_STYLE
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const context = canvas.getContext('bitmaprenderer')
    if (!context) {
      bitmap.close()
      return false
    }
    context.transferFromImageBitmap(bitmap)
    this.dropStandIn()
    this.snapshot = { version, scale, pixels: canvas.width * canvas.height }
    this.insertStandIn(canvas)
    return true
  }

  /** Lets the snapshot go, for a placeholder; the bitmap's memory goes with it. */
  dropSnapshot(node: SceneNode | undefined): void {
    if (!this.snapshot) return
    this.dropStandIn()
    if (!this.frame && node) this.showPlaceholder(node)
  }

  /** Places what draws it over `box`, blended with what lies below as `blend` says. */
  place(box: ArtboardFrameBox, blend: string): void {
    this.box = box
    this.blend = blend
    this.applyStyle()
  }

  /** Its place in the canvas's stacking order. */
  setOrder(order: string): void {
    this.order = order
    this.applyStyle()
  }

  /** Paints its iframe on screen only when visible and ready; the stand-in shows until then. */
  applyVisibility(): void {
    for (const element of this.elements) {
      if (element.dataset.kalkaTier !== this.tier) element.dataset.kalkaTier = this.tier
    }
    if (this.frame) {
      const shown = this.ready && this.tier === 'visible' && !this.replaced
      const visibility = shown ? '' : 'hidden'
      if (this.frame.style.visibility !== visibility) this.frame.style.visibility = visibility
    }
    if (this.standIn) {
      const visibility = this.replaced ? 'hidden' : ''
      if (this.standIn.style.visibility !== visibility) this.standIn.style.visibility = visibility
    }
  }

  destroy(): void {
    this.sleep(undefined)
    this.dropStandIn()
    for (const resolve of this.waiters.splice(0)) resolve(false)
  }

  private paintPlaceholder(element: HTMLElement, node: SceneNode): void {
    const background = placeholderBackground(node)
    const radius = placeholderRadius(node)
    if (element.style.background !== background) element.style.background = background
    if (element.style.borderRadius !== radius) element.style.borderRadius = radius
  }

  private insertStandIn(element: HTMLElement): void {
    this.standIn = element
    this.applyStyle()
    // After its iframe, or where the projector places the artboard next.
    if (this.frame) this.frame.after(element)
    else this.world.append(element)
  }

  private dropStandIn(): void {
    this.standIn?.remove()
    this.standIn = null
    this.snapshot = null
  }

  private applyStyle(): void {
    const box = this.box
    for (const element of this.elements) {
      const style = element.style
      // A placeholder covers the layer's own box, inside what its iframe reaches past it.
      if (box) placeBox(element, element === this.standIn && !this.snapshot ? innerBox(box) : box)
      if (style.mixBlendMode !== this.blend) style.mixBlendMode = this.blend
      if (style.zIndex !== this.order) style.zIndex = this.order
    }
    this.applyVisibility()
  }
}
