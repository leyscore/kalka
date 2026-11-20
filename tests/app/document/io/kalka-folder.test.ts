import { afterEach, describe, expect, test } from 'bun:test'

import { readKalkaArchive, writeKalkaFolder } from '@kalka/core/io/formats/kalka'
import { SceneGraph } from '@kalka/scene-graph'

import {
  finishInterruptedFolderSave,
  readKalkaFolderAsFile,
  writeKalkaFolderFiles
} from '@/app/document/io/kalka-folder'

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

  test('a save cut short before it is complete leaves the last save as it was', async () => {
    const files = await memoryFileSystem({
      '/work/doc/project.json': 'old project',
      '/work/doc/pages/home.html': 'old page',
      '/work/doc/.kalka-save/project.json': 'new project'
    })
    await finishInterruptedFolderSave('/work/doc')

    expect(text(files, '/work/doc/project.json')).toBe('old project')
    expect(text(files, '/work/doc/pages/home.html')).toBe('old page')
    expect([...files.keys()].some((path) => path.includes('.kalka-save'))).toBe(false)
  })

  test('a save cut short once all of it was written is finished when the folder opens', async () => {
    const files = await memoryFileSystem({
      '/work/doc/project.json': 'old project',
      '/work/doc/pages/home.html': 'old page',
      '/work/doc/pages/gone.html': 'old page',
      '/work/doc/.kalka-save/project.json': 'new project',
      '/work/doc/.kalka-save/pages/home.html': 'new page',
      '/work/doc/.kalka-save/.complete': JSON.stringify({
        files: ['project.json', 'pages/home.html']
      })
    })
    await finishInterruptedFolderSave('/work/doc')

    expect(text(files, '/work/doc/project.json')).toBe('new project')
    expect(text(files, '/work/doc/pages/home.html')).toBe('new page')
    expect(files.has('/work/doc/pages/gone.html')).toBe(false)
    expect([...files.keys()].some((path) => path.includes('.kalka-save'))).toBe(false)
  })

  test('saving writes every file before it replaces any', async () => {
    const files = await memoryFileSystem({
      '/work/doc/project.json': 'old project'
    })
    const order: string[] = []
    const set = files.set.bind(files)
    files.set = (path, value) => {
      order.push(path)
      return set(path, value)
    }
    const graph = new SceneGraph()
    graph.createNode('FRAME', graph.getPages()[0].id, { name: 'Artboard', width: 320, height: 200 })
    await writeKalkaFolderFiles('/work/doc', await writeKalkaFolder(graph))

    const firstInPlace = order.findIndex((path) => !path.includes('/.kalka-save/'))
    const lastStaged = order.findLastIndex((path) => path.includes('/.kalka-save/'))
    expect(firstInPlace).toBeGreaterThan(lastStaged)
  })
})

function text(files: Map<string, Uint8Array>, path: string): string {
  return new TextDecoder().decode(files.get(path))
}
