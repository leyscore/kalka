import { afterEach, describe, expect, test } from 'bun:test'

import { readKalkaArchive, writeKalkaFolder } from '@kalka/core/io/formats/kalka'
import { SceneGraph } from '@kalka/scene-graph'

import { readKalkaFolderAsFile, writeKalkaFolderFiles } from '@/app/document/io/kalka-folder'

import { memoryFileSystem } from '#tests/helpers/tauri/memory-fs'
import { clearTauriMocks } from '#tests/helpers/tauri/mocks'

afterEach(async () => {
  await clearTauriMocks()
})

describe('Kalka folders on desktop', () => {
  test('saves into the folder, dropping pages it no longer has, and opens it again', async () => {
    const files = await memoryFileSystem({
      '/work/doc/pages/old-page.html': '<!doctype html><body></body>',
      '/work/doc/README.md': '# Notes'
    })
    const graph = new SceneGraph()
    graph.createNode('FRAME', graph.getPages()[0].id, { name: 'Artboard', width: 320, height: 200 })
    await writeKalkaFolderFiles('/work/doc', await writeKalkaFolder(graph))

    expect(files.has('/work/doc/pages/old-page.html')).toBe(false)
    expect(files.has('/work/doc/README.md')).toBe(true)
    expect(files.has('/work/doc/project.json')).toBe(true)

    const file = await readKalkaFolderAsFile('/work/doc')
    expect(file.name).toBe('doc.kalka')
    const opened = readKalkaArchive(new Uint8Array(await file.arrayBuffer()))
    expect([...opened.getAllNodes()].map((node) => node.name)).toContain('Artboard')
  })
})
