import { watchDebounced } from '@vueuse/core'
import type { WatchHandle } from 'vue'

import type { EditorState } from '@open-pencil/core/editor'

import { getRecoveryStore } from '@/app/document/recovery/store'
import type { RecoveryStore } from '@/app/document/recovery/types'
import { createCanvasId } from '@/app/storage/id'

type RecoveryState = EditorState & { documentName: string }

interface DocumentRecoveryOptions {
  state: RecoveryState
  buildFigFile: () => Promise<Uint8Array> | Uint8Array
  hasWritableSource: () => boolean
  store?: RecoveryStore
  recoveryId?: string
}

export interface DocumentRecoveryController {
  getRecoveryId(): string
  adoptRecoverySnapshot(id: string, sceneVersion: number): void
  persistNow(): Promise<void>
  markProtectedVersion(version: number): Promise<void>
  discardRecovery(): Promise<void>
  disposeRecovery(): void
}

export function createDocumentRecovery({
  state,
  buildFigFile,
  hasWritableSource,
  store = getRecoveryStore(),
  recoveryId = createCanvasId()
}: DocumentRecoveryOptions): DocumentRecoveryController {
  let id = recoveryId
  let protectedVersion = state.sceneVersion
  let requestedVersion = protectedVersion
  let lifecycleGeneration = 0
  let writing: Promise<void> | null = null
  let disposed = false

  async function runWrites(generation: number): Promise<void> {
    if (disposed || generation !== lifecycleGeneration) return
    if (hasWritableSource() || requestedVersion === protectedVersion) return
    const version = requestedVersion
    const bytes = await buildFigFile()
    if (generation !== lifecycleGeneration || hasWritableSource()) return
    await store.write({
      id,
      documentName: state.documentName,
      sceneVersion: version,
      figBytes: bytes
    })
    if (generation !== lifecycleGeneration) return
    protectedVersion = version
    if (requestedVersion !== version) await runWrites(generation)
  }

  async function persistNow(): Promise<void> {
    if (disposed || hasWritableSource()) return
    requestedVersion = state.sceneVersion
    if (requestedVersion === protectedVersion) return
    if (!writing) {
      const generation = lifecycleGeneration
      writing = runWrites(generation)
        .catch((error) => console.warn('[Recovery] Snapshot failed:', error))
        .finally(() => {
          writing = null
        })
    }
    await writing
  }

  const stop: WatchHandle = watchDebounced(
    () => state.sceneVersion,
    () => {
      void persistNow()
    },
    { debounce: 3000, maxWait: 10000 }
  )

  return {
    getRecoveryId: () => id,
    adoptRecoverySnapshot(nextId, sceneVersion) {
      lifecycleGeneration++
      id = nextId
      protectedVersion = sceneVersion
      requestedVersion = sceneVersion
      disposed = false
    },
    persistNow,
    async markProtectedVersion(version) {
      lifecycleGeneration++
      protectedVersion = version
      requestedVersion = version
      await store.remove(id)
    },
    async discardRecovery() {
      lifecycleGeneration++
      protectedVersion = state.sceneVersion
      requestedVersion = state.sceneVersion
      await store.remove(id)
    },
    disposeRecovery() {
      disposed = true
      lifecycleGeneration++
      stop()
    }
  }
}
