import type { MeasuredGeometry } from '@kalka/dom-css/export'
import type { SceneGraph, SceneNode } from '@kalka/scene-graph'

/** Below this, a measured value is the value the layer already has. */
const EPSILON = 0.01

/**
 * Lays out layers somewhere other than Yoga, such as a browser that renders the page as DOM:
 * it lays out a layer's subtree and writes the resulting geometry back into the graph.
 */
export interface LayoutEngine {
  /**
   * Lays out `nodeId` and everything inside it, writing `x`, `y`, `width` and `height`.
   * Returns false to leave the layer to Yoga, for graphs or pages the engine does not draw.
   */
  layout(graph: SceneGraph, nodeId: string): boolean
  /**
   * The CSS the browser computed for a layer as it draws it, for the properties named (all of
   * them when the list is empty). Null when the engine does not draw the layer right now.
   */
  computedStyle?(
    graph: SceneGraph,
    nodeId: string,
    properties: readonly string[]
  ): Record<string, string> | null
}

let installed: LayoutEngine | null = null

/** Routes layout through `engine` until the returned function uninstalls it. */
export function installLayoutEngine(engine: LayoutEngine): () => void {
  installed = engine
  return () => {
    if (installed === engine) installed = null
  }
}

export function getLayoutEngine(): LayoutEngine | null {
  return installed
}

/**
 * Writes the boxes a browser laid out back into the layers' `x`, `y`, `width` and `height`, as
 * layout's own result: they become a cache of what the browser computed, not an edit.
 */
export function applyMeasuredLayout(
  graph: SceneGraph,
  measured: ReadonlyMap<string, MeasuredGeometry>
): void {
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
