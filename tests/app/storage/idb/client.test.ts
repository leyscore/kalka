import 'fake-indexeddb/auto'
import { expect, test } from 'bun:test'

import type { DBSchema } from 'idb'

import { connectAppDatabase, defineAppDatabase } from '@/app/storage/idb'

interface NotesDatabase extends DBSchema {
  notes: { key: string; value: string }
}

function notesDatabase(name: string) {
  return defineAppDatabase<NotesDatabase>({
    name,
    version: 1,
    callbacks: {
      upgrade(database) {
        database.createObjectStore('notes')
      }
    }
  })
}

test('the same connection serves every use while it is open', async () => {
  const database = connectAppDatabase(notesDatabase('reuse'))
  expect(await database.open()).toBe(await database.open())
})

test('a connection the browser closed is replaced on the next use', async () => {
  const database = connectAppDatabase(notesDatabase('reconnect'))
  const first = await database.open()
  await first.put('notes', 'kept', 'a')
  // As WebKit does when it suspends a page: the page is not told, every transaction is refused.
  first.close()
  expect(() => first.transaction('notes')).toThrow(
    expect.objectContaining({ name: 'InvalidStateError' })
  )

  const second = await database.open()
  expect(second).not.toBe(first)
  expect(await second.get('notes', 'a')).toBe('kept')
  await second.put('notes', 'written', 'b')
  expect(await second.get('notes', 'b')).toBe('written')
})
