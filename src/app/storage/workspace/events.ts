import type { StorageProviderID } from '@/app/integrations/storage/types'

export type StorageWorkspaceEvent = {
  providerId: StorageProviderID
  documentId?: string
  kind: 'changed' | 'synced'
}

type StorageWorkspaceListener = (event: StorageWorkspaceEvent) => void

const listeners = new Set<StorageWorkspaceListener>()

export function emitStorageWorkspaceEvent(event: StorageWorkspaceEvent): void {
  for (const listener of listeners) listener(event)
}

export function onStorageWorkspaceEvent(listener: StorageWorkspaceListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
