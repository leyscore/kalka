import { tryOnScopeDispose } from '@vueuse/core'
import { computed, shallowRef, watch } from 'vue'

import { filesMessages } from '@kalka/vue'

import { takeMovedTabs } from '@/app/shell/editor-windows/move'
import { allTabs, switchTab } from '@/app/tabs'
import { isTauri } from '@/app/tauri/env'

/** One document of an editor window, as the Window menu lists it. */
export interface EditorWindowDocument {
  id: string
  name: string
  active: boolean
}

export interface EditorWindowSummary {
  label: string
  /** The editor window in front, or the one last in front. */
  front: boolean
  documents: EditorWindowDocument[]
}

interface EditorWindowList {
  /** This window's label. */
  current: string | null
  windows: EditorWindowSummary[]
}

/** The desktop app's editor windows and their documents, as the main process last told. */
const windowList = shallowRef<EditorWindowList>({ current: null, windows: [] })

export const editorWindowList = computed(() => windowList.value.windows)

/** The other editor windows, to move a tab to. */
export const otherEditorWindows = computed(() =>
  windowList.value.windows.filter((window) => window.label !== windowList.value.current)
)

/** What this window reports: its designs, or the dashboard when it shows none. */
function reportedDocuments(): EditorWindowDocument[] {
  const tabs = allTabs.value
  const documents = tabs
    .filter((tab) => !tab.isHome)
    .map((tab) => ({ id: tab.id, name: tab.name, active: tab.isActive }))
  if (documents.length > 0) return documents
  const home = tabs.find((tab) => tab.isHome)
  return home ? [{ id: home.id, name: filesMessages.get().dashboard, active: true }] : []
}

/** Shows a document chosen in the Window menu: its own window comes forward (main process). */
export async function showEditorDocument(windowLabel: string, documentId: string): Promise<void> {
  if (windowLabel === windowList.value.current) {
    switchTab(documentId)
    return
  }
  const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow')
  const window = await WebviewWindow.getByLabel(windowLabel)
  await window?.unminimize()
  await window?.setFocus()
  const { emitTo } = await import('@tauri-apps/api/event')
  await emitTo(windowLabel, 'show-tab', documentId)
}

/**
 * Keeps the Window menus in step with this editor window: reports its documents to the main
 * process, follows the list it sends back, shows the tab chosen in a Window menu and opens the
 * tabs other windows move here. Desktop only.
 */
export function useEditorWindows(): void {
  if (!isTauri()) return
  const stops: (() => void)[] = []
  let disposed = false
  const keep = (stop: () => void) => {
    if (disposed) stop()
    else stops.push(stop)
  }

  stops.push(
    watch(
      () => JSON.stringify(reportedDocuments()),
      () => {
        void import('@tauri-apps/api/core')
          .then(({ invoke }) => invoke('set_window_documents', { documents: reportedDocuments() }))
          .catch((error: unknown) => console.warn('[Windows] Could not report the tabs', error))
      },
      { immediate: true }
    )
  )

  const drainMoves = () =>
    void takeMovedTabs().catch((error: unknown) =>
      console.error('[Windows] Could not open a tab moved here', error)
    )

  void (async () => {
    const { listen } = await import('@tauri-apps/api/event')
    keep(
      await listen<EditorWindowList>(
        'editor-windows',
        ({ payload }) => (windowList.value = payload)
      )
    )
    keep(await listen<string>('show-tab', ({ payload }) => switchTab(payload)))
    keep(await listen('tab-moves', drainMoves))
    const { invoke } = await import('@tauri-apps/api/core')
    windowList.value = await invoke<EditorWindowList>('editor_windows')
    drainMoves()
  })().catch((error: unknown) => console.warn('[Windows] Could not follow the windows', error))

  tryOnScopeDispose(() => {
    disposed = true
    for (const stop of stops.splice(0)) stop()
  })
}
