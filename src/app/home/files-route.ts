import { watch, type WatchStopHandle } from 'vue'
import type { Router } from 'vue-router'

import { activeTab } from '@/app/tabs'
import { teamPageFromPath } from '@/app/team/route'

import { homeFilesRequest, homeFilesTab, type HomeFilesTab } from './files-tab'

const FILES_PATH = /^\/files\/(recent|storage|server)\/?$/

export function filesPath(list: HomeFilesTab): string {
  return `/files/${list}`
}

/** The list a path names, or null for a path outside the file lists. */
export function filesListFromPath(path: string): HomeFilesTab | null {
  const list = FILES_PATH.exec(path)?.[1]
  return list === 'recent' || list === 'storage' || list === 'server' ? list : null
}

/**
 * Each list of files on Home has an address, `/files/recent`, `/files/storage` or `/files/server`:
 * a link or a reload opens Home on that list, and choosing a list on Home writes its address.
 */
export function syncFilesRoute(router: Router): WatchStopHandle {
  // The address picks the list; which tab shows is the workspace view's and the caller's choice.
  const stopRoute = watch(
    () => router.currentRoute.value.path,
    (path) => {
      const list = filesListFromPath(path)
      if (!list) return
      homeFilesTab.value = list
      // An address that names a list while a document is in front shows it once Home is.
      if (activeTab.value?.kind !== 'home') homeFilesRequest.value = list
    },
    { immediate: true }
  )
  const stopList = watch(homeFilesTab, (list) => {
    const route = router.currentRoute.value
    // Only Home's own address follows the list; a document or a page over Home keeps its own.
    if (activeTab.value?.kind !== 'home') return
    if (route.path !== '/' && !filesListFromPath(route.path)) return
    if (route.path === filesPath(list)) return
    void router.replace({ path: filesPath(list), query: route.query })
  })
  // A document opened from a list takes the window: the list's address goes with Home.
  const stopTabs = watch(
    () => activeTab.value?.kind,
    (kind) => {
      const route = router.currentRoute.value
      if (kind === 'home') return
      if (!filesListFromPath(route.path) && !teamPageFromPath(route.path)) return
      void router.replace({ path: '/', query: route.query })
    }
  )
  // A list asked for from elsewhere shows once Home is in front at an address of its own.
  const stopRequest = watch(
    [homeFilesRequest, () => router.currentRoute.value.path, () => activeTab.value?.kind],
    ([list, path, kind]) => {
      if (!list || kind !== 'home') return
      if (path === filesPath(list)) {
        homeFilesRequest.value = null
        return
      }
      if (path !== '/' && !filesListFromPath(path)) return
      void router.replace({ path: filesPath(list), query: router.currentRoute.value.query })
    },
    { immediate: true }
  )
  return () => {
    stopRequest()
    stopRoute()
    stopList()
    stopTabs()
  }
}
