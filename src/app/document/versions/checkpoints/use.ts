import { useDebounceFn } from '@vueuse/core'
import { computed, onScopeDispose, ref, shallowReactive, watch } from 'vue'

import { randomHex } from '@kalka/scene-graph/random'

import { chatDocumentId } from '@/app/ai/chat/history/document'
import { roomForStore } from '@/app/collab/rooms'
import { isServerRoom } from '@/app/collab/server/documents'
import { replaceDocumentContent } from '@/app/collab/server/version'
import type { EditorStore } from '@/app/editor/active-store'
import { createEditorStore } from '@/app/editor/session/create'
import { closeTab, createTab, getTabForStore, switchTab } from '@/app/tabs'

import {
  listCheckpoints,
  readCheckpoint,
  writeCheckpoint,
  type CheckpointKind,
  type CheckpointMeta
} from './store'

/**
 * Version history for a document Git does not keep, as Figma keeps one for every file: while it
 * is edited, a version every few minutes, kept on this device; versions named by hand; a preview
 * of any of them, open to view only in a tab of its own; and restoring one, which keeps what was
 * there first, so a restore is itself undone by restoring the version before it. In a live room
 * shared between devices, each device keeps the versions it saw, and a restore reaches everyone
 * in the room as one change; a server file's versions are the server's.
 */

/** How long edits rest before a version is kept, and how often one is kept at most. */
export const CHECKPOINT_IDLE_MS = 30_000
export const CHECKPOINT_INTERVAL_MS = 10 * 60 * 1000

/** A version open to look at: the document it comes from, when it was kept, and its restore. */
export interface VersionPreview {
  source: EditorStore
  createdAt: number
  /** Puts the version back into `source`, keeping what is there now under `before`. */
  restore: (before: string) => Promise<void>
}

/** Documents previewing a version, by the store of the tab that shows it. */
const previews = shallowReactive(new Map<EditorStore, VersionPreview>())

/** Bumped whenever a version is kept, so open version lists read their document's again. */
const written = ref(0)

const timeFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })

export function checkpointTime(checkpoint: Pick<CheckpointMeta, 'createdAt'>): string {
  return timeFormat.format(checkpoint.createdAt)
}

/**
 * Whether a document keeps versions on this device: not a server file, whose versions the server
 * keeps, not a preview of a version, and not one this person may only view.
 */
export function keepsCheckpoints(store: EditorStore): boolean {
  const roomId = roomForStore(store)?.roomId
  return (!roomId || !isServerRoom(roomId)) && !previews.has(store) && !store.state.viewOnly
}

/** Keeps the document as it is now. */
export async function captureCheckpoint(
  store: EditorStore,
  kind: CheckpointKind,
  label: string | null = null
): Promise<CheckpointMeta> {
  const { writeKalkaArchive } = await import('@kalka/core/io/formats/kalka')
  const bytes = await writeKalkaArchive(store.graph)
  const meta: CheckpointMeta = {
    id: randomHex(16),
    documentKey: chatDocumentId(store),
    documentName: store.state.documentName,
    createdAt: Date.now(),
    kind,
    label,
    byteLength: bytes.byteLength
  }
  await writeCheckpoint(meta, bytes)
  written.value++
  return meta
}

async function readGraph(checkpoint: CheckpointMeta) {
  const bytes = await readCheckpoint(checkpoint.id)
  if (!bytes) throw new Error('This version is no longer on this device.')
  const { readKalkaArchive } = await import('@kalka/core/io/formats/kalka')
  return readKalkaArchive(bytes)
}

/**
 * Puts a version back as one change of the document, after keeping what is there now under
 * `before`. The undo history is cleared: the version kept first is the way back.
 */
export async function restoreCheckpoint(
  store: EditorStore,
  checkpoint: CheckpointMeta,
  before: string
): Promise<void> {
  const incoming = await readGraph(checkpoint)
  await captureCheckpoint(store, 'restore', before)
  replaceDocumentContent(store.graph, incoming)
  store.refreshVariables({ variables: store.graph.variables.keys() })
  const pages = store.graph.getPages()
  const first = pages[0]
  if (first && !pages.some((page) => page.id === store.state.currentPageId))
    await store.switchPage(first.id)
  store.clearSelection()
  store.undo.clear()
  store.requestRender()
}

/** Opens a version, as read, to view only in a tab of its own, named after it. */
export function openVersionPreview(
  graph: Parameters<typeof createEditorStore>[0],
  name: string,
  entry: VersionPreview
): void {
  const preview = createEditorStore(graph)
  preview.state.documentName = name
  preview.setViewOnly(true)
  previews.set(preview, entry)
  createTab(preview)
}

/** Opens a version kept on this device to view only, in a tab of its own, named after it. */
export async function previewCheckpoint(
  store: EditorStore,
  checkpoint: CheckpointMeta,
  name: string
): Promise<void> {
  openVersionPreview(await readGraph(checkpoint), name, {
    source: store,
    createdAt: checkpoint.createdAt,
    restore: (before) => restoreCheckpoint(store, checkpoint, before)
  })
}

/** The version a tab previews, and the document it comes from; null for any other tab. */
export function previewOf(store: EditorStore) {
  return previews.get(store) ?? null
}

/** Closes a preview's tab and goes back to its document. */
export async function closePreview(preview: EditorStore): Promise<void> {
  const entry = previews.get(preview)
  const sourceTab = entry ? getTabForStore(entry.source) : undefined
  if (sourceTab) switchTab(sourceTab.id)
  const tab = getTabForStore(preview)
  previews.delete(preview)
  if (tab) await closeTab(tab.id, 'discard')
}

/** Restores the version a tab previews into its document, then closes the preview. */
export async function restorePreviewed(preview: EditorStore, before: string): Promise<void> {
  const entry = previews.get(preview)
  if (!entry) return
  await entry.restore(before)
  await closePreview(preview)
}

/**
 * Where a document's history comes from, besides Git: the server's branches for a server file,
 * versions kept on this device for a file not shared live.
 */
export function useHistorySource(store: EditorStore) {
  const serverRoomId = computed(() => {
    void store.state.sceneVersion
    const roomId = roomForStore(store)?.roomId
    return roomId && isServerRoom(roomId) ? roomId : null
  })
  const checkpoints = computed(() => {
    void store.state.sceneVersion
    return keepsCheckpoints(store)
  })
  return { serverRoomId, checkpoints }
}

/** The versions of a store's document, kept fresh as new ones are kept. */
export function useCheckpoints(store: EditorStore) {
  const list = ref<CheckpointMeta[]>([])
  const key = computed(() => {
    void store.state.documentName
    void store.state.sceneVersion
    return chatDocumentId(store)
  })
  async function refresh() {
    const current = key.value
    try {
      const next = await listCheckpoints(current)
      if (current === key.value) list.value = next
    } catch (error) {
      console.warn('[Versions] Could not read the version history', error)
      list.value = []
    }
  }
  watch([key, written], () => void refresh(), { immediate: true })
  return { list, refresh }
}

/**
 * Keeps a version once edits rest, at most every `CHECKPOINT_INTERVAL_MS`, for as long as the
 * calling component shows the document.
 */
export function useAutoCheckpoints(store: EditorStore): void {
  let lastAt = 0
  let edited = false
  const keep = useDebounceFn(async () => {
    if (!edited || !keepsCheckpoints(store)) return
    if (Date.now() - lastAt < CHECKPOINT_INTERVAL_MS) return
    edited = false
    lastAt = Date.now()
    try {
      await captureCheckpoint(store, 'auto')
    } catch (error) {
      console.warn('[Versions] Could not keep a version', error)
    }
  }, CHECKPOINT_IDLE_MS)
  // Opening a document replaces the graph; its first version comes with its first edits.
  const stopGraph = store.onEditorEvent('graph:replaced', () => {
    edited = false
    lastAt = 0
  })
  const stopEdits = watch(
    () => store.state.sceneVersion,
    () => {
      // Opening, switching pages and saving move the scene too; only an edit leaves it unsaved.
      if (!store.hasUnsavedChanges()) return
      edited = true
      void keep()
    }
  )
  onScopeDispose(() => {
    stopGraph()
    stopEdits()
  })
}
