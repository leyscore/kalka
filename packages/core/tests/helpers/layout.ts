import { installLayoutEngine } from '@kalka/core/layout'
import type { SceneGraph, SceneNode } from '@kalka/scene-graph'

/**
 * Lays nothing out until the returned function is called: layers keep the geometry they have,
 * as they do without a browser. For tests of what happens before layout, such as text sizing
 * itself from a text measurer, which the browser would otherwise measure again.
 */
export function keepStoredLayout(): () => void {
  return installLayoutEngine({ layout: () => true })
}

export function autoFrame(
  graph: SceneGraph,
  parentId: string,
  overrides: Partial<SceneNode> = {}
): SceneNode {
  return graph.createNode('FRAME', parentId, {
    layoutMode: 'HORIZONTAL',
    primaryAxisSizing: 'FIXED',
    counterAxisSizing: 'FIXED',
    width: 400,
    height: 200,
    ...overrides
  })
}

export function rect(
  graph: SceneGraph,
  parentId: string,
  w = 50,
  h = 50,
  overrides: Partial<SceneNode> = {}
): SceneNode {
  return graph.createNode('RECTANGLE', parentId, {
    name: 'Rect',
    width: w,
    height: h,
    ...overrides
  })
}
