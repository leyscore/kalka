import type { SceneGraph } from '@kalka/scene-graph'

import type { ArtboardSlot } from './slot'
import {
  EmbeddedFonts,
  rasterizeSnapshot,
  snapshotImage,
  snapshotScale,
  type SnapshotSource
} from './snapshot'
import {
  SNAPSHOT_MAX_PIXELS,
  artboardTier,
  isLive,
  rank,
  screenDistance,
  type ArtboardTier,
  type TierView
} from './tiers'

/** Artboards woken in one frame at most, so a zoom out that shows many spreads the work. */
const WAKES_PER_FRAME = 2
/** Artboards put to sleep in one frame at most. */
const SLEEPS_PER_FRAME = 4
/** Pixels all snapshots hold together at most; farther artboards keep their placeholder. */
const SNAPSHOT_BUDGET_PIXELS = 32 * SNAPSHOT_MAX_PIXELS
/**
 * How far the zoom can move from the one a snapshot was taken at before it is taken again: a
 * pictured artboard is on screen and must stay sharp, a far one is only seen in passing.
 */
const SNAPSHOT_RESCALE = { pictured: 1.25, far: 2 } as const

/** What the projector needs to know of the view to hold each artboard at its tier. */
export interface ProjectorView extends TierView {
  /** Device pixels per CSS pixel, which snapshots are taken at. */
  pixelRatio: number
  /** False during a gesture: artboards wake and sleep once the view rests. */
  resting: boolean
}

/** What the projector does for its artboards as they move between tiers. */
export interface ArtboardSlotsHost {
  graph(): SceneGraph
  destroyed(): boolean
  /** Creates the iframe of a slot that sleeps. */
  wake(slot: ArtboardSlot): void
  /** Frees the iframe of a live slot. */
  sleep(slot: ArtboardSlot): void
  /** Whether a layer inside the artboard is edited in place, which keeps it live. */
  holdsLock(artboardId: string): boolean
  /**
   * Whether the artboard holds what the user works on, such as the selection: it stays live
   * where it would be pictured, so a gesture on it draws as it goes.
   */
  isActive(artboardId: string): boolean
  /** Asks for an artboard's layout to be read on the next frame. */
  reflow(artboardId: string): void
  /** Asks for a frame: a feature waits on a tier change. */
  changed(): void
  /** What a snapshot of the artboard is drawn from. */
  snapshotSource(artboardId: string): SnapshotSource
  readonly ownerDocument: Document
}

/**
 * The page's artboards and the tier each is held at, which only the projector drives. It moves
 * artboards between tiers as the view asks, keeps those features hold live, and takes the
 * snapshots of those that sleep nearby.
 */
export class ArtboardSlots {
  private readonly slots = new Map<string, ArtboardSlot>()
  private readonly embeddedFonts = new EmbeddedFonts()
  private view: ProjectorView | null = null
  private capturing = false
  /** Page children previews stand in for, hidden meanwhile. */
  replaced: ReadonlySet<string> = new Set()

  constructor(private readonly host: ArtboardSlotsHost) {}

  get(id: string): ArtboardSlot | undefined {
    return this.slots.get(id)
  }

  set(slot: ArtboardSlot): void {
    this.slots.set(slot.id, slot)
  }

  delete(id: string): void {
    this.slots.delete(id)
  }

  values(): IterableIterator<ArtboardSlot> {
    return this.slots.values()
  }

  keys(): IterableIterator<string> {
    return this.slots.keys()
  }

  entries(): IterableIterator<[string, ArtboardSlot]> {
    return this.slots.entries()
  }

  clear(): void {
    for (const slot of this.slots.values()) slot.destroy()
    this.slots.clear()
  }

  setView(view: ProjectorView): void {
    this.view = view
  }

  /** Keeps an artboard live, woken if it sleeps, until the returned release. */
  retain(artboardId: string): () => void {
    const slot = this.slots.get(artboardId)
    if (!slot) return () => undefined
    slot.retained++
    this.host.changed()
    let released = false
    return () => {
      if (released) return
      released = true
      slot.retained = Math.max(0, slot.retained - 1)
      this.host.changed()
    }
  }

  /** Resolves once an artboard is live and shows the graph; false when it left the page first. */
  whenLive(artboardId: string): Promise<boolean> {
    const slot = this.slots.get(artboardId)
    if (!slot) return Promise.resolve(false)
    if (slot.ready) return Promise.resolve(true)
    const release = this.retain(artboardId)
    return new Promise<boolean>((resolve) => {
      slot.waiters.push((live) => {
        release()
        resolve(live)
      })
    })
  }

  setReplaced(ids: ReadonlySet<string>): void {
    this.replaced = ids
    for (const slot of this.slots.values()) {
      const replaced = ids.has(slot.id)
      if (slot.replaced === replaced) continue
      slot.replaced = replaced
      slot.applyVisibility()
    }
  }

  /** The tier the view asks for; something reading or editing its DOM keeps it live. */
  targetTier(slot: ArtboardSlot): ArtboardTier {
    const view = this.view
    let tier: ArtboardTier =
      view && slot.box ? artboardTier(slot.box, view, slot.tier, view.pixelRatio) : 'visible'
    const held = slot.retained > 0 || this.host.holdsLock(slot.id)
    if (tier === 'pictured' && (held || this.host.isActive(slot.id))) tier = 'visible'
    if (held && rank(tier) > rank('near')) tier = 'near'
    return tier
  }

  /**
   * Moves artboards to the tiers the view asks for. Painting stops and starts at once; waking
   * and sleeping wait for the view to rest, a few artboards a frame. True while some are left.
   */
  apply(): boolean {
    const view = this.view
    if (!view) return false
    const budget = { wakes: WAKES_PER_FRAME, sleeps: SLEEPS_PER_FRAME }
    let left = false
    for (const slot of this.slots.values()) {
      const target = this.targetTier(slot)
      slot.target = target
      if (isLive(target)) left = !this.keepLive(slot, target, view, budget) || left
      else left = !this.letSleep(slot, target, view, budget) || left
    }
    return left
  }

  /** Brings a slot to a live tier; false when it has to wait. */
  private keepLive(
    slot: ArtboardSlot,
    target: ArtboardTier,
    view: ProjectorView,
    budget: { wakes: number }
  ): boolean {
    if (!slot.live) {
      // A feature waiting on it cannot wait for the view to rest.
      if ((!view.resting && slot.retained === 0) || budget.wakes <= 0) return false
      budget.wakes--
      this.host.wake(slot)
    }
    if (slot.tier !== target) {
      slot.tier = target
      slot.applyVisibility()
    }
    return true
  }

  /** Brings a slot to a tier without an iframe; false when it has to wait. */
  private letSleep(
    slot: ArtboardSlot,
    target: ArtboardTier,
    view: ProjectorView,
    budget: { sleeps: number }
  ): boolean {
    // A live artboard is pictured once its snapshot is taken, which puts it to sleep; on screen
    // meanwhile, it paints.
    if (slot.live && target === 'pictured') {
      if (slot.tier !== 'visible') {
        slot.tier = 'visible'
        slot.applyVisibility()
      }
      return true
    }
    if (slot.live) {
      if (!view.resting || budget.sleeps <= 0) {
        // Off screen, it stops painting while it waits.
        if (slot.tier === 'visible') {
          slot.tier = 'near'
          slot.applyVisibility()
        }
        return false
      }
      // An edit in it holds it.
      if (this.host.holdsLock(slot.id)) return true
      // Its layout is read before its document goes, on the next frame.
      if (slot.stale && slot.doc) {
        this.host.reflow(slot.id)
        return false
      }
      budget.sleeps--
      this.host.sleep(slot)
    }
    slot.tier = target
    if (target === 'dormant') slot.dropSnapshot(this.host.graph().getNode(slot.id))
    return true
  }

  /** Whether a snapshot is due: an artboard that sleeps in the far tier shows an old one or none. */
  get needsCapture(): boolean {
    return !this.capturing && this.nextCapture() !== null
  }

  /** Takes the snapshot due next, the nearest first; resolves with whether one was shown. */
  async captureNext(): Promise<boolean> {
    const view = this.view
    const slot = this.capturing ? null : this.nextCapture()
    if (!view || !slot?.box) return false
    this.capturing = true
    try {
      const version = slot.version
      const scale = snapshotScale(slot.box, view.zoom, view.pixelRatio)
      const image = snapshotImage(
        this.host.snapshotSource(slot.id),
        scale,
        this.embeddedFonts,
        this.host.ownerDocument
      )
      const bitmap = image ? await rasterizeSnapshot(image) : null
      if (!bitmap) {
        // Not taken again until it changes.
        slot.failedCapture = version
        return false
      }
      // It may have left the page, or woken, meanwhile; a change since is taken next time.
      if (this.host.destroyed() || this.slots.get(slot.id) !== slot || !this.canShow(slot)) {
        bitmap.close()
        return false
      }
      if (slot.live) {
        // A live artboard to be pictured gives its iframe up for the snapshot.
        this.host.sleep(slot)
        slot.tier = 'pictured'
      }
      return slot.showSnapshot(bitmap, version, scale)
    } finally {
      this.capturing = false
    }
  }

  /** Whether a snapshot just taken can stand in for the artboard now. */
  private canShow(slot: ArtboardSlot): boolean {
    if (!slot.live) return true
    return slot.target === 'pictured' && (this.view?.resting ?? false) && !slot.stale
  }

  /** An artboard placed on the page but never laid out, which sleeps. */
  nextUnmeasured(): string | null {
    for (const slot of this.slots.values()) if (!slot.live && !slot.measured) return slot.id
    return null
  }

  /** Which snapshot an artboard wants: one standing in on screen, one far away, or none. */
  private snapshotKind(slot: ArtboardSlot): 'pictured' | 'far' | null {
    if (slot.target === 'pictured') return 'pictured'
    return !slot.live && slot.tier === 'far' ? 'far' : null
  }

  private nextCapture(): ArtboardSlot | null {
    const view = this.view
    if (!view) return null
    let used = 0
    for (const slot of this.slots.values()) used += slot.snapshot?.pixels ?? 0
    let best: ArtboardSlot | null = null
    let bestDistance = Infinity
    for (const slot of this.slots.values()) {
      const kind = this.snapshotKind(slot)
      if (!kind || !slot.box) continue
      if (slot.failedCapture === slot.version) continue
      const scale = snapshotScale(slot.box, view.zoom, view.pixelRatio)
      const shown = slot.snapshot
      const rescale = SNAPSHOT_RESCALE[kind]
      const current =
        shown?.version === slot.version &&
        shown.scale * rescale >= scale &&
        shown.scale <= scale * rescale
      if (current) continue
      // Pictured artboards are on screen, which bounds what they hold together.
      const pixels = slot.box.width * slot.box.height * scale * scale
      if (kind === 'far' && !shown && used + pixels > SNAPSHOT_BUDGET_PIXELS) continue
      const distance = screenDistance(slot.box, view)
      if (distance < bestDistance) {
        best = slot
        bestDistance = distance
      }
    }
    return best
  }
}
