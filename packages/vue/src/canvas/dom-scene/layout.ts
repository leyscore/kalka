import type { LayoutEngine } from '@kalka/core/layout'
import type { SceneGraph, SceneNode } from '@kalka/scene-graph'

import type { DomSceneProjector, MeasuredGeometry } from './projector'

/** Below this, a measured value is the value the layer already has. */
const EPSILON = 0.01

/**
 * Layout by the browser. The projector writes CSS, the browser lays it out, and this engine
 * reads every box back into the layers' `x`, `y`, `width` and `height`, which become a cache of
 * what the browser computed. It never computes a position itself.
 *
 * Layers the DOM scene does not draw (other pages, graphs used for export or previews) are left
 * to Yoga.
 */
export class DomLayoutEngine implements LayoutEngine {
  constructor(
    private readonly projector: DomSceneProjector,
    private readonly getGraph: () => SceneGraph
  ) {}

  layout(graph: SceneGraph, nodeId: string): boolean {
    if (graph !== this.getGraph()) return false
    const artboards = this.projector.artboardsFor(nodeId)
    if (!artboards) return false
    // A layout runs right after an edit: bring the DOM up to date first, synchronously.
    if (this.projector.needsFlush) this.projector.flush()
    for (const id of artboards) {
      if (this.projector.isStale(id)) this.writeBack(graph, this.projector.measureArtboard(id))
    }
    return true
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

  /** Re-reads artboards whose layout changed on its own, such as when a font arrives. */
  refresh(artboardIds: Iterable<string>): void {
    const graph = this.getGraph()
    for (const id of artboardIds) {
      if (this.projector.isStale(id)) this.writeBack(graph, this.projector.measureArtboard(id))
    }
  }

  private writeBack(graph: SceneGraph, measured: Map<string, MeasuredGeometry>): void {
    if (measured.size === 0) return
    graph.withLayoutMutations(() => {
      for (const [id, geometry] of measured) {
        const node = graph.getNode(id)
        if (!node) continue
        const changes: Partial<Pick<SceneNode, 'x' | 'y' | 'width' | 'height'>> = {}
        for (const key of ['x', 'y', 'width', 'height'] as const) {
          const value = geometry[key]
          if (value !== undefined && Math.abs(value - node[key]) > EPSILON) changes[key] = value
        }
        if (Object.keys(changes).length > 0) graph.updateNode(id, changes)
      }
    })
  }
}
