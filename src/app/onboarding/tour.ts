import { computed, ref } from 'vue'

import { appPreferences, updateOnboarding } from '@/app/settings/preferences/store'

/** One stop of the editor tour, anchored to the element with this `data-test-id`. */
export interface TourStop {
  id: 'code' | 'layers' | 'toolbar' | 'ai'
  anchor: string
  side: 'top' | 'right' | 'bottom' | 'left'
  /** The properties panel tab the stop shows, if any. */
  panelTab?: 'design' | 'code' | 'ai'
}

export const TOUR_STOPS: readonly TourStop[] = [
  { id: 'code', anchor: 'properties-tab-code', side: 'left', panelTab: 'code' },
  { id: 'layers', anchor: 'layers-tree', side: 'right', panelTab: 'design' },
  { id: 'toolbar', anchor: 'toolbar', side: 'top' },
  { id: 'ai', anchor: 'properties-tab-ai', side: 'left', panelTab: 'ai' }
]

/** The index of the stop on show, or null while the tour is closed. */
export const tourIndex = ref<number | null>(null)
export const tourStop = computed(() =>
  tourIndex.value === null ? null : (TOUR_STOPS[tourIndex.value] ?? null)
)

export function startTour(): void {
  tourIndex.value = 0
}

export function nextTourStop(): void {
  if (tourIndex.value === null) return
  if (tourIndex.value + 1 < TOUR_STOPS.length) tourIndex.value++
  else endTour()
}

export function endTour(): void {
  tourIndex.value = null
  updateOnboarding({ tour: 'done' })
}

/** The first document someone opens after the welcome gets the tour, once. */
export function offerTourOnFirstDocument(): void {
  if (import.meta.env.MODE === 'native-test') return
  if (appPreferences.value.onboarding.tour === 'done' || tourIndex.value !== null) return
  startTour()
}

/** The element a stop points at, when it is on screen. */
export function tourAnchor(stop: TourStop): HTMLElement | null {
  const element = document.querySelector<HTMLElement>(`[data-test-id="${stop.anchor}"]`)
  return element && element.getClientRects().length > 0 ? element : null
}
