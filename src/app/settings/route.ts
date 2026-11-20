import { watch, type WatchStopHandle } from 'vue'
import type { Router } from 'vue-router'

import {
  closeSettings,
  isSettingsSection,
  settingsOpen,
  settingsSection,
  type SettingsSection
} from './open'

/** Read afresh: closing may be held back by a question about unsaved edits. */
const isOpen = (): boolean => settingsOpen.value

const SETTINGS_PATH = /^\/settings(?:\/([^/]+))?\/?$/

export function settingsPath(section: SettingsSection): string {
  return `/settings/${section}`
}

/** The section a path opens, or null for a path outside Settings. */
export function settingsSectionFromPath(path: string): SettingsSection | null {
  const match = SETTINGS_PATH.exec(path)
  if (!match) return null
  const section = match[1] ?? 'general'
  return isSettingsSection(section) ? section : 'general'
}

/**
 * Settings has an address: opening it pushes `/settings/<section>`, moving between sections
 * replaces it, and closing goes back to where it was opened. Back, Forward, a reload or a typed
 * address open or close it the same way, and unsaved edits are asked about either way.
 */
export function syncSettingsRoute(router: Router): WatchStopHandle {
  /** Whether this app pushed the Settings entry, so closing can go back instead of forward. */
  let pushed = false

  const stopState = watch(
    () => [settingsOpen.value, settingsSection.value] as const,
    ([open, section]) => {
      const route = router.currentRoute.value
      const current = settingsSectionFromPath(route.path)
      if (open) {
        if (current === section) return
        if (current) {
          void router.replace({ path: settingsPath(section), query: route.query })
        } else {
          pushed = true
          void router.push({ path: settingsPath(section), query: route.query })
        }
        return
      }
      if (!current) return
      if (pushed) {
        pushed = false
        router.back()
      } else {
        void router.replace({ path: '/', query: route.query })
      }
    }
  )

  const stopRoute = watch(
    () => router.currentRoute.value.path,
    (path) => {
      const section = settingsSectionFromPath(path)
      if (section) {
        settingsSection.value = section
        settingsOpen.value = true
        return
      }
      if (!settingsOpen.value) return
      // Left by Back or a link: the entry is gone, so closing must not go back again.
      pushed = false
      closeSettings()
      // Kept open to save an edit: put the address back on the page that is still showing.
      if (isOpen()) {
        pushed = true
        void router.push({
          path: settingsPath(settingsSection.value),
          query: router.currentRoute.value.query
        })
      }
    },
    { immediate: true }
  )

  return () => {
    stopState()
    stopRoute()
  }
}
