import { applyMeasuredLayout, computeLayout, type LayoutEngine } from '@kalka/core/layout'
import type { SceneGraph } from '@kalka/scene-graph'

import type { DomSceneProjector } from './projector'

/**
 * Layout by the browser. The projector writes CSS, the browser lays it out, and this engine
 * reads every box back into the layers' `x`, `y`, `width` and `height`, which become a cache of
 * what the browser computed. It never computes a position itself.
 *
 * Layers the DOM scene does not draw (other pages, graphs used for export or previews, artboards
 * that sleep or whose iframe is still loading) go to the engine installed before it, which lays
 * them out in hidden iframes.
 */
export class DomLayoutEngine implements LayoutEngine {
  constructor(
    private readonly projector: DomSceneProjector,
    private readonly getGraph: () => SceneGraph
  ) {}

  layout(graph: SceneGraph, nodeId: string): boolean {
    if (graph !== this.getGraph()) return false
    const plan = this.projector.layoutPlan(nodeId)
    if (!plan) return false
    // A layout runs right after an edit: bring the DOM up to date first, synchronously.
    if (this.projector.needsFlush) this.projector.flush()
    for (const id of plan.live) this.read(graph, id)
    // Each artboard without a live document goes to the engines below, which this one declines.
    for (const id of plan.elsewhere) computeLayout(graph, id)
    return true
  }

  /** The canvas on screen lays the page it shows out as its artboards load. */
  presentsPages(graph: SceneGraph): boolean {
    return graph === this.getGraph() && this.projector.shown
  }

  computedStyle(
    graph: SceneGraph,
    nodeId: string,
    properties: readonly string[]
  ): Record<string, string> | null {
    if (graph !== this.getGraph()) return null
    if (this.projector.needsFlush) this.projector.flush()
    const element = this.projector.elementOf(nodeId)
    const view = element?.ownerDocument.defaultView
    if (!element || !view) return null
    const style = view.getComputedStyle(element)
    const names = properties.length > 0 ? properties : Array.from(style)
    const values: Record<string, string> = {}
    for (const name of names) {
      const value = style.getPropertyValue(name)
      if (value) values[name] = value
    }
    return values
  }

  /** Wakes the artboard drawing a layer of the page shown, so its computed style can be read. */
  async drawLayer(graph: SceneGraph, nodeId: string): Promise<boolean> {
    if (graph !== this.getGraph()) return false
    const artboardId = this.projector.artboardIdOf(nodeId)
    return artboardId ? this.projector.whenLive(artboardId) : false
  }

  /** Re-reads artboards whose layout changed on its own, such as when a font arrives. */
  refresh(artboardIds: Iterable<string>): void {
    const graph = this.getGraph()
    for (const id of artboardIds) this.read(graph, id)
  }

  /**
   * Reads an artboard's boxes back if its DOM changed. What a load or a font arriving changes is
   * layout derived from the document, not an edit, as the document's own layout pass is.
   */
  private read(graph: SceneGraph, id: string): void {
    if (!this.projector.isStale(id)) return
    const derived = this.projector.readsDerivedLayout(id)
    const measured = this.projector.measureArtboard(id)
    if (derived) graph.applyDerivedLayoutDuring(() => applyMeasuredLayout(graph, measured))
    else applyMeasuredLayout(graph, measured)
  }
}
