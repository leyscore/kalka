import { computed, ref } from 'vue'

import { appRuntimeConfig } from '@/app/runtime/config'
import { appPreferences, updateOnboarding } from '@/app/settings/preferences/store'
import type { RailPanel } from '@/app/shell/left-panel/use'

/**
 * One stop of the editor tour, anchored to the element with this `data-test-id`. The tour goes
 * from what a designer already knows to what is new here: the tools, then layers as elements, the
 * live code, screens, the agent, the folder and its history.
 */
export interface TourStop {
  id: 'Toolbar' | 'Layers' | 'Code' | 'Screens' | 'AI' | 'Folder' | 'History'
  anchor: string
  side: 'top' | 'right' | 'bottom' | 'left'
  /** The left panel the stop shows, if it needs one open. */
  panel?: RailPanel
}

export const TOUR_STOPS: readonly TourStop[] = [
  { id: 'Toolbar', anchor: 'toolbar', side: 'top', panel: 'file' },
  { id: 'Layers', anchor: 'layers-tree', side: 'right', panel: 'file' },
  { id: 'Code', anchor: 'properties-tab-code', side: 'right', panel: 'code' },
  { id: 'Screens', anchor: 'canvas-breakpoints', side: 'bottom', panel: 'file' },
  { id: 'AI', anchor: 'properties-tab-ai', side: 'right', panel: 'ai' },
  { id: 'Folder', anchor: 'left-panel-folder-tab', side: 'right', panel: 'folder' },
  { id: 'History', anchor: 'left-panel-history-tab', side: 'right', panel: 'history' }
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

/**
 * The first document someone opens after the welcome gets the tour, once; not in test mode
 * (`?test`), where a person or an agent plays the editor from a known state.
 */
export function offerTourOnFirstDocument(): void {
  if (appRuntimeConfig.test) return
  if (appPreferences.value.onboarding.tour === 'done' || tourIndex.value !== null) return
  startTour()
}

/** The element a stop points at, when it is on screen. */
export function tourAnchor(stop: TourStop): HTMLElement | null {
  const element = document.querySelector<HTMLElement>(`[data-test-id="${stop.anchor}"]`)
  return element && element.getClientRects().length > 0 ? element : null
}
