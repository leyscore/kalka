import { afterEach, describe, expect, test } from 'bun:test'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { handleLink, queueOpenPaths, setOpenTarget, takePendingOpen } from '../src/handlers/pending'

const folders: string[] = []
afterEach(() => {
  takePendingOpen()
  for (const folder of folders.splice(0)) rmSync(folder, { recursive: true, force: true })
})

function figFile(): string {
  const folder = mkdtempSync(join(tmpdir(), 'kalka-open-'))
  folders.push(folder)
  const file = join(folder, 'poster.fig')
  writeFileSync(file, 'fig')
  return file
}

/** An app whose editor window may be closed, as on macOS once its last window closes. */
function app(editorOpen: boolean) {
  const sent: string[] = []
  let windows = 0
  setOpenTarget({
    notify: (event) => {
      if (!editorOpen) return false
      sent.push(event)
      return true
    },
    openEditor: () => {
      windows++
    }
  })
  return { sent, windows: () => windows }
}

describe('documents handed to the app', () => {
  test('reach the open editor at once', async () => {
    const { sent, windows } = app(true)
    await queueOpenPaths([figFile()])
    expect(sent).toEqual(['open-associated-files'])
    expect(windows()).toBe(0)
  })

  test('open an editor window when none is open, which takes them as it starts', async () => {
    const { windows } = app(false)
    await queueOpenPaths([figFile()])
    expect(windows()).toBe(1)
    expect(takePendingOpen()).toHaveLength(1)

    handleLink('kalka://open?file=designs%2Fposter.fig')
    expect(windows()).toBe(2)
  })
})
