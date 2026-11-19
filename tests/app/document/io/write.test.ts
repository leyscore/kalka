import { afterEach, describe, expect, setSystemTime, test } from 'bun:test'

import { createDocumentWriter } from '@/app/document/io/write'

import { clearTauriMocks, mockTauriIPC } from '#tests/helpers/tauri/mocks'

afterEach(async () => {
  setSystemTime()
  await clearTauriMocks()
})

describe('writing a document to its file', () => {
  test('dates the write from when it ends, so the watch does not take a slow save for an outside change', async () => {
    const start = new Date('2026-11-19T10:00:00Z')
    const end = new Date('2026-11-19T10:00:05Z')
    setSystemTime(start)
    await mockTauriIPC((cmd) => {
      // A large document takes a while to reach the disk.
      if (cmd === 'plugin:fs|write_file') setSystemTime(end)
      return null
    })
    let lastWriteTime = 0
    const write = createDocumentWriter({
      state: { documentName: 'Poster' },
      getFilePath: () => '/documents/poster.fig',
      getFileHandle: () => null,
      getStorageBinding: () => null,
      setSavedVersion: () => undefined,
      setLastWriteTime: (time) => {
        lastWriteTime = time
      }
    })

    expect(await write(new Uint8Array([1, 2, 3]), 1)).toBe(true)
    expect(lastWriteTime).toBe(end.getTime())
  })
})
