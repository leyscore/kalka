import { createIdbRecoveryStore } from '@/app/document/recovery/idb'
import { createMemoryRecoveryStore } from '@/app/document/recovery/memory'
import type { RecoveryStore } from '@/app/document/recovery/types'

let singleton: RecoveryStore | null = null
let memoryFallback = false

export function getRecoveryStore(): RecoveryStore {
  if (singleton) return singleton
  if (typeof indexedDB !== 'undefined') {
    singleton = createIdbRecoveryStore()
    memoryFallback = false
  } else {
    console.warn('[Recovery] IndexedDB unavailable; crash recovery is limited to this session')
    singleton = createMemoryRecoveryStore()
    memoryFallback = true
  }
  return singleton
}

export function isRecoveryStoreMemoryFallback(): boolean {
  return memoryFallback
}

export function resetRecoveryStoreForTests(store?: RecoveryStore): void {
  singleton = store ?? null
  memoryFallback = false
}
