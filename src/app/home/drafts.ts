import { computed } from 'vue'

import {
  getRecoveryStore,
  isRecoveryStoreMemoryFallback,
  type RecoverySnapshotMeta
} from '@/app/document/recovery'
import { isRecoveryKeptElsewhere } from '@/app/document/recovery/kept-elsewhere'
import { recoveryEnabled } from '@/app/document/recovery/preferences'
import { getTabsSnapshot, restoreRecoverySnapshot, switchTab, type Tab } from '@/app/tabs'

/**
 * A document that has never been saved anywhere, as Figma lists its drafts: open in a tab, or
 * kept by crash recovery from an earlier session.
 */
export interface DraftDocument {
  id: string
  name: string
  updatedAt: string
  /** The tab that has it open, which opening it switches to. */
  tabId?: string
  /** The recovery snapshot that keeps it, which opening it restores. */
  snapshotId?: string
}

/** Whether drafts outlive this page: recovery keeps them in this browser's storage. */
export const draftsPersist = computed(
  () => recoveryEnabled.value && !isRecoveryStoreMemoryFallback()
)

/**
 * A tab with nowhere to save it, no file, storage or server, that holds work: edits, or a draft
 * restored from recovery, which keeps its snapshot.
 */
function isDraftTab(tab: Tab, snapshotIds: ReadonlySet<string>): boolean {
  const { store } = tab
  return (
    tab.kind === 'document' &&
    !store.hasWritableSource() &&
    !isRecoveryKeptElsewhere(store.state) &&
    (store.hasUnsavedChanges() || snapshotIds.has(store.getRecoveryId()))
  )
}

async function recoverySnapshots(): Promise<RecoverySnapshotMeta[]> {
  if (!recoveryEnabled.value) return []
  try {
    return await getRecoveryStore().list()
  } catch (error) {
    console.warn('[Drafts] Failed to list recovery snapshots:', error)
    return []
  }
}

/** The drafts, the last changed first. A snapshot of a file's unsaved edits is not a draft. */
export async function listDrafts(): Promise<DraftDocument[]> {
  const snapshots = await recoverySnapshots()
  const tabs = getTabsSnapshot()
  const openRecoveryIds = new Set(tabs.map((tab) => tab.store.getRecoveryId()))
  const byId = new Map(snapshots.map((snapshot) => [snapshot.id, snapshot]))
  const snapshotIds = new Set(byId.keys())
  const now = new Date().toISOString()
  const open = tabs
    .filter((tab) => isDraftTab(tab, snapshotIds))
    .map((tab): DraftDocument => {
      const recoveryId = tab.store.getRecoveryId()
      return {
        id: `draft:${recoveryId}`,
        name: tab.store.state.documentName,
        updatedAt: byId.get(recoveryId)?.updatedAt ?? now,
        tabId: tab.id
      }
    })
  const kept = snapshots
    .filter((snapshot) => !snapshot.sourcePath && !openRecoveryIds.has(snapshot.id))
    .map((snapshot): DraftDocument => ({
      id: `draft:${snapshot.id}`,
      name: snapshot.documentName,
      updatedAt: snapshot.updatedAt,
      snapshotId: snapshot.id
    }))
  return [...open, ...kept].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

/** Shows an open draft's tab, or restores a kept one in a tab of its own. */
export async function openDraft(draft: DraftDocument): Promise<void> {
  if (draft.tabId && switchTab(draft.tabId)) return
  if (draft.snapshotId) await restoreRecoverySnapshot(draft.snapshotId)
}
