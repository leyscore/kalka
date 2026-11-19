import { afterEach, describe, expect, test } from 'bun:test'

import { writeKalkaFolder } from '@kalka/core/io/formats/kalka'
import { SceneGraph } from '@kalka/scene-graph'

import { writeKalkaFolderFiles } from '@/app/document/io/kalka-folder'
import { createEditorStore } from '@/app/editor/session'
import { toast } from '@/app/shell/ui'

import { memoryFileSystem } from '#tests/helpers/tauri/memory-fs'
import { clearTauriMocks } from '#tests/helpers/tauri/mocks'

const stores: ReturnType<typeof createEditorStore>[] = []
afterEach(async () => {
  for (const store of stores.splice(0)) store.dispose()
  // The refusal is said in a toast; it must not stay for the next file's tests.
  for (const entry of toast.toasts.value) toast.remove(entry.id)
  await clearTauriMocks()
})

function editor() {
  const store = createEditorStore()
  stores.push(store)
  return store
}

describe('saving a document as a Kalka folder', () => {
  test('refuses a folder that already holds other files, leaving them as they are', async () => {
    const files = await memoryFileSystem({
      '/work/site/pages/index.tsx': 'export default function Home() {}',
      '/work/site/package.json': '{}'
    })
    const store = editor()
    expect(await store.saveKalkaFolderToPath('/work/site')).toBe(false)
    expect(files.has('/work/site/pages/index.tsx')).toBe(true)
    expect(files.has('/work/site/project.json')).toBe(false)
    expect(store.getDocumentFilePath()).not.toBe('/work/site')
  })

  test('saves into an empty folder, or one holding only hidden files such as .git', async () => {
    const files = await memoryFileSystem({ '/work/empty/.git/HEAD': 'ref: refs/heads/main' })
    expect(await editor().saveKalkaFolderToPath('/work/empty')).toBe(true)
    expect(files.has('/work/empty/project.json')).toBe(true)
  })

  test('saves over a Kalka folder', async () => {
    const files = await memoryFileSystem()
    await writeKalkaFolderFiles('/work/doc', await writeKalkaFolder(new SceneGraph()))
    expect(await editor().saveKalkaFolderToPath('/work/doc')).toBe(true)
    expect(files.has('/work/doc/project.json')).toBe(true)
  })
})
