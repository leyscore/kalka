import { computed, watch, type WatchStopHandle } from 'vue'
import type { LocationQuery, Router } from 'vue-router'

import { roomById, roomForStore } from '@/app/collab/rooms'
import { isServerRoom } from '@/app/collab/server/documents'
import type { RoomSession } from '@/app/collab/session'
import { focusNodesOnTheirPage } from '@/app/editor/selection/focus'
import {
  activeTab,
  getTabById,
  getTabForStore,
  getTabsSnapshot,
  showNewTab,
  switchTab,
  type Tab
} from '@/app/tabs'

import {
  addressPath,
  parseAddressPath,
  sameDocument,
  tabAddress,
  type DocumentAddress
} from './path'

export interface AddressActions {
  /** Opens a server document by its id; null when no server is signed in to open it. */
  openDesign: (id: string, slug: string) => RoomSession | null
  /** Joins a peer-to-peer room; false when the id is not a room. */
  openShare: (id: string) => boolean
  /** The address named a document this app cannot open. */
  notifyUnavailable: () => void
}

function addressOf(tab: Tab): DocumentAddress {
  const room = roomForStore(tab.store)
  return tabAddress({
    isHome: tab.kind === 'home',
    name: tab.store.state.documentName,
    room: room ? { roomId: room.roomId, onServer: isServerRoom(room.roomId) } : null
  })
}

/** The active tab's address, or null before the first tab exists. */
export const activeAddress = computed<DocumentAddress | null>(() => {
  const tab = activeTab.value
  return tab ? addressOf(tab) : null
})

/**
 * Each history entry remembers the tab it showed, so going back to `/`, which Home and every
 * document without an address share, returns to that tab rather than to Home.
 */
const TAB_STATE_KEY = 'kalkaTab'

function rememberedTab(): Tab | undefined {
  const state: unknown = window.history.state
  if (!state || typeof state !== 'object' || !(TAB_STATE_KEY in state)) return undefined
  const tabId = state[TAB_STATE_KEY]
  return typeof tabId === 'string' ? getTabById(tabId) : undefined
}

function rememberTab(tabId: string): void {
  const state: unknown = window.history.state
  const current = state && typeof state === 'object' ? state : {}
  window.history.replaceState({ ...current, [TAB_STATE_KEY]: tabId }, '')
}

/** The query a new document's address keeps: app flags such as `test`, never another layer. */
function carriedQuery(query: LocationQuery): LocationQuery {
  const { 'node-id': _node, ...rest } = query
  return rest
}

function showHome(): void {
  const home = getTabsSnapshot().find((tab) => tab.kind === 'home')
  if (home) switchTab(home.id)
  else showNewTab()
}

function showRoom(id: string): boolean {
  const session = roomById(id)
  const tab = session ? getTabForStore(session.store) : undefined
  return tab ? switchTab(tab.id) : false
}

/**
 * Keeps the address bar and the tabs in step. Switching tabs, joining a room or renaming a
 * server document writes the address; the browser's back and forward, or a typed address,
 * switch to that document's tab or open it. A route that is not a document address, such
 * as `/demo`, is left as it is.
 */
export function syncAddressWithTabs(router: Router, actions: AddressActions): WatchStopHandle {
  // The first sync corrects the address the app opened on, such as a link it could not open,
  // without adding a history entry; later tab switches add one.
  let previousTabId: string | null = null
  const stopTabs = watch(
    () => [activeAddress.value, activeTab.value?.id] as const,
    ([address, tabId]) => {
      if (!address || !tabId) return
      const leftTabId = previousTabId
      previousTabId = tabId
      const route = router.currentRoute.value
      const path = addressPath(address)
      const current = parseAddressPath(route.path)
      const state = { [TAB_STATE_KEY]: tabId }
      if (route.path === path || (!current && address.kind === 'home')) {
        rememberTab(tabId)
        return
      }
      // The same document under a new name keeps its history entry and its query, like `node-id`.
      if (sameDocument(current, address)) {
        void router.replace({ path, query: route.query, hash: route.hash, state })
      } else if (leftTabId === null) {
        void router.replace({ path, query: carriedQuery(route.query), state })
      } else {
        rememberTab(leftTabId)
        void router.push({ path, query: carriedQuery(route.query), state })
      }
    },
    { immediate: true }
  )

  const stopRoute = watch(
    () => router.currentRoute.value.path,
    (path) => {
      const address = parseAddressPath(path)
      if (!address) return
      const remembered = rememberedTab()
      if (remembered && sameDocument(addressOf(remembered), address)) {
        if (remembered !== activeTab.value) switchTab(remembered.id)
        return
      }
      if (sameDocument(activeAddress.value, address)) return
      if (address.kind === 'home') {
        showHome()
        return
      }
      if (showRoom(address.id)) return
      const opened =
        address.kind === 'design'
          ? actions.openDesign(address.id, address.slug) !== null
          : actions.openShare(address.id)
      if (opened) return
      actions.notifyUnavailable()
      const fallback = activeAddress.value
      if (fallback) void router.replace(addressPath(fallback))
    }
  )

  return () => {
    stopTabs()
    stopRoute()
  }
}

/**
 * Selects and shows the layer an address names with `?node-id=`, once the room’s document has
 * arrived. Ids carry a colon (`3:12`); the address may write it as a dash, as Figma does.
 */
export function focusNodeWhenReady(session: RoomSession, node: string): WatchStopHandle {
  const ids = [node, node.replace('-', ':')]
  let done = false
  let cancelled = false
  const stop = watch(
    session.hasDocument,
    (ready) => {
      if (!ready || done) return
      done = true
      void session.store.canvasReady.then(() => {
        if (!cancelled) void focusNodesOnTheirPage(session.store, ids)
        return undefined
      })
    },
    { immediate: true }
  )
  return () => {
    cancelled = true
    stop()
  }
}
