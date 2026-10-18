import type { SceneGraph } from '@kalka/scene-graph'

import { layOutWithEngines } from './layout/engine'

export {
  applyMeasuredLayout,
  computedStyleWithEngines,
  getLayoutEngine,
  installLayoutEngine,
  type LayoutEngine
} from './layout/engine'
export { BrowserLayoutEngine, scriptLayoutPage, type LayoutPage } from './layout/browser'
export {
  estimateTextSize,
  getTextMeasurer,
  installTextMeasurer,
  setTextMeasurer,
  type TextMeasurer
} from './layout/text-measurement'

/**
 * Lays out an auto layout frame and what it holds through the installed engines, browsers. Without
 * one that draws the layer, layers keep the geometry they have.
 */
export function computeLayout(graph: SceneGraph, frameId: string): void {
  layOutWithEngines(graph, frameId)
}

/** Lays out everything under `scopeId`, the whole document by default, as {@link computeLayout}. */
export function computeAllLayouts(graph: SceneGraph, scopeId?: string): void {
  layOutWithEngines(graph, scopeId ?? graph.rootId)
}
