import type { MeasuredGeometry } from '@kalka/dom-css/export'
import type { SceneGraph, SceneNode } from '@kalka/scene-graph'

/** Below this, a measured value is the value the layer already has. */
const EPSILON = 0.01

/**
 * Lays out layers in a browser, which renders them as DOM: it lays out a layer's subtree and
 * writes the resulting geometry back into the graph. Core computes no layout itself.
 */
export interface LayoutEngine {
  /**
   * Lays out `nodeId` and everything inside it, writing `x`, `y`, `width` and `height`.
   * Returns false when it did not, for graphs or pages the engine does not draw: the engine
   * installed before it gets the layer, and without one the layers keep the geometry they have.
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

/** Installed engines, the latest last: uninstalling one gives layout back to the one before. */
const installed: LayoutEngine[] = []

/** Routes layout through `engine` until the returned function uninstalls it. */
export function installLayoutEngine(engine: LayoutEngine): () => void {
  installed.push(engine)
  return () => {
    const index = installed.lastIndexOf(engine)
    if (index !== -1) installed.splice(index, 1)
  }
}

export function getLayoutEngine(): LayoutEngine | null {
  return installed.at(-1) ?? null
}

/**
 * Lays out `nodeId` with the latest engine that draws it: one that leaves it gives it to the one
 * installed before, such as the canvas to an off-screen page. False when none laid it out.
 */
export function layOutWithEngines(graph: SceneGraph, nodeId: string): boolean {
  for (let index = installed.length - 1; index >= 0; index--) {
    if (installed[index].layout(graph, nodeId)) return true
  }
  return false
}

/** The computed CSS of a layer from the latest engine that draws it, or null when none does. */
export function computedStyleWithEngines(
  graph: SceneGraph,
  nodeId: string,
  properties: readonly string[]
): Record<string, string> | null {
  for (let index = installed.length - 1; index >= 0; index--) {
    const styles = installed[index].computedStyle?.(graph, nodeId, properties)
    if (styles) return styles
  }
  return null
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
