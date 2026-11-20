import { afterEach, describe, expect, test } from 'bun:test'
import {
  chmodSync,
  closeSync,
  lstatSync,
  mkdtempSync,
  openSync,
  readdirSync,
  readFileSync,
  readSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { writeFileAtomically } from '../src/handlers/atomic-write'

const folders: string[] = []
const encode = (text: string) => new TextEncoder().encode(text)

function folder(): string {
  const path = mkdtempSync(join(tmpdir(), 'kalka-write-'))
  folders.push(path)
  return path
}

afterEach(() => {
  for (const path of folders.splice(0)) rmSync(path, { recursive: true, force: true })
})

describe('saving a document file', () => {
  test('replaces the file whole, so a reader of the old one never sees it half written', async () => {
    const dir = folder()
    const file = join(dir, 'poster.fig')
    writeFileSync(file, 'the saved document')
    const reader = openSync(file, 'r')
    try {
      await writeFileAtomically(file, encode('the new one'))
      const buffer = Buffer.alloc(64)
      const read = readSync(reader, buffer, 0, buffer.length, 0)
      expect(buffer.subarray(0, read).toString()).toBe('the saved document')
    } finally {
      closeSync(reader)
    }
    expect(readFileSync(file, 'utf8')).toBe('the new one')
    expect(readdirSync(dir)).toEqual(['poster.fig'])
  })

  test('creates a file that does not exist yet', async () => {
    const dir = folder()
    const file = join(dir, 'new.fig')
    await writeFileAtomically(file, encode('first'))
    expect(readFileSync(file, 'utf8')).toBe('first')
  })

  test('keeps the file permissions and a symbolic link to it', async () => {
    const dir = folder()
    const file = join(dir, 'poster.fig')
    const link = join(dir, 'link.fig')
    writeFileSync(file, 'one')
    chmodSync(file, 0o600)
    symlinkSync(file, link)
    await writeFileAtomically(link, encode('two'))
    expect(lstatSync(link).isSymbolicLink()).toBe(true)
    expect(readFileSync(file, 'utf8')).toBe('two')
    expect(statSync(file).mode & 0o777).toBe(0o600)
  })

  test('leaves the file as it was and no stray file when the write fails', async () => {
    const dir = folder()
    const file = join(dir, 'poster.fig')
    writeFileSync(file, 'the saved document')
    chmodSync(dir, 0o500)
    try {
      await expect(writeFileAtomically(file, encode('lost'))).rejects.toThrow()
    } finally {
      chmodSync(dir, 0o700)
    }
    expect(readFileSync(file, 'utf8')).toBe('the saved document')
    expect(readdirSync(dir)).toEqual(['poster.fig'])
  })
})
