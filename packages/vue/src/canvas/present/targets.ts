import type { PresentScreens } from './screens'

/**
 * What the app's layers over a presented prototype, such as comments, reach in it: the frames
 * shown, topmost last, the element drawing a layer, and the layers at a point of the window. The
 * presenter's layers live in shadow roots, which a document-level hit test does not enter.
 */
export interface PresentTargets {
  shownFrameIds: () => string[]
  elementOf: (nodeId: string) => HTMLElement | null
  /** The layers at a window point, innermost first, in the topmost frame that has one there. */
  layersAt: (clientX: number, clientY: number) => string[]
  /** How much the presented screen is scaled to fit the window. */
  scale: () => number
}

export function presentTargets(screens: PresentScreens, scale: () => number): PresentTargets {
  const topmostFirst = () => [...screens.shownKeys()].reverse()
  return {
    shownFrameIds: () => [
      screens.screen.value.rootId,
      ...screens.overlays.value.map((overlay) => overlay.frameId)
    ],
    elementOf(nodeId) {
      for (const key of topmostFirst()) {
        const element = screens.instances.get(key)?.elementOf(nodeId)
        if (element) return element
      }
      return null
    },
    layersAt(clientX, clientY) {
      for (const key of topmostFirst()) {
        const root = screens.hosts.get(key)?.shadowRoot
        const instance = screens.instances.get(key)
        if (!root || !instance) continue
        const inside = root
          .elementsFromPoint(clientX, clientY)
          .find((element) => element.getRootNode() === root)
        const ids = inside ? instance.layersAt(inside) : []
        if (ids.length > 0) return ids
      }
      return []
    },
    scale
  }
}
