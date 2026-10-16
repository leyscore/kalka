/**
 * Moves what the app stored under its names from before it was renamed Kalka: `open-pencil:` and
 * `openpencil:` keys in localStorage and the `open-pencil-*` IndexedDB databases. Runs once at
 * start, before the app bundle reads any of them, so settings, chats and recovery snapshots carry
 * over. Kept free of app imports: `main.ts` runs it ahead of the support gate's app import.
 */

const LEGACY_KEY_PREFIXES = ['open-pencil', 'openpencil']
const LEGACY_DATABASES = [
  'chats',
  'credentials',
  'libraries',
  'cloud-local',
  'cloud-outbox',
  'recovery',
  'diagnostics'
] as const

function renamedKey(key: string): string | null {
  const prefix = LEGACY_KEY_PREFIXES.find((legacy) => key.startsWith(legacy))
  return prefix ? `kalka${key.slice(prefix.length)}` : null
}

/** localStorage keys move to their `kalka` names; a value already stored there wins. */
export function migrateLocalStorage(storage: Storage): void {
  const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index))
  for (const key of keys) {
    const target = key === null ? null : renamedKey(key)
    if (key === null || target === null) continue
    const value = storage.getItem(key)
    if (value !== null && storage.getItem(target) === null) storage.setItem(target, value)
    storage.removeItem(key)
  }
}

function request<T>(operation: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    operation.onsuccess = () => resolve(operation.result)
    operation.onerror = () => reject(operation.error ?? new Error('IndexedDB request failed'))
  })
}

function openDatabase(name: string, version?: number, upgrade?: (db: IDBDatabase) => void) {
  const opening = indexedDB.open(name, version)
  if (upgrade) opening.onupgradeneeded = () => upgrade(opening.result)
  return request(opening)
}

interface StoreCopy {
  name: string
  keyPath: string | string[] | null
  autoIncrement: boolean
  indexes: { name: string; keyPath: string | string[]; unique: boolean; multiEntry: boolean }[]
  keys: IDBValidKey[]
  values: unknown[]
}

async function readStores(db: IDBDatabase): Promise<StoreCopy[]> {
  const names = Array.from(db.objectStoreNames)
  if (names.length === 0) return []
  const transaction = db.transaction(names, 'readonly')
  return Promise.all(
    names.map(async (name) => {
      const store = transaction.objectStore(name)
      const indexes = Array.from(store.indexNames, (indexName) => {
        const index = store.index(indexName)
        return {
          name: indexName,
          keyPath: index.keyPath,
          unique: index.unique,
          multiEntry: index.multiEntry
        }
      })
      return {
        name,
        keyPath: store.keyPath,
        autoIncrement: store.autoIncrement,
        indexes,
        keys: await request(store.getAllKeys()),
        values: await request(store.getAll())
      }
    })
  )
}

/** Copies one database under its new name, then deletes the old one. */
async function moveDatabase(from: string, to: string): Promise<void> {
  const legacy = await openDatabase(from)
  const version = legacy.version
  const stores = await readStores(legacy)
  legacy.close()
  const target = await openDatabase(to, version, (db) => {
    for (const store of stores) {
      const created = db.createObjectStore(store.name, {
        keyPath: store.keyPath ?? undefined,
        autoIncrement: store.autoIncrement
      })
      for (const index of store.indexes) {
        created.createIndex(index.name, index.keyPath, {
          unique: index.unique,
          multiEntry: index.multiEntry
        })
      }
    }
  })
  if (stores.length > 0) {
    const transaction = target.transaction(
      stores.map((store) => store.name),
      'readwrite'
    )
    for (const store of stores) {
      const objectStore = transaction.objectStore(store.name)
      store.values.forEach((value, index) => {
        if (store.keyPath === null) objectStore.put(value, store.keys[index])
        else objectStore.put(value)
      })
    }
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB copy failed'))
    })
  }
  target.close()
  await request(indexedDB.deleteDatabase(from))
}

async function migrateDatabases(): Promise<void> {
  // eslint-disable-next-line compat/compat -- listing databases is optional; without it nothing moves
  if (typeof indexedDB === 'undefined' || typeof indexedDB.databases !== 'function') return
  const existing = new Set((await indexedDB.databases()).map((database) => database.name))
  for (const suffix of LEGACY_DATABASES) {
    const from = `open-pencil-${suffix}`
    const to = `kalka-${suffix}`
    if (!existing.has(from) || existing.has(to)) continue
    // A database that cannot be copied stays where it was rather than block the app.
    await moveDatabase(from, to).catch((error: unknown) => {
      console.warn(`Could not move ${from} to ${to}:`, error)
    })
  }
}

export async function migrateLegacyNames(): Promise<void> {
  try {
    if (typeof localStorage !== 'undefined') migrateLocalStorage(localStorage)
  } catch (error) {
    console.warn('Could not move settings stored under the previous app name:', error)
  }
  await migrateDatabases()
}
