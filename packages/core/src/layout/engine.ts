import type { SceneGraph } from '@open-pencil/scene-graph'

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
