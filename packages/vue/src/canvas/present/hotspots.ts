import { onScopeDispose, shallowRef } from 'vue'

import type { SceneGraph } from '@kalka/scene-graph'

/** A presented frame, as far as hotspot hints read it. */
export interface HotspotFrame {
  rootId: string
  graph: SceneGraph
  elementOf: (nodeId: string) => HTMLElement | null
}

export interface HotspotBox {
  id: string
  x: number
  y: number
  width: number
  height: number
}

/** How long hints show, and when they start to fade. */
const SHOW_MS = 700
const FADE_AFTER_MS = 400

/**
 * Figma's hotspot hints: a click in a prototype that runs nothing shows, for a moment, where the
 * layers that do something are. Boxes are in the presented frame's coordinates, as `measure`
 * gives an element's box.
 */
export function useHotspotHints(measure: (element: HTMLElement) => Omit<HotspotBox, 'id'>) {
  const hotspots = shallowRef<HotspotBox[]>([])
  const fading = shallowRef(false)
  let timers: ReturnType<typeof setTimeout>[] = []

  function clear() {
    for (const timer of timers) clearTimeout(timer)
    timers = []
  }

  function flash(frames: Iterable<HotspotFrame>) {
    const boxes: HotspotBox[] = []
    for (const { rootId, graph, elementOf } of frames) {
      for (const node of graph.getAllNodes()) {
        if (node.id === rootId || node.reactions.length === 0) continue
        if (!graph.isDescendant(node.id, rootId)) continue
        const element = elementOf(node.id)
        if (!element) continue
        const box = measure(element)
        if (box.width > 0 && box.height > 0) boxes.push({ id: `${rootId}:${node.id}`, ...box })
      }
    }
    clear()
    hotspots.value = boxes
    fading.value = false
    timers.push(setTimeout(() => (fading.value = true), FADE_AFTER_MS))
    timers.push(setTimeout(() => (hotspots.value = []), SHOW_MS))
  }

  onScopeDispose(clear)
  return { hotspots, fading, flash }
}
