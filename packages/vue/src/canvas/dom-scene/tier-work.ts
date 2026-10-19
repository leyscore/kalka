import type { EditorState } from '@kalka/core/editor'
import type { ViewportTransform } from '@kalka/core/geometry'
import { computeLayout } from '@kalka/core/layout'
import type { SceneGraph } from '@kalka/scene-graph'

import type { DomSceneProjector } from './projector'

/** How long the view must stay still before artboards wake and sleep, and snapshots are taken. */
export const REST_MS = 150
/** How long idle work waits for an idle moment at most. */
const IDLE_TIMEOUT_MS = 1000

/**
 * Drives the projector's artboard tiers from the canvas: the view each frame, whether it rests,
 * and the work that waits for an idle moment, one piece at a time: laying out artboards that
 * sleep and were never laid out, then taking the snapshots of those that sleep nearby.
 */
export class ArtboardTierWork {
  private movedAt = Number.NEGATIVE_INFINITY
  private width = 0
  private height = 0
  private restTimer: ReturnType<typeof setTimeout> | null = null
  private cancelIdle: (() => void) | null = null
  private destroyed = false
  private observer: ResizeObserver | null = null
  private transform = ''

  constructor(
    private readonly projector: DomSceneProjector,
    private readonly getGraph: () => SceneGraph,
    private readonly redraw: () => void
  ) {}

  /** Follows the size of the canvas's element. */
  observe(element: HTMLElement): void {
    this.resize(element.clientWidth, element.clientHeight)
    this.observer = new ResizeObserver(() => this.resize(element.clientWidth, element.clientHeight))
    this.observer.observe(element)
  }

  /** The canvas's size in CSS pixels. */
  resize(width: number, height: number): void {
    if (width === this.width && height === this.height) return
    this.width = width
    this.height = height
    this.redraw()
  }

  /** The view moved: a gesture holds wakes and sleeps until it rests. */
  moved(now = performance.now()): void {
    this.movedAt = now
  }

  get resting(): boolean {
    return performance.now() - this.movedAt >= REST_MS
  }

  /**
   * Moves the projector's world to the view and gives it the view, before it flushes, so new
   * artboards start at their tier.
   */
  follow(view: ViewportTransform): void {
    const transform = `translate(${view.panX}px, ${view.panY}px) scale(${view.zoom})`
    const world = this.projector.world.style
    if (transform !== this.transform) {
      // While the view moves, the world is one compositor layer, so a pan or zoom only moves
      // that layer. At rest it goes back to normal layers: one huge layer kept at every zoom
      // costs GPU tiles that weaker GPUs drop, leaving parts of the page undrawn.
      world.willChange = 'transform'
      world.transform = transform
      this.transform = transform
      this.moved()
      this.redrawAtRest()
    } else if (world.willChange) {
      if (this.resting) world.willChange = ''
      else this.redrawAtRest()
    }
    const window = this.projector.world.ownerDocument.defaultView
    this.projector.setView({
      panX: view.panX,
      panY: view.panY,
      zoom: view.zoom,
      width: this.width,
      height: this.height,
      pixelRatio: window?.devicePixelRatio ?? 1,
      resting: this.resting
    })
  }

  /** Moves artboards between tiers after a flush; true while work is left for the next frame. */
  apply(): boolean {
    const left = this.projector.applyTiers()
    const resting = this.resting
    if (left && !resting) this.redrawAtRest()
    this.scheduleIdle()
    return left && resting
  }

  destroy(): void {
    this.destroyed = true
    this.observer?.disconnect()
    this.observer = null
    if (this.restTimer !== null) clearTimeout(this.restTimer)
    this.restTimer = null
    this.cancelIdle?.()
    this.cancelIdle = null
  }

  private redrawAtRest(): void {
    if (this.restTimer !== null) return
    const wait = Math.max(0, this.movedAt + REST_MS - performance.now())
    this.restTimer = setTimeout(() => {
      this.restTimer = null
      if (!this.destroyed) this.redraw()
    }, wait + 1)
  }

  private get hasIdleWork(): boolean {
    return this.projector.nextUnmeasured() !== null || this.projector.needsCapture
  }

  private scheduleIdle(): void {
    if (this.destroyed || this.cancelIdle || !this.hasIdleWork) return
    this.cancelIdle = whenIdle(() => {
      this.cancelIdle = null
      if (this.destroyed) return
      if (!this.resting) {
        // A gesture is on: try again once it rests.
        this.redrawAtRest()
        return
      }
      void this.runIdle().then(
        () => this.scheduleIdle(),
        () => this.scheduleIdle()
      )
    }, IDLE_TIMEOUT_MS)
  }

  private async runIdle(): Promise<void> {
    const unmeasured = this.projector.nextUnmeasured()
    if (unmeasured) {
      // Laid out offscreen, as the canvas would lay it out had it shown it: derived, not an edit.
      const graph = this.getGraph()
      graph.applyDerivedLayoutDuring(() => computeLayout(graph, unmeasured))
      this.projector.markMeasured(unmeasured)
      return
    }
    await this.projector.captureNext()
  }
}

/** The layers the user works on in a view: its selection and what a gesture edits. */
export function* activeLayers(state: EditorState): Generator<string> {
  yield* state.selectedIds
  if (state.editingTextId) yield state.editingTextId
  if (state.nodeEditState) yield state.nodeEditState.nodeId
  if (state.rotationPreview) yield state.rotationPreview.nodeId
}

/** Runs `task` once the page is idle, or after `timeoutMs` at the latest; returns its cancel. */
function whenIdle(task: () => void, timeoutMs: number): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const handle = window.requestIdleCallback(task, { timeout: timeoutMs })
    return () => window.cancelIdleCallback(handle)
  }
  // Safari before 18 has no idle callbacks.
  const handle = window.setTimeout(task, Math.min(timeoutMs, 250))
  return () => window.clearTimeout(handle)
}
