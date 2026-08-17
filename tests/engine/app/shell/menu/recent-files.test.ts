import { afterEach, describe, expect, test } from 'bun:test'

import {
  clearRecentFiles,
  forgetRecentFile,
  recentFileAt,
  recentFilePaths,
  recentFiles,
  rememberRecentFile
} from '@/app/shell/menu/recent-files'

afterEach(() => clearRecentFiles())

describe('recent files', () => {
  test('keeps the latest file first without duplicates', () => {
    recentFilePaths.value = []

    rememberRecentFile('/tmp/first.fig')
    rememberRecentFile('/tmp/second.fig')
    rememberRecentFile('/tmp/first.fig')

    expect(recentFilePaths.value).toEqual(['/tmp/first.fig', '/tmp/second.fig'])
    expect(recentFiles.value.map(({ id, name }) => ({ id, name }))).toEqual([
      { id: '/tmp/first.fig', name: 'first.fig' },
      { id: '/tmp/second.fig', name: 'second.fig' }
    ])
    expect(recentFileAt(0)).toBe('/tmp/first.fig')
  })

  test('forgets missing files and clears the list', () => {
    recentFilePaths.value = ['/tmp/first.fig', '/tmp/second.fig']

    forgetRecentFile('/tmp/first.fig')
    expect(recentFilePaths.value).toEqual(['/tmp/second.fig'])

    clearRecentFiles()
    expect(recentFilePaths.value).toEqual([])
    expect(recentFileAt(0)).toBeNull()
  })
})
