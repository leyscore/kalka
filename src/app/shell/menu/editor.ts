import { watch } from 'vue'

import { useEditorCommands } from '@kalka/vue'
import type { EditorCommandId } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'
import { openFind } from '@/app/editor/find/state'
import { clearRecentFiles, forgetRecentFile, recentLocalFileAt } from '@/app/recent-files'
import { appPreferences } from '@/app/settings/preferences/store'
import { useEditorWindows } from '@/app/shell/editor-windows/list'
import { moveActiveTabToNewWindow } from '@/app/shell/editor-windows/move'
import { openShortcutsHelp } from '@/app/shell/keyboard/help'
import { changedChecks, menuChecks } from '@/app/shell/menu/checked'
import { createSharedEditorMenuActions } from '@/app/shell/menu/editor-actions'
import {
  importClaudeDesignDialog,
  openFileDialog,
  openFileFromPath,
  openFolderDialog,
  saveAsFolderDialog
} from '@/app/shell/menu/files'
import { useNativeMenuEvents } from '@/app/shell/menu/native-events'
import { OPEN_RECENT_EVENT_PREFIX, watchRecentFilesMenu } from '@/app/shell/menu/recent-files'
import { APP_MENU_SCHEMA, type AppMenuEntry } from '@/app/shell/menu/schema'
import { createSelectionMenuActions } from '@/app/shell/menu/selection-actions'
import { SHELL_MENU_IDS } from '@/app/shell/menu/shell'
import { useAppTheme } from '@/app/shell/theme'
import { saveDocumentToStorage } from '@/app/storage/workspace/save'
import { createTab, closeTab, activeTab } from '@/app/tabs'
import { isTauri } from '@/app/tauri/env'

function commandMenuIds(entries: readonly AppMenuEntry[]): EditorCommandId[] {
  return entries.flatMap((entry) => {
    if (entry.type === 'separator') return []
    return [...(entry.command ? [entry.command] : []), ...commandMenuIds(entry.sub ?? [])]
  })
}

const store = useEditorStore()

/**
 * Keeps the native menu's check items showing what they control. The native menu starts them
 * all checked and flips one when clicked, so unsynced items such as Autosave showed the
 * opposite of their state.
 */
export function watchNativeMenuChecks(read: () => Record<string, boolean>): void {
  watch(
    read,
    (next, shown) => {
      for (const [id, checked] of changedChecks(next, shown)) {
        void import('@tauri-apps/api/core')
          .then(({ invoke }) => invoke('set_native_menu_checked', { id, checked }))
          // An item the native menu leaves out, such as a development one, has nothing to show.
          .catch(() => undefined)
      }
    },
    { immediate: true, deep: true }
  )
}
const COMMAND_MENU_IDS = new Set<EditorCommandId>(
  APP_MENU_SCHEMA.flatMap((group) => commandMenuIds(group.items))
)

export function useEditorMenu() {
  if (!isTauri()) return

  watchRecentFilesMenu()
  useEditorWindows()

  const { theme, setTheme } = useAppTheme()
  watchNativeMenuChecks(() =>
    menuChecks({
      state: store.state,
      theme: theme.value,
      designIssuesOnCanvas: appPreferences.value.designCheck.showOnCanvas,
      profilerVisible: store.renderer?.profiler.hudVisible ?? false
    })
  )
  const { runCommand } = useEditorCommands()

  const actions: Partial<Record<string, () => void>> = {
    new: () => createTab(),
    open: () => void openFileDialog(),
    'open-folder': () => void openFolderDialog(),
    'import-claude-design': () => void importClaudeDesignDialog(),
    'save-as-folder': () => void saveAsFolderDialog(store),
    close: () => {
      if (activeTab.value) void closeTab(activeTab.value.id)
    },
    save: () => void store.saveFigFile(),
    'save-as': () => void store.saveFigFileAs(),
    'save-to-storage': () => void saveDocumentToStorage(store),
    'export-selection': () => {
      if (store.state.selectedIds.size > 0) void store.exportSelection(1, 'png')
    },
    'export-png': () => {
      if (store.state.selectedIds.size > 0) void store.exportSelection(1, 'png')
    },
    'export-svg': () => {
      if (store.state.selectedIds.size > 0) void store.exportSelection(1, 'svg')
    },
    'export-pptx': () => {
      if (store.state.selectedIds.size > 0) void store.exportSelection(1, 'pptx')
    },
    'export-fig': () => {
      if (store.state.selectedIds.size > 0) void store.exportSelection(1, 'fig')
    },
    autosave: () => {
      store.state.autosaveEnabled = !store.state.autosaveEnabled
    },
    find: openFind,
    'keyboard-shortcuts': openShortcutsHelp,
    'move-tab-to-new-window': moveActiveTabToNewWindow,
    ...createSelectionMenuActions(store),
    ...createSharedEditorMenuActions(setTheme)
  }

  useNativeMenuEvents((id) => {
    if (id === 'clear-recent-files') {
      void clearRecentFiles()
      return
    }
    if (id.startsWith(OPEN_RECENT_EVENT_PREFIX)) {
      const index = Number(id.slice(OPEN_RECENT_EVENT_PREFIX.length))
      const path = Number.isInteger(index) ? recentLocalFileAt(index) : null
      if (path) {
        void openFileFromPath(path).catch((error) => {
          forgetRecentFile(path)
          console.warn('[Recent files] Failed to open file', error)
        })
      }
      return
    }
    if (SHELL_MENU_IDS.has(id)) return
    if (COMMAND_MENU_IDS.has(id as EditorCommandId)) {
      runCommand(id as EditorCommandId)
      return
    }
    actions[id]?.()
  })
}
