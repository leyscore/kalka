import { exportFigFile } from '@kalka/core/io/formats/fig'
import { menuMessages } from '@kalka/vue'

import { getRecoveryStore, isRecoveryStoreMemoryFallback } from '@/app/document/recovery'
import { isRecoveryKeptElsewhere } from '@/app/document/recovery/kept-elsewhere'
import { holdLiveRecovery } from '@/app/document/recovery/live'
import { restorableFilePath } from '@/app/document/recovery/source-path'
import type { EditorStore } from '@/app/editor/session'
import { openFileFromPath } from '@/app/shell/menu/files'
import { toast } from '@/app/shell/ui'
import { createCanvasId } from '@/app/storage/id'
import { activeTab, closeTab, getTabById, restoreRecoverySnapshot } from '@/app/tabs'
import { isTauri } from '@/app/tauri/env'

/** A tab on its way to another window: its file, or a recovery snapshot holding it. */
export type TabMove = { kind: 'path'; path: string } | { kind: 'snapshot'; id: string }

/**
 * How long the moving window keeps the snapshot marked open, so neither window offers it to
 * recover before the other adopts it; a window that never does lets it be recovered after that.
 */
const SNAPSHOT_HOLD_MS = 60_000

/** The documents a window can hand over: a local file or a draft, not one a server keeps. */
type MovableDocument = Pick<
  EditorStore,
  'state' | 'getStorageBinding' | 'getDocumentFilePath' | 'hasUnsavedChanges'
>

/**
 * How a document moves, or null when it cannot: a saved file reopens from disk; a draft or
 * unsaved changes travel as a recovery snapshot, which the other window adopts. Documents a
 * server or a storage provider keeps, and unsaved Kalka folders, stay where they are.
 */
export function tabMoveKind(store: MovableDocument): TabMove['kind'] | null {
  if (store.state.preparation !== null) return null
  if (isRecoveryKeptElsewhere(store.state) || store.getStorageBinding()) return null
  const path = store.getDocumentFilePath()
  if (path && !store.hasUnsavedChanges()) return 'path'
  if (path && !restorableFilePath(path)) return null
  return isRecoveryStoreMemoryFallback() ? null : 'snapshot'
}

async function prepareMove(store: EditorStore): Promise<TabMove | null> {
  const kind = tabMoveKind(store)
  const path = store.getDocumentFilePath()
  if (kind === 'path' && path) return { kind, path }
  if (kind !== 'snapshot') return null
  const id = createCanvasId()
  const figBytes = await exportFigFile(store.graph, {
    pageId: store.state.currentPageId,
    documentName: store.state.documentName
  })
  await getRecoveryStore().write({
    id,
    documentName: store.state.documentName,
    figBytes,
    sourcePath: restorableFilePath(path)
  })
  const release = holdLiveRecovery(id)
  setTimeout(release, SNAPSHOT_HOLD_MS)
  return { kind, id }
}

/**
 * Moves a tab to the editor window `label`, or to a new window when it is null; the tab closes
 * here once the other window has it. False when the document cannot move.
 */
export async function moveTabToWindow(tabId: string, label: string | null): Promise<boolean> {
  if (!isTauri()) return false
  const tab = getTabById(tabId)
  if (tab?.kind !== 'document') return false
  const move = await prepareMove(tab.store)
  if (!move) return false
  const { invoke } = await import('@tauri-apps/api/core')
  try {
    await invoke('move_tab_to_window', { label, move })
  } catch (error) {
    if (move.kind === 'snapshot') await getRecoveryStore().remove(move.id)
    throw error
  }
  // The other window has the document now; here it closes without asking.
  await closeTab(tabId, 'discard')
  return true
}

/** Opens the tabs other windows moved here, in the order they came. */
export async function takeMovedTabs(): Promise<void> {
  const { invoke } = await import('@tauri-apps/api/core')
  const moves = await invoke<TabMove[]>('take_tab_moves')
  for (const move of moves) {
    if (move.kind === 'path') await openFileFromPath(move.path)
    else await restoreRecoverySnapshot(move.id)
  }
}

/** Moves a tab as `moveTabToWindow` does, telling the person when its document cannot move. */
export async function moveTabWithFeedback(tabId: string, label: string | null): Promise<void> {
  try {
    if (!(await moveTabToWindow(tabId, label))) toast.info(menuMessages.get().moveTabUnavailable)
  } catch (error) {
    console.error('[Windows] Could not move the tab', error)
    toast.error(menuMessages.get().moveTabFailed)
  }
}

/** Window › Move Tab to New Window. */
export function moveActiveTabToNewWindow(): void {
  const tab = activeTab.value
  if (tab?.kind === 'document') void moveTabWithFeedback(tab.id, null)
}
