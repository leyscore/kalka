import { describe, expect, test } from 'bun:test'

import { requestWriteAccess } from '@/app/document/io/capability'

import { asDouble } from '#tests/helpers/doubles'

describe('writing a file opened in the browser', () => {
  test('asks the browser to write it, and says whether it may', async () => {
    const asked: string[] = []
    const handle = (answer: PermissionState) =>
      asDouble<FileSystemFileHandle>({
        requestPermission: async ({ mode }: { mode: string }) => {
          asked.push(mode)
          return answer
        }
      })
    expect(await requestWriteAccess(handle('granted'))).toBe(true)
    expect(await requestWriteAccess(handle('denied'))).toBe(false)
    expect(asked).toEqual(['readwrite', 'readwrite'])
  })

  test('takes a browser that asks nothing as allowing it', async () => {
    expect(await requestWriteAccess(asDouble<FileSystemFileHandle>({}))).toBe(true)
  })
})
