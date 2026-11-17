import { toRaw } from 'vue'

import type { SceneGraph } from '@kalka/scene-graph'

import type { EditorStore } from '@/app/editor/active-store'

/**
 * After a person asks the agent for something, the view goes to the first layer the agent then
 * creates, when it is out of view, so the result is watched as it lands. Once per request.
 */
const awaiting = new WeakSet<SceneGraph>()

/** A request went to the agent: its first new layer, wherever it lands, is brought into view. */
export function flyToNextCreation(store: EditorStore): void {
  awaiting.add(toRaw(store.graph))
}

function visible(store: EditorStore, x: number, y: number, width: number, height: number): boolean {
  const { panX, panY, zoom } = store.state
  const view = store.viewportCanvasCenter()
  const screenWidth = view.x * 2
  const screenHeight = view.y * 2
  const left = x * zoom + panX
  const top = y * zoom + panY
  return (
    left < screenWidth && top < screenHeight && left + width * zoom > 0 && top + height * zoom > 0
  )
}

/** The agent created `created`: if a request waits for its result, the view goes to the first. */
export function flyToCreation(store: EditorStore, created: readonly string[]): void {
  const graph = toRaw(store.graph)
  if (!awaiting.has(graph)) return
  const [first] = created
  if (!first || !store.graph.getNode(first)) return
  awaiting.delete(graph)
  // Read where it is once the call that made it has placed and laid it out.
  setTimeout(() => {
    const node = store.graph.getNode(first)
    if (!node) return
    const origin = store.graph.getAbsolutePosition(node.id)
    if (visible(store, origin.x, origin.y, node.width, node.height)) return
    store.centerOn(origin.x + node.width / 2, origin.y + node.height / 2, store.state.zoom)
  }, 0)
}
