import { afterEach, describe, expect, test } from 'bun:test'
import { mkdtempSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'

import { watchFileChanges, type FileChange } from '../src/handlers/file-watch'

const folders: string[] = []
const stops: (() => void)[] = []

function folder(): string {
  const path = mkdtempSync(join(tmpdir(), 'kalka-fs-'))
  folders.push(path)
  return path
}

/**
 * Watches the file once the watch has settled: macOS reports the file's creation, from before
 * the watch began, a moment after it starts.
 */
async function watchFile(file: string): Promise<FileChange[]> {
  const events: FileChange[] = []
  stops.push(watchFileChanges(file, 50, (change) => events.push(change)))
  await sleep(400)
  events.length = 0
  return events
}

async function until(condition: () => boolean, timeoutMs = 3000): Promise<void> {
  const start = Date.now()
  while (!condition()) {
    if (Date.now() - start > timeoutMs) throw new Error('Timed out')
    await sleep(20)
  }
}

afterEach(() => {
  for (const stop of stops.splice(0)) stop()
  for (const path of folders.splice(0)) rmSync(path, { recursive: true, force: true })
})

describe('watching a document file', () => {
  test('keeps reporting changes after the file is replaced, as git and editors replace it', async () => {
    const dir = folder()
    const file = join(dir, 'poster.fig')
    writeFileSync(file, 'one')
    const events = await watchFile(file)

    for (const text of ['two', 'three']) {
      const before = events.length
      const replacement = join(dir, `.poster-${text}`)
      writeFileSync(replacement, text)
      renameSync(replacement, file)
      await until(() => events.length > before)
      expect(events.at(-1)).toBe('modify')
    }
  })

  test('reports a change to the file, and nothing for its neighbours', async () => {
    const dir = folder()
    const file = join(dir, 'poster.fig')
    writeFileSync(file, 'one')
    const events = await watchFile(file)

    writeFileSync(join(dir, 'notes.txt'), 'other')
    await sleep(300)
    expect(events).toHaveLength(0)

    writeFileSync(file, 'two')
    await until(() => events.length > 0)
    expect(events.at(-1)).toBe('modify')
  })

  test('reports the file removed when it is gone', async () => {
    const dir = folder()
    const file = join(dir, 'poster.fig')
    writeFileSync(file, 'one')
    const events = await watchFile(file)

    rmSync(file)
    await until(() => events.length > 0)
    expect(events.at(-1)).toBe('remove')
  })
})
