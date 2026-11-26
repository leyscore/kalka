import type { DBSchema } from 'idb'

import {
  APP_DATABASE_NAMES,
  binaryStorage,
  connectAppDatabase,
  defineAppDatabase,
  readStoredBinary,
  type StoredBinary
} from '@/app/storage/idb'

/**
 * Versions of documents Git does not keep, on this device: the document as a Kalka archive with
 * when it was kept and why. Each document keeps its latest `MAX_PER_DOCUMENT`.
 */

export type CheckpointKind = 'auto' | 'named' | 'restore'

export interface CheckpointMeta {
  id: string
  /** The document it belongs to, as `chatDocumentId` names it. */
  documentKey: string
  documentName: string
  /** Milliseconds since the epoch. */
  createdAt: number
  kind: CheckpointKind
  /** The name given to a named version, or what a restore was about to replace. */
  label: string | null
  byteLength: number
}

export const MAX_PER_DOCUMENT = 50

interface VersionsDatabase extends DBSchema {
  meta: { key: string; value: CheckpointMeta; indexes: { byDocument: string } }
  data: { key: string; value: StoredBinary }
}

const versionsDatabase = defineAppDatabase<VersionsDatabase>({
  name: APP_DATABASE_NAMES.versions,
  version: 1,
  callbacks: {
    upgrade(database) {
      const meta = database.createObjectStore('meta', { keyPath: 'id' })
      meta.createIndex('byDocument', 'documentKey')
      database.createObjectStore('data')
    }
  }
})

const database = connectAppDatabase(versionsDatabase)

/** A document's versions, newest first. */
export async function listCheckpoints(documentKey: string): Promise<CheckpointMeta[]> {
  const rows = await (await database.open()).getAllFromIndex('meta', 'byDocument', documentKey)
  return rows.toSorted((a, b) => b.createdAt - a.createdAt)
}

export async function readCheckpoint(id: string): Promise<Uint8Array | null> {
  return readStoredBinary(await (await database.open()).get('data', id))
}

/** Keeps a version, then forgets the document's oldest beyond the limit. */
export async function writeCheckpoint(meta: CheckpointMeta, bytes: Uint8Array): Promise<void> {
  const db = await database.open()
  const storeBinary = await binaryStorage()
  const writing = db.transaction(['meta', 'data'], 'readwrite')
  await Promise.all([
    writing.objectStore('meta').put(meta),
    writing.objectStore('data').put(storeBinary(bytes), meta.id),
    writing.done
  ])
  const stale = (await listCheckpoints(meta.documentKey)).slice(MAX_PER_DOCUMENT)
  if (stale.length === 0) return
  const pruning = db.transaction(['meta', 'data'], 'readwrite')
  await Promise.all([
    ...stale.flatMap((old) => [
      pruning.objectStore('meta').delete(old.id),
      pruning.objectStore('data').delete(old.id)
    ]),
    pruning.done
  ])
}
