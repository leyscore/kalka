import { afterEach, describe, expect, test } from 'bun:test'

import { readKalkaArchive, writeKalkaFolder } from '@kalka/core/io/formats/kalka'
import { SceneGraph } from '@kalka/scene-graph'

import { readKalkaFolderAsFile, writeKalkaFolderFiles } from '@/app/document/io/kalka-folder'

import { clearTauriMocks, mockTauriIPC } from '#tests/helpers/tauri/mocks'

afterEach(async () => {
  await clearTauriMocks()
})

function pathArg(args: unknown, options: unknown): string {
  if (typeof args === 'object' && args !== null && 'path' in args && typeof args.path === 'string')
    return args.path
  const headers: unknown =
    typeof options === 'object' && options !== null ? Reflect.get(options, 'headers') : undefined
  const path: unknown =
    typeof headers === 'object' && headers !== null ? Reflect.get(headers, 'path') : undefined
  return typeof path === 'string' ? decodeURIComponent(path) : ''
}

/** A file system in memory, answering plugin-fs the way the desktop shell does. */
async function memoryFileSystem(initial: Record<string, string> = {}) {
  const files = new Map<string, Uint8Array>(
    Object.entries(initial).map(([path, text]) => [path, new TextEncoder().encode(text)])
  )
  const isDirectory = (path: string) =>
    [...files.keys()].some((file) => file.startsWith(`${path.replace(/\/$/, '')}/`))
  await mockTauriIPC((cmd, args, options) => {
    const path = pathArg(args, options).replace(/\/$/, '')
    switch (cmd) {
      case 'plugin:fs|write_file':
        files.set(path, new Uint8Array(args as ArrayBuffer))
        return null
      case 'plugin:fs|read_file':
        return [...(files.get(path) ?? [])]
      case 'plugin:fs|mkdir':
      case 'plugin:fs|remove':
        if (cmd === 'plugin:fs|remove') files.delete(path)
        return null
      case 'plugin:fs|exists':
        return files.has(path) || isDirectory(path)
      case 'plugin:fs|read_dir': {
        const names = new Map<string, boolean>()
        for (const file of files.keys()) {
          if (!file.startsWith(`${path}/`)) continue
          const [name, ...rest] = file.slice(path.length + 1).split('/')
          names.set(name, rest.length > 0)
        }
        return [...names].map(([name, directory]) => ({
          name,
          isDirectory: directory,
          isFile: !directory,
          isSymlink: false
        }))
      }
      default:
        throw new Error(`Unexpected ${cmd}`)
    }
  })
  return files
}

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
