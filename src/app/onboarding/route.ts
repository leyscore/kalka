import { watch, type WatchStopHandle } from 'vue'
import type { Router } from 'vue-router'

import { closeWelcome, openWelcome, setWelcomeAside as setAside, welcomeOpen } from './welcome'

export const WELCOME_PATH = '/welcome'

/** Whether a path is the welcome's, with or without a trailing slash. */
export function isWelcomePath(path: string): boolean {
  return path.replace(/\/+$/, '') === WELCOME_PATH
}

/** Settings opened over the welcome, as a server link does: the welcome waits, it is not done. */
function isSettingsPath(path: string): boolean {
  return /^\/settings(\/|$)/.test(path)
}

/**
 * The welcome has an address: opening it pushes `/welcome` and leaving it goes back to where it
 * opened, so a reload or a link brings it back and Back leaves it like Skip.
 */
export function syncWelcomeRoute(router: Router): WatchStopHandle {
  let pushed = false
  const stopState = watch(welcomeOpen, (open) => {
    const route = router.currentRoute.value
    const onWelcome = isWelcomePath(route.path)
    if (open && !onWelcome) {
      pushed = true
      void router.push({ path: WELCOME_PATH, query: route.query })
    } else if (!open && onWelcome) {
      if (pushed) router.back()
      else void router.replace({ path: '/', query: route.query })
      pushed = false
    }
  })
  const stopRoute = watch(
    () => router.currentRoute.value.path,
    (path) => {
      if (isWelcomePath(path)) {
        if (!welcomeOpen.value) openWelcome()
      } else if (welcomeOpen.value) {
        pushed = false
        if (isSettingsPath(path)) setAside()
        else closeWelcome()
      }
    },
    { immediate: true }
  )
  return () => {
    stopState()
    stopRoute()
  }
}
