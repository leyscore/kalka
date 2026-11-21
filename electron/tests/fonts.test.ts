import { describe, expect, test } from 'bun:test'
import { join } from 'node:path'

import { isInstallableFont, userFontFolder } from '../src/handlers/fonts'

const TRUETYPE = [0, 1, 0, 0, ...Array.from({ length: 12 }, () => 0)]

describe('installing fonts on the computer', () => {
  test('fonts go to the folder each system reads a person’s own fonts from', () => {
    expect(userFontFolder('darwin', '/Users/ada')).toBe(join('/Users/ada', 'Library', 'Fonts'))
    expect(userFontFolder('linux', '/home/ada', {})).toBe(
      join('/home/ada', '.local', 'share', 'fonts', 'kalka')
    )
    expect(userFontFolder('win32', 'C:\\Users\\ada', { LOCALAPPDATA: 'C:\\Local' })).toBe(
      join('C:\\Local', 'Microsoft', 'Windows', 'Fonts')
    )
  })

  test('only TrueType and OpenType files under plain names are installed', () => {
    expect(isInstallableFont({ name: 'Inter-400.ttf', data: TRUETYPE })).toBe(true)
    expect(isInstallableFont({ name: '../evil.ttf', data: TRUETYPE })).toBe(false)
    expect(isInstallableFont({ name: 'Inter-400.woff2', data: TRUETYPE })).toBe(false)
    expect(
      isInstallableFont({ name: 'notes.ttf', data: [...new TextEncoder().encode('%PDF-1.7 file')] })
    ).toBe(false)
  })
})
