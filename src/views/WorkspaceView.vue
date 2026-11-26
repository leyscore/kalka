<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { until, useEventListener } from '@vueuse/core'
import { omit } from 'es-toolkit'
import { defineAsyncComponent, onMounted, onUnmounted, provide, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useI18n } from '@kalka/vue'

import { exposeAutomationTestRequests } from '@/app/automation/bridge/test-hooks'
import { scheduleMCPRuntime, stopMCPRuntime } from '@/app/automation/mcp/runtime'
import { startWebMCP } from '@/app/automation/webmcp/runtime'
import { exposeCollaborationActions } from '@/app/browser-bridge'
import { useJoinRoom } from '@/app/collab/join'
import { bindDesktopRoomLinks } from '@/app/collab/room/links'
import { serverAccount, type ServerAccountSummary } from '@/app/collab/server/account'
import { normalizeServerURL } from '@/app/collab/server/api'
import { joinKalkaCloud } from '@/app/collab/server/cloud'
import {
  openServerDocument,
  openServerDocumentById,
  shareToServer
} from '@/app/collab/server/documents'
import { launchFromServerLink } from '@/app/collab/server/launch'
import {
  bindDesktopServerLinks,
  offerLinkedServer,
  takeWebServerLink
} from '@/app/collab/server/links'
import { COLLAB_KEY, useCollab } from '@/app/collab/use'
import { openDemoDocument } from '@/app/demo/document'
import type { PendingOpenFile } from '@/app/document/io/pending-open'
import { openPendingFiles } from '@/app/document/io/pending-open'
import { openWebLinkFromLocation, withoutWebLinkParams } from '@/app/document/io/web-link'
import { focusNodesByName } from '@/app/editor/selection/focus'
import { filesListFromPath } from '@/app/home/files-route'
import { homeFilesTab } from '@/app/home/files-tab'
import { fillNewDocument } from '@/app/home/start'
import { notificationMessages } from '@/app/i18n/notifications'
import { isWelcomePath } from '@/app/onboarding/route'
import { offerWelcomeOnFirstRun } from '@/app/onboarding/welcome'
import { appRuntimeConfig } from '@/app/runtime/config'
import { createDeferred } from '@/app/runtime/deferred'
import { openSettings } from '@/app/settings/open'
import { settingsSectionFromPath } from '@/app/settings/route'
import { focusNodeWhenReady, syncAddressWithTabs } from '@/app/shell/address/sync'
import { useDocumentDrop } from '@/app/shell/document-drop'
import { useDocumentHandoff } from '@/app/shell/document-handoff'
import { useKeyboard } from '@/app/shell/keyboard/use'
import { useEditorMenu } from '@/app/shell/menu/use'
import { holdBootSplash } from '@/app/shell/support/splash'
import { toast } from '@/app/shell/ui'
import {
  activeTab,
  closeTab,
  createDocumentInCurrentTab,
  createHomeTab,
  createTab,
  getActiveStore,
  getTabsSnapshot,
  tabCount,
  type Tab
} from '@/app/tabs'
import { tabsInTopBar } from '@/app/tabs/placement'
import { isTauri } from '@/app/tauri/env'
import { teamPageFromPath } from '@/app/team/route'
import AboutDialog from '@/components/about/AboutDialog.vue'
import CommandPalette from '@/components/commands/CommandPalette.vue'
import HomeWorkspace from '@/components/home/HomeWorkspace.vue'
import KeyboardShortcutsDialog from '@/components/keyboard-shortcuts/KeyboardShortcutsDialog.vue'
import RenameSelectionDialog from '@/components/selection/RenameSelectionDialog.vue'
import AppBanners from '@/components/shell/AppBanners.vue'
import TabBar from '@/components/TabBar.vue'
import TextLinkDialog from '@/components/text/TextLinkDialog.vue'
import { AppConfirmationDialog } from '@/components/ui/dialog'
import OffsetPathDialog from '@/components/vector/OffsetPathDialog.vue'
import { IS_BROWSER, IS_TAURI } from '@/constants'

// The editor's code loads apart from the home screen's, so the home screen shows sooner; it is
// fetched once the app is idle, before a document is likely to open.
const loadEditorWorkspace = () => import('@/components/editor/EditorWorkspace.vue')
const EditorWorkspace = defineAsyncComponent(loadEditorWorkspace)
const EditorTour = defineAsyncComponent(() => import('@/components/onboarding/EditorTour.vue'))

const route = useRoute()
const router = useRouter()
const createdInitialTab = tabCount() === 0
/** Home, and Settings and the welcome, which open over Home, start the workspace the same way. */
const opensHome =
  route.path === '/' ||
  isWelcomePath(route.path) ||
  filesListFromPath(route.path) !== null ||
  teamPageFromPath(route.path) !== null ||
  settingsSectionFromPath(route.path) !== null
/** Kalka Cloud serves the app at the address of the server it signed in to: Home comes first. */
function servedByOwnServer(): boolean {
  const account = serverAccount.value
  return IS_BROWSER && account !== null && new URL(account.url).origin === window.location.origin
}
const shouldCreateHome =
  opensHome &&
  !appRuntimeConfig.test &&
  !route.meta.demo &&
  // The web editor starts on a document, except when the address names one of Home's lists.
  (isTauri() ||
    appRuntimeConfig.recentFiles ||
    filesListFromPath(route.path) !== null ||
    teamPageFromPath(route.path) !== null ||
    servedByOwnServer())
const { collaboration } = useI18n()

/** A launch link that would sign in as someone else waits here for the person to say yes. */
const accountSwitch = ref<{
  current: ServerAccountSummary
  next: ServerAccountSummary
  answer: (agreed: boolean) => void
} | null>(null)
const accountSwitchOpen = ref(false)
function confirmAccountSwitch(current: ServerAccountSummary, next: ServerAccountSummary) {
  const answer = createDeferred<boolean>()
  accountSwitch.value = { current, next, answer: answer.resolve }
  accountSwitchOpen.value = true
  return answer.promise
}
watch(accountSwitchOpen, (open) => {
  const pending = accountSwitch.value
  if (open || !pending) return
  // Closing without the confirm button keeps the account; a confirm in the same click wins.
  setTimeout(() => pending.answer(false), 0)
  accountSwitch.value = null
})
const joinRoomFromInput = useJoinRoom()

/** Shown in the tab until the server document brings its own name. */
function nameFromSlug(slug: string): string {
  const words = slug.replaceAll('-', ' ').trim()
  return words ? words[0].toLocaleUpperCase() + words.slice(1) : collaboration.value.sharedFile
}

/** A server document's address opens it, and `?node-id=` shows that layer once it arrives. */
function openDesignAddress(id: string, slug: string, node: string | null) {
  // A link names its server (`?server=`), so someone not signed in knows where to sign in.
  const linked =
    typeof route.query.server === 'string' ? normalizeServerURL(route.query.server) : null
  const session = openServerDocumentById(id, nameFromSlug(slug), linked)
  if (session && node) focusNodeWhenReady(session, node)
  return session
}

/** A share link opens its room in a tab of its own, so nothing editable shows before it. */
function openFirstTab(): Tab {
  const designId = typeof route.params.id === 'string' ? route.params.id : null
  if (designId) {
    const slug = typeof route.params.slug === 'string' ? route.params.slug : ''
    const node = typeof route.query['node-id'] === 'string' ? route.query['node-id'] : null
    if (openDesignAddress(designId, slug, node) && activeTab.value) return activeTab.value
  }
  const roomId = typeof route.params.roomId === 'string' ? route.params.roomId : null
  if (roomId) {
    if (joinRoomFromInput(roomId) && activeTab.value) return activeTab.value
    toast.error(collaboration.value.invalidRoomLink)
  }
  return shouldCreateHome ? createHomeTab() : createTab()
}

// Block-scoped so the view does not keep the first tab's store after that tab closes.
{
  const firstTab = activeTab.value ?? openFirstTab()
  if (createdInitialTab && route.meta.demo && !appRuntimeConfig.test) {
    openDemoDocument(firstTab.store, { fixture: 'fixture' in route.query }).catch(
      (error: unknown) => {
        console.error('[Demo] Could not open the demo document:', error)
        toast.error(
          notificationMessages.get().openFileFailed({
            name: 'Demo',
            error: error instanceof Error ? error.message : String(error)
          })
        )
      }
    )
  }
}

// Opened from Kalka Cloud to work on a file: the file comes first, the welcome can wait.
const launchedFromCloud = IS_BROWSER && window.location.hash.includes('kalka-server=')
// Opened on Settings, typed or from a server link, the person came for Settings: the welcome
// waits for the next launch rather than taking its place.
const opensSettings =
  settingsSectionFromPath(route.path) !== null ||
  (IS_BROWSER && new URLSearchParams(window.location.search).has('kalka-server'))
if (
  createdInitialTab &&
  opensHome &&
  !opensSettings &&
  !appRuntimeConfig.test &&
  !route.meta.demo &&
  !launchedFromCloud
) {
  offerWelcomeOnFirstRun()
}

useHead({ title: route.meta.demo ? 'Demo' : undefined })
useKeyboard()
useEditorMenu()
useDocumentDrop()
useDocumentHandoff()

const collab = useCollab()
provide(COLLAB_KEY, collab)
exposeCollaborationActions(collab, joinRoomFromInput)
exposeAutomationTestRequests()
const stopAddressSync = syncAddressWithTabs(router, {
  openDesign: (id, slug) => openDesignAddress(id, slug, null),
  openShare: (id) => joinRoomFromInput(id),
  notifyUnavailable: () => toast.error(collaboration.value.serverMissingTitle)
})

useEventListener(
  document,
  'wheel',
  (event: WheelEvent) => {
    if (event.ctrlKey || event.metaKey) event.preventDefault()
  },
  { passive: false }
)

const fileAssociationCleanup = ref<(() => void) | null>(null)
const roomLinksCleanup = ref<(() => void) | null>(null)
const serverLinksCleanup = ref<(() => void) | null>(null)

/**
 * A drain that fails wholesale — the `take_pending_open` invoke, the event binding —
 * leaves the user staring at an app that ignored their double-click or their link.
 * Per-entry failures are already toasted inside `openPendingFiles`; this is the outer
 * net, and it must be visible, not console-only.
 */
function reportOpenFailure(error: unknown): void {
  console.error('[Open With]', error)
  toast.error(
    notificationMessages.get().openQueuedFilesFailed({
      error: error instanceof Error ? error.message : String(error)
    })
  )
}

function openDocumentPaths(): string[] {
  return getTabsSnapshot()
    .map((tab) => tab.store.getSourceIdentity().path)
    .filter((path): path is string => path !== null)
}

/**
 * Drops the link params through the router, not through `history` directly: the router
 * keeps its own copy of the current URL in `history.state` and re-applies it on the next
 * navigation, which would put `file` and `node` back into the entry. Route and hash are
 * preserved, so the link works on `/`, `/share/:id` and `/demo` alike.
 */
function stripServerLaunch(): void {
  void router.replace({ path: route.path, query: route.query, hash: '' })
}

function stripWebLinkParams(): void {
  void router.replace({
    path: route.path,
    query: withoutWebLinkParams(route.query),
    hash: route.hash
  })
}

/** The action both link handlers take; see `focusNodesByName`. */
async function selectNodeByName(name: string): Promise<boolean> {
  // A search the user overtook by switching pages is not a missing layer.
  return (await focusNodesByName(getActiveStore(), name)) !== 'missing'
}

/**
 * Settles once the first screen is known: no file was waiting at launch, or the tab of the first
 * one opened, so the boot splash gives way to that document instead of flashing the home screen.
 */
const launchScreen = createDeferred<undefined>()
holdBootSplash(launchScreen.promise)

async function openPendingAssociatedFiles(): Promise<void> {
  const { invoke } = await import('@tauri-apps/api/core')
  const files = await invoke<PendingOpenFile[]>('take_pending_open')
  if (files.length === 0) launchScreen.resolve(undefined)
  else
    void until(activeTab)
      .toMatch((tab) => tab?.kind !== 'home')
      .then(() => launchScreen.resolve(undefined))
  await openPendingFiles(files, {
    openPaths: openDocumentPaths,
    selectByName: selectNodeByName,
    notify: toast.info
  })
}

// A deep link can block this drain on a modal file picker, so a second event must
// queue behind the first: overlapping drains would prompt twice for the same file.
let pendingOpenDrain: Promise<void> = Promise.resolve()

function drainPendingOpens(): Promise<void> {
  pendingOpenDrain = pendingOpenDrain
    .then(openPendingAssociatedFiles)
    .catch(reportOpenFailure)
    .finally(() => launchScreen.resolve(undefined))
  return pendingOpenDrain
}

async function bindAssociatedFileOpen(): Promise<void> {
  if (!isTauri()) {
    launchScreen.resolve(undefined)
    return
  }
  const { listen } = await import('@tauri-apps/api/event')
  fileAssociationCleanup.value = await listen('open-associated-files', () => {
    void drainPendingOpens()
  })
  await drainPendingOpens()
}

let stopWebMCP: (() => void) | undefined

onMounted(async () => {
  stopWebMCP = startWebMCP(getActiveStore)
  // The server only answers agents: it starts once the first screen is up, never before files open.
  scheduleMCPRuntime(getActiveStore)

  try {
    await bindAssociatedFileOpen()
  } catch (error) {
    reportOpenFailure(error)
  }

  try {
    roomLinksCleanup.value = await bindDesktopRoomLinks((roomId) => {
      if (!joinRoomFromInput(roomId)) toast.error(collaboration.value.invalidRoomLink)
    })
  } catch (error) {
    console.error('[Room link]', error)
  }

  const openServerSettings = () => openSettings('server')
  try {
    serverLinksCleanup.value = await bindDesktopServerLinks((url) => {
      offerLinkedServer(url, openServerSettings)
    })
  } catch (error) {
    console.error('[Server link]', error)
  }
  if (IS_BROWSER && !isTauri()) {
    const linked = takeWebServerLink()
    if (linked) {
      // The router keeps its own copy of the query: drop the link there, or it comes back.
      await router.replace({ query: omit(route.query, ['kalka-server']) })
      offerLinkedServer(linked, openServerSettings)
    }
  }

  // The browser twin of the deep link: the desktop build takes its links through the
  // deep-link plugin above, so only a real browser reads them off the address bar.
  if (IS_BROWSER && !isTauri()) {
    try {
      // Kalka Cloud's launch link: sign in to the workspace, then open or create a file.
      await launchFromServerLink(window.location.hash, window.location.origin, stripServerLaunch, {
        openDocument: (document) => void openServerDocument(document),
        confirmSwitch: confirmAccountSwitch,
        createDocument: async (start) => {
          // The blank tab the editor opened with takes the new file; otherwise a tab of its own.
          if (!createdInitialTab) createTab()
          else if (activeTab.value?.kind === 'home') createDocumentInCurrentTab()
          const store = getActiveStore()
          await shareToServer(store)
          await fillNewDocument(store, start)
        },
        started: () => {
          const progress = toast.startProgress(collaboration.value.serverLaunchOpening)
          return () => progress.dismiss()
        },
        failed: (failure, serverURL) =>
          toast.error(
            failure === 'missing'
              ? collaboration.value.serverLaunchFileGone
              : collaboration.value.serverLaunchFailed,
            {
              label: collaboration.value.serverBackToWorkspace,
              run: () => window.location.assign(serverURL)
            }
          )
      })
      // Served by Kalka Cloud: sign in to the person's workspace and show its files on Home.
      if (!launchedFromCloud) {
        const joined = await joinKalkaCloud(window.location.origin)
        if (joined.kind === 'joined') {
          homeFilesTab.value = 'server'
          // The first visit opened on a blank file before the Cloud answered: Home replaces it.
          const first = activeTab.value
          if (
            createdInitialTab &&
            tabCount() === 1 &&
            first?.kind === 'document' &&
            !first.store.hasUnsavedChanges()
          ) {
            createHomeTab()
            await closeTab(first.id, 'discard')
          }
        }
      }
      await openWebLinkFromLocation(window.location.search, stripWebLinkParams, {
        selectByName: selectNodeByName,
        notify: (message, level) => (level === 'error' ? toast.error : toast.info)(message)
      })
    } catch (error) {
      console.error('[Web link]', error)
    }
  }
})

onUnmounted(() => {
  stopAddressSync()
  stopWebMCP?.()
  void stopMCPRuntime()
  fileAssociationCleanup.value?.()
  roomLinksCleanup.value?.()
  serverLinksCleanup.value?.()
})
</script>

<template>
  <div data-test-id="editor-root" class="flex h-screen w-screen flex-col">
    <!-- In the desktop editor the top bar is the window's title bar; the banners come under it there. -->
    <AppBanners v-if="!(IS_TAURI && tabsInTopBar)" />
    <RenameSelectionDialog />
    <OffsetPathDialog />
    <TextLinkDialog />
    <CommandPalette />
    <KeyboardShortcutsDialog />
    <AboutDialog v-if="!IS_TAURI" />
    <!-- A canvas shown bare, as an embed or a capture, has no bar at all. -->
    <TabBar v-if="!tabsInTopBar && appRuntimeConfig.showChrome" />
    <HomeWorkspace v-show="activeTab?.kind === 'home'" />
    <EditorWorkspace
      v-if="activeTab && activeTab.kind !== 'home'"
      :key="activeTab.id"
      :tab="activeTab"
    />
    <EditorTour v-if="activeTab && activeTab.kind !== 'home'" />
    <AppConfirmationDialog
      v-model:open="accountSwitchOpen"
      :heading="collaboration.serverLaunchSwitchTitle"
      :description="
        accountSwitch
          ? collaboration.serverLaunchSwitchBody({
              current: `${accountSwitch.current.email} (${accountSwitch.current.serverName})`,
              next: `${accountSwitch.next.email} (${accountSwitch.next.serverName})`
            })
          : ''
      "
      :cancel-label="collaboration.serverLaunchSwitchKeep"
      :confirm-label="collaboration.serverLaunchSwitchConfirm"
      tone="warning"
      @confirm="accountSwitch?.answer(true)"
    />
  </div>
</template>
