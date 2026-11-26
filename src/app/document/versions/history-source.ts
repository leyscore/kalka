import { ref, watch, type Ref } from 'vue'

import type { ServerVersion } from '@/app/collab/server/api'
import {
  listServerVersions,
  readServerVersion,
  restoreServerVersion,
  saveServerVersion
} from '@/app/collab/server/versions'
import type { EditorStore } from '@/app/editor/active-store'

import type { CheckpointKind } from './checkpoints/store'
import {
  captureCheckpoint,
  openVersionPreview,
  previewCheckpoint,
  restoreCheckpoint,
  useCheckpoints
} from './checkpoints/use'

/** A version in a history list, from this device or from the server. */
export interface HistoryVersion {
  id: string
  createdAt: number
  kind: CheckpointKind
  label: string | null
  /** Who named or restored it, for versions the server keeps. */
  by: string | null
}

/** Where the version history panel reads and writes versions. */
export interface HistorySource {
  /** `device` for versions kept on this device, `server` for a server file's. */
  where: 'device' | 'server'
  list: Ref<HistoryVersion[]>
  save: (label: string) => Promise<void>
  /** Opens a version to look at, in a tab named `name`. */
  preview: (version: HistoryVersion, name: string) => Promise<void>
  restore: (version: HistoryVersion, before: string) => Promise<void>
}

/** The versions kept on this device, for a document not shared through a server. */
export function useDeviceHistory(store: EditorStore): HistorySource {
  const { list: checkpoints } = useCheckpoints(store)
  const list = ref<HistoryVersion[]>([])
  watch(
    checkpoints,
    (next) => (list.value = next.map((checkpoint) => ({ ...checkpoint, by: null }))),
    { immediate: true }
  )
  const find = (version: HistoryVersion) => {
    const checkpoint = checkpoints.value.find((candidate) => candidate.id === version.id)
    if (!checkpoint) throw new Error('This version is no longer on this device.')
    return checkpoint
  }
  return {
    where: 'device',
    list,
    save: async (label) => void (await captureCheckpoint(store, 'named', label)),
    preview: (version, name) => previewCheckpoint(store, find(version), name),
    restore: (version, before) => restoreCheckpoint(store, find(version), before)
  }
}

/** The versions a server keeps of one of its files, shared by everyone who can open it. */
export function useServerHistory(store: EditorStore, roomId: () => string): HistorySource {
  const list = ref<HistoryVersion[]>([])
  const known = new Map<string, ServerVersion>()
  async function refresh() {
    const versions = await listServerVersions(roomId())
    known.clear()
    for (const version of versions) known.set(version.id, version)
    list.value = versions
  }
  watch(roomId, () => void refresh().catch(() => (list.value = [])), { immediate: true })
  const find = (version: HistoryVersion) => {
    const found = known.get(version.id)
    if (!found) throw new Error('This version is no longer on the server.')
    return found
  }
  const restore = async (version: HistoryVersion, before: string) => {
    await restoreServerVersion(roomId(), store, find(version), before)
    await refresh()
  }
  return {
    where: 'server',
    list,
    save: async (label) => {
      await saveServerVersion(roomId(), store, label)
      await refresh()
    },
    preview: async (version, name) =>
      openVersionPreview(await readServerVersion(roomId(), find(version)), name, {
        source: store,
        createdAt: version.createdAt,
        restore: (before) => restore(version, before)
      }),
    restore
  }
}
