import { describe, expect, test } from 'bun:test'

import { filesListFromPath, filesPath } from '@/app/home/files-route'

describe('file list addresses', () => {
  test('each list has an address that reads back', () => {
    for (const list of ['recent', 'storage', 'server'] as const) {
      expect(filesListFromPath(filesPath(list))).toBe(list)
    }
  })

  test('other paths name no list', () => {
    expect(filesListFromPath('/')).toBeNull()
    expect(filesListFromPath('/files')).toBeNull()
    expect(filesListFromPath('/files/trash')).toBeNull()
    expect(filesListFromPath('/storage')).toBeNull()
  })
})
