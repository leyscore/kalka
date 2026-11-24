import { toRaw } from 'vue'

import type { SceneGraph } from '@kalka/scene-graph'
import type { Rect } from '@kalka/scene-graph/primitives'

import type { EditorStore } from '@/app/editor/active-store'

import { glideViewTo } from './cursor-motion'
import { centerViewForAgent } from './registry'

/**
 * After a person asks the agent for something, the view goes to where the agent builds: first to
 * the place its work loads, then to the first layer it creates, when either is not wholly in view,
 * so the result is watched as it lands. The view glides there; it never jumps.
 */
const awaiting = new WeakSet<SceneGraph>()

/** Screen pixels kept free around what the view goes to. */
const MARGIN = 80

/** A request went to the agent: where it builds, wherever that is, is brought into view. */
export function flyToNextCreation(store: EditorStore): void {
  awaiting.add(toRaw(store.graph))
}

function inView(store: EditorStore, rect: Rect): boolean {
  const { panX, panY, zoom } = store.state
  const screen = store.viewportCanvasCenter()
  const left = rect.x * zoom + panX
  const top = rect.y * zoom + panY
  return (
    left >= 0 &&
    top >= 0 &&
    left + rect.width * zoom <= screen.x * 2 &&
    // A page is taller than the screen: its top is what has to show.
    top + Math.min(rect.height * zoom, screen.y) <= screen.y * 2
  )
}

function glideTo(store: EditorStore, rect: Rect): void {
  if (inView(store, rect)) return
  const screen = store.viewportCanvasCenter()
  const width = screen.x * 2
  const height = screen.y * 2
  // Fit the width, and never zoom in on the way: the person chose how close they look.
  const zoom = Math.min(store.state.zoom, (width - MARGIN * 2) / rect.width)
  if (!(zoom > 0)) return
  const shown = Math.min(rect.height, (height - MARGIN * 2) / zoom)
  glideViewTo(
    store,
    { x: rect.x + rect.width / 2, y: rect.y + shown / 2 },
    zoom,
    (x, y, nextZoom) => centerViewForAgent(store, x, y, nextZoom)
  )
}

/** The agent's work starts loading at `rect`: if a request waits for its result, the view goes. */
export function flyToPlace(store: EditorStore, rect: Rect): void {
  if (awaiting.has(toRaw(store.graph))) glideTo(store, rect)
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
    glideTo(store, { x: origin.x, y: origin.y, width: node.width, height: node.height })
  }, 0)
}
