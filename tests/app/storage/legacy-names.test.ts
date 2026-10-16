import 'fake-indexeddb/auto'
import { expect, test } from 'bun:test'

import { migrateLegacyNames, migrateLocalStorage } from '@/app/storage/legacy-names'

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>()
  get length() {
    return this.values.size
  }
  clear() {
    this.values.clear()
  }
  getItem(key: string) {
    return this.values.get(key) ?? null
  }
  key(index: number) {
    return [...this.values.keys()][index] ?? null
  }
  removeItem(key: string) {
    this.values.delete(key)
  }
  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

test('settings saved under the previous names move to kalka keys, newer values winning', () => {
  const storage = new MemoryStorage()
  storage.setItem('open-pencil:theme', 'light')
  storage.setItem('open-pencil:preferences:v1', '{"old":true}')
  storage.setItem('kalka:preferences:v1', '{"new":true}')
  storage.setItem('unrelated', 'kept')

  migrateLocalStorage(storage)

  expect(storage.getItem('kalka:theme')).toBe('light')
  expect(storage.getItem('kalka:preferences:v1')).toBe('{"new":true}')
  expect(storage.getItem('open-pencil:theme')).toBeNull()
  expect(storage.getItem('unrelated')).toBe('kept')
})

test('a database saved under the previous name moves with its records', async () => {
  const legacy = indexedDB.open('open-pencil-recovery', 3)
  legacy.onupgradeneeded = () => {
    const store = legacy.result.createObjectStore('snapshots', { keyPath: 'id' })
    store.createIndex('byTime', 'savedAt')
    legacy.result.createObjectStore('loose')
  }
  const db = await new Promise<IDBDatabase>((resolve) => {
    legacy.onsuccess = () => resolve(legacy.result)
  })
  const write = db.transaction(['snapshots', 'loose'], 'readwrite')
  write.objectStore('snapshots').put({ id: 'a', savedAt: 1 })
  write.objectStore('loose').put('value', 'key')
  await new Promise((resolve) => {
    write.oncomplete = resolve
  })
  db.close()

  await migrateLegacyNames()

  const names = (await indexedDB.databases()).map((database) => database.name)
  expect(names).toContain('kalka-recovery')
  expect(names).not.toContain('open-pencil-recovery')
  const moved = indexedDB.open('kalka-recovery')
  const target = await new Promise<IDBDatabase>((resolve) => {
    moved.onsuccess = () => resolve(moved.result)
  })
  expect(target.version).toBe(3)
  const read = target.transaction(['snapshots', 'loose'])
  const snapshot = read.objectStore('snapshots').index('byTime').get(1)
  const loose = read.objectStore('loose').get('key')
  await new Promise((resolve) => {
    read.oncomplete = resolve
  })
  expect(snapshot.result).toEqual({ id: 'a', savedAt: 1 })
  expect(loose.result).toBe('value')
  target.close()
})
