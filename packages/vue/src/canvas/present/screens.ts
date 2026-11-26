import { computed, shallowRef } from 'vue'

import { startPresentation, type PresentState } from '@kalka/core/editor'
import type { SceneGraph } from '@kalka/scene-graph'

import type { DelayFrame } from './delays'
import type { HotspotFrame } from './hotspots'

/** What a presented frame exposes, as `PresentScreen` defines it. */
export interface ScreenInstance {
  container: HTMLElement | null
  layersAt: (target: EventTarget | null) => string[]
  elementOf: (nodeId: string) => HTMLElement | null
  graph: () => SceneGraph
  pathOf: (nodeId: string) => string
}

/** A drawn frame: the key of its `PresentScreen` and the frame it presents. */
export interface Shown {
  key: string
  rootId: string
}

/** A shown frame with the graph, paths and elements of its presented layers. */
export type ShownFrame = DelayFrame & HotspotFrame

function isScreen(value: unknown): value is ScreenInstance {
  return !!value && typeof value === 'object' && 'layersAt' in value && 'graph' in value
}

/**
 * The frames a presentation draws: the presentation's state, the screen and the one a
 * transition is leaving, the open overlays, and the `PresentScreen` drawing each of them.
 */
export function usePresentScreens(pageId: string, startId: string) {
  const present = shallowRef<PresentState>(startPresentation(pageId, startId))
  let nextKey = 0
  const shownOf = (rootId: string): Shown => ({ key: `s${nextKey++}`, rootId })
  const screen = shallowRef<Shown>(shownOf(startId))
  /** The screen a transition is leaving, drawn until the transition ends. */
  const leaving = shallowRef<{ shown: Shown; onTop: boolean } | null>(null)
  const instances = new Map<string, ScreenInstance>()
  const hosts = new Map<string, HTMLElement>()

  const overlays = computed(() =>
    present.value.overlays.map((overlay, index) => ({
      ...overlay,
      key: `o${index}:${overlay.frameId}`
    }))
  )

  function register(key: string, value: unknown) {
    if (isScreen(value)) {
      instances.set(key, value)
      const host = (value as { $el?: unknown }).$el
      if (host instanceof HTMLElement) hosts.set(key, host)
    } else {
      instances.delete(key)
      hosts.delete(key)
    }
  }

  /** Draws `rootId` as a new screen. */
  function show(rootId: string) {
    screen.value = shownOf(rootId)
  }

  /** Starts the presentation again from `startId`. */
  function restart(page: string, start: string) {
    leaving.value = null
    present.value = startPresentation(page, start)
    show(start)
  }

  function keyOf(rootId: string): string | undefined {
    if (screen.value.rootId === rootId) return screen.value.key
    return overlays.value.find((overlay) => overlay.frameId === rootId)?.key
  }

  function shownKeys(): string[] {
    return [screen.value.key, ...overlays.value.map((overlay) => overlay.key)]
  }

  function rootOfKey(key: string): string | undefined {
    return key === screen.value.key
      ? screen.value.rootId
      : overlays.value.find((overlay) => overlay.key === key)?.frameId
  }

  /** The shown frames, each with the graph and paths of its presented layers. */
  function shownFrameViews(): ShownFrame[] {
    return shownKeys().flatMap((key) => {
      const instance = instances.get(key)
      const rootId = rootOfKey(key)
      return instance && rootId
        ? [
            {
              rootId,
              graph: instance.graph(),
              pathOf: instance.pathOf,
              elementOf: instance.elementOf
            }
          ]
        : []
    })
  }

  return {
    present,
    screen,
    leaving,
    overlays,
    instances,
    hosts,
    register,
    show,
    restart,
    keyOf,
    shownKeys,
    rootOfKey,
    shownFrameViews
  }
}

export type PresentScreens = ReturnType<typeof usePresentScreens>
