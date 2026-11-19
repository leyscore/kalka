import { afterEach, describe, expect, test } from 'bun:test'

import { writeKalkaArchive, writeKalkaFolder } from '@kalka/core/io/formats/kalka'
import { SceneGraph } from '@kalka/scene-graph'

import { writeKalkaFolderFiles } from '@/app/document/io/kalka-folder'
import { createEditorStore } from '@/app/editor/session'

import { memoryFileSystem } from '#tests/helpers/tauri/memory-fs'
import { clearTauriMocks } from '#tests/helpers/tauri/mocks'

const stores: ReturnType<typeof createEditorStore>[] = []
afterEach(async () => {
  for (const store of stores.splice(0)) store.dispose()
  await clearTauriMocks()
})

/** A document as another app, or a restored version, left it on disk. */
function documentOnDisk() {
  const graph = new SceneGraph()
  graph.createNode('FRAME', graph.getPages()[0].id, { name: 'From disk', width: 320, height: 200 })
  return graph
}

function layerNames(store: ReturnType<typeof createEditorStore>): string[] {
  return [...store.graph.getAllNodes()].map((node) => node.name)
}

describe('reading a document again from where it is saved', () => {
  test('reads a Kalka folder as the folder it is, such as after restoring a version', async () => {
    await memoryFileSystem()
    await writeKalkaFolderFiles('/work/doc', await writeKalkaFolder(documentOnDisk()))
    const store = createEditorStore()
    stores.push(store)
    store.setDocumentSource('doc.kalka', 'kalka', undefined, '/work/doc')

    await store.reloadFromDisk()
    expect(layerNames(store)).toContain('From disk')
    expect(store.hasUnsavedChanges()).toBe(false)
  })

  test('reads a .kalka file as a Kalka archive', async () => {
    const files = await memoryFileSystem()
    files.set('/work/doc.kalka', await writeKalkaArchive(documentOnDisk()))
    const store = createEditorStore()
    stores.push(store)
    store.setDocumentSource('doc.kalka', 'kalka', undefined, '/work/doc.kalka')

    await store.reloadFromDisk()
    expect(layerNames(store)).toContain('From disk')
  })
})
