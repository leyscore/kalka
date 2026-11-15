import { useEventListener } from '@vueuse/core'
import { computed, type MaybeRefOrGetter } from 'vue'

import { useActiveEditorStoreRef } from '@/app/editor/active-store'

import { follow, followedLabel, presenceOf } from './registry'

/**
 * Who the active document's view follows, for a canvas pane's frame and banner. Scrolling the
 * canvas away stops following; a click to select or edit a layer and zooming do not, so the
 * person can work beside the agent they watch. The frame also stops it on Escape.
 */
export function useFollowView(area: MaybeRefOrGetter<HTMLElement | null>) {
  // Presence belongs to the store object itself, not the forwarding proxy components get.
  const storeRef = useActiveEditorStoreRef()
  const label = computed(() => (storeRef.value ? followedLabel(storeRef.value) : null))

  const stop = () => {
    const store = storeRef.value
    if (store && presenceOf(store).following.value) follow(store, null)
  }

  // A pinch or a wheel with Control or Command zooms; any other wheel scrolls the view away.
  const onWheel = (event: WheelEvent) => {
    if (!event.ctrlKey && !event.metaKey) stop()
  }
  useEventListener(area, 'wheel', onWheel, { capture: true, passive: true })

  return { label, stop }
}
