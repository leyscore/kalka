import { createIdbRecoveryStore } from '@/app/document/recovery/idb'
import { createMemoryRecoveryStore } from '@/app/document/recovery/memory'
import type {
  RecoverySnapshot,
  RecoverySnapshotInput,
  RecoverySnapshotMeta,
  RecoveryStore
} from '@/app/document/recovery/types'

let singleton: RecoveryStore | null = null
let memoryFallback = false

function warnMemoryFallback(error?: unknown): void {
  if (memoryFallback) return
  console.warn('[Recovery] IndexedDB unavailable; crash recovery is limited to this session', error)
  memoryFallback = true
}

function createResilientRecoveryStore(primary: RecoveryStore): RecoveryStore {
  let current = primary

  async function run<T>(operation: (store: RecoveryStore) => Promise<T>): Promise<T> {
    try {
      return await operation(current)
    } catch (error) {
      if (current !== primary) throw error
      warnMemoryFallback(error)
      current = createMemoryRecoveryStore()
      return operation(current)
    }
  }

  return {
    list: () => run((store) => store.list()),
    read: (id: string): Promise<RecoverySnapshot | null> => run((store) => store.read(id)),
    write: (input: RecoverySnapshotInput): Promise<RecoverySnapshotMeta> =>
      run((store) => store.write(input)),
    remove: (id: string): Promise<void> => run((store) => store.remove(id)),
    clear: (): Promise<void> => run((store) => store.clear())
  }
}

export function getRecoveryStore(): RecoveryStore {
  if (singleton) return singleton
  if (typeof indexedDB === 'undefined') {
    warnMemoryFallback()
    singleton = createMemoryRecoveryStore()
    return singleton
  }
  memoryFallback = false
  singleton = createResilientRecoveryStore(createIdbRecoveryStore())
  return singleton
}

export function isRecoveryStoreMemoryFallback(): boolean {
  return memoryFallback
}

export function resetRecoveryStoreForTests(store?: RecoveryStore): void {
  singleton = store ?? null
  memoryFallback = false
}
