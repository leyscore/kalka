import { watch, type WatchStopHandle } from 'vue'
import type { Router } from 'vue-router'

import { closeWelcome, openWelcome, welcomeOpen } from './welcome'

export const WELCOME_PATH = '/welcome'

/**
 * The welcome has an address: opening it pushes `/welcome` and leaving it goes back to where it
 * opened, so a reload or a link brings it back and Back leaves it like Skip.
 */
export function syncWelcomeRoute(router: Router): WatchStopHandle {
  let pushed = false
  const stopState = watch(welcomeOpen, (open) => {
    const route = router.currentRoute.value
    const onWelcome = route.path === WELCOME_PATH
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
      if (path === WELCOME_PATH) {
        if (!welcomeOpen.value) openWelcome()
      } else if (welcomeOpen.value) {
        pushed = false
        closeWelcome()
      }
    },
    { immediate: true }
  )
  return () => {
    stopState()
    stopRoute()
  }
}
