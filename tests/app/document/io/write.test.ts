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

  test('never writes an older state over a newer one a save that finished first wrote', async () => {
    const writes: number[] = []
    await mockTauriIPC((cmd, args) => {
      if (cmd === 'plugin:fs|write_file') writes.push(new Uint8Array(args as ArrayBuffer)[0])
      return null
    })
    let savedVersion = 0
    const write = createDocumentWriter({
      state: { documentName: 'Poster' },
      getFilePath: () => '/documents/poster.fig',
      getFileHandle: () => null,
      getStorageBinding: () => null,
      setSavedVersion: (version) => {
        savedVersion = version
      },
      setLastWriteTime: () => undefined
    })

    // A manual save of version 7 ends before an autosave of version 5 built earlier.
    await write(new Uint8Array([7]), 7)
    await write(new Uint8Array([5]), 5)
    expect(writes).toEqual([7])
    expect(savedVersion).toBe(7)
  })

  test('writes a new place whatever was saved elsewhere', async () => {
    const writes: string[] = []
    await mockTauriIPC((cmd, _args, options) => {
      const headers: unknown =
        typeof options === 'object' && options !== null ? Reflect.get(options, 'headers') : null
      const path: unknown =
        typeof headers === 'object' && headers !== null ? Reflect.get(headers, 'path') : null
      if (cmd === 'plugin:fs|write_file') writes.push(decodeURIComponent(String(path)))
      return null
    })
    let path = '/documents/poster.fig'
    const write = createDocumentWriter({
      state: { documentName: 'Poster' },
      getFilePath: () => path,
      getFileHandle: () => null,
      getStorageBinding: () => null,
      setSavedVersion: () => undefined,
      setLastWriteTime: () => undefined
    })

    await write(new Uint8Array([8]), 8)
    // Save As built version 7 before the autosave of version 8 ended.
    path = '/documents/copy.fig'
    await write(new Uint8Array([7]), 7)
    expect(writes).toEqual(['/documents/poster.fig', '/documents/copy.fig'])
  })
})
