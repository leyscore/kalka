import { renderThumbnail } from '@kalka/core/io/formats/raster'
import { extractFigThumbnailFromReader } from '@kalka/fig'

import {
  getRecoveryStore,
  type RecoverySnapshot,
  type RecoverySnapshotMeta
} from '@/app/document/recovery'
import { isRecoveryKeptElsewhere } from '@/app/document/recovery/kept-elsewhere'
import { liveRecoveryIds } from '@/app/document/recovery/live'
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
  const [snapshots, live] = await Promise.all([recoverySnapshots(), liveRecoveryIds()])
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
    // A draft open in another window is that window's; opening it here would make a copy.
    .filter(
      (snapshot) =>
        !snapshot.sourcePath && !openRecoveryIds.has(snapshot.id) && !live.has(snapshot.id)
    )
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

/**
 * Deletes a draft that no tab has open: its recovery data goes, and what it held comes back as
 * the deleted snapshot, which `restoreDeletedDraft` puts back. An open draft is deleted by
 * closing its tab without saving.
 */
export async function deleteDraft(draft: DraftDocument): Promise<RecoverySnapshot | null> {
  if (!draft.snapshotId || draft.tabId) return null
  const store = getRecoveryStore()
  const snapshot = await store.read(draft.snapshotId)
  await store.remove(draft.snapshotId)
  return snapshot
}

/** Puts a deleted draft back where recovery keeps it. */
export async function restoreDeletedDraft(snapshot: RecoverySnapshot): Promise<void> {
  await getRecoveryStore().write({
    id: snapshot.id,
    documentName: snapshot.documentName,
    figBytes: snapshot.figBytes,
    sourcePath: snapshot.sourcePath
  })
}

/** A draft's preview on Home, as wide as the card: 16 by 10. */
const DRAFT_PREVIEW_WIDTH = 640
const DRAFT_PREVIEW_HEIGHT = 400

/**
 * What a draft's tab drew last, by recovery ID: a snapshot is written without a thumbnail, so a
 * draft closed in this session keeps the one its tab drew.
 */
const drawnPreviews = new Map<string, Uint8Array>()

async function drawOpenDraft(tab: Tab): Promise<Uint8Array | null> {
  const { store } = tab
  const renderer = await store.loadCanvasKit()
  if (!renderer) return null
  const bytes = renderThumbnail(
    renderer.ck,
    renderer,
    store.graph,
    store.state.currentPageId,
    DRAFT_PREVIEW_WIDTH,
    DRAFT_PREVIEW_HEIGHT
  )
  if (bytes) drawnPreviews.set(store.getRecoveryId(), bytes)
  return bytes
}

async function keptDraftPreview(snapshotId: string): Promise<Uint8Array | null> {
  const drawn = drawnPreviews.get(snapshotId)
  if (drawn) return drawn
  const snapshot = await getRecoveryStore().read(snapshotId)
  if (!snapshot) return null
  const bytes = snapshot.figBytes
  return extractFigThumbnailFromReader({
    size: bytes.byteLength,
    read: (start, end) => Promise.resolve(bytes.subarray(start, end))
  })
}

/**
 * A PNG of the draft for its card on Home: its tab's current page drawn now, or, for a draft
 * recovery keeps, the thumbnail of its snapshot. Null when there is nothing to show.
 */
export async function draftPreview(draft: DraftDocument): Promise<Uint8Array | null> {
  try {
    const tab = draft.tabId ? getTabsSnapshot().find(({ id }) => id === draft.tabId) : undefined
    if (tab) return await drawOpenDraft(tab)
    return draft.snapshotId ? await keptDraftPreview(draft.snapshotId) : null
  } catch (error) {
    console.warn('[Drafts] Could not draw a draft preview:', error)
    return null
  }
}
