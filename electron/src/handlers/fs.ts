import { watch as watchFile, type FSWatcher } from 'node:fs'
import * as fs from 'node:fs/promises'
import { isAbsolute, join, normalize, sep } from 'node:path'

import { app } from 'electron'

import { emit, registerAll, type CallContext } from '../ipc'

/** Tauri's `BaseDirectory.AppLocalData`, the only base directory the app uses. */
const APP_LOCAL_DATA = 15

function resolvePath(path: string, baseDir: number | null): string {
  if (baseDir === null) {
    if (!isAbsolute(path)) throw new Error(`Expected an absolute path: ${path}`)
    return normalize(path)
  }
  if (baseDir !== APP_LOCAL_DATA) throw new Error(`Unsupported base directory ${baseDir}`)
  const root = app.getPath('userData')
  const resolved = normalize(join(root, path))
  if (resolved !== root && !resolved.startsWith(root + sep))
    throw new Error('Path escapes the app data directory')
  return resolved
}

const toInfo = (stats: import('node:fs').Stats) => ({
  size: stats.size,
  isFile: stats.isFile(),
  isDirectory: stats.isDirectory(),
  mtimeMs: Number.isFinite(stats.mtimeMs) ? stats.mtimeMs : null
})

const handles = new Map<number, fs.FileHandle>()
const watchers = new Map<number, { watchers: FSWatcher[]; timer: NodeJS.Timeout | null }>()
let nextId = 1

export const fsHandlers = {
  async readFile(_context: CallContext, path: string, baseDir: number | null) {
    return new Uint8Array(await fs.readFile(resolvePath(path, baseDir)))
  },
  readTextFile(_context: CallContext, path: string, baseDir: number | null) {
    return fs.readFile(resolvePath(path, baseDir), 'utf8')
  },
  writeFile(_context: CallContext, path: string, data: Uint8Array, baseDir: number | null) {
    return fs.writeFile(resolvePath(path, baseDir), data)
  },
  async mkdir(_context: CallContext, path: string, baseDir: number | null, recursive: boolean) {
    await fs.mkdir(resolvePath(path, baseDir), { recursive })
  },
  remove(_context: CallContext, path: string, baseDir: number | null, recursive: boolean) {
    return fs.rm(resolvePath(path, baseDir), { recursive })
  },
  /** A directory's entries, as Tauri's `readDir` lists them: names and kinds, not recursive. */
  async readDir(_context: CallContext, path: string, baseDir: number | null) {
    const entries = await fs.readdir(resolvePath(path, baseDir), { withFileTypes: true })
    return entries.map((entry) => ({
      name: entry.name,
      isFile: entry.isFile(),
      isDirectory: entry.isDirectory(),
      isSymlink: entry.isSymbolicLink()
    }))
  },
  async exists(_context: CallContext, path: string, baseDir: number | null) {
    try {
      await fs.access(resolvePath(path, baseDir))
      return true
    } catch {
      return false
    }
  },
  async stat(_context: CallContext, path: string, baseDir: number | null) {
    return toInfo(await fs.stat(resolvePath(path, baseDir)))
  },
  async open(_context: CallContext, path: string) {
    const handle = await fs.open(resolvePath(path, null), 'r')
    const id = nextId++
    handles.set(id, handle)
    return id
  },
  async fstat(_context: CallContext, id: number) {
    const handle = handles.get(id)
    if (!handle) throw new Error('The file is closed')
    return toInfo(await handle.stat())
  },
  async read(_context: CallContext, id: number, position: number, length: number) {
    const handle = handles.get(id)
    if (!handle) throw new Error('The file is closed')
    const buffer = new Uint8Array(length)
    const { bytesRead } = await handle.read(buffer, 0, length, position)
    return buffer.subarray(0, bytesRead)
  },
  async close(_context: CallContext, id: number) {
    await handles.get(id)?.close()
    handles.delete(id)
  },
  /** Reports changes to the files, at most once per `delayMs`, as Tauri's modify events. */
  watch(context: CallContext, paths: string[], delayMs: number) {
    const id = nextId++
    const entry: { watchers: FSWatcher[]; timer: NodeJS.Timeout | null } = {
      watchers: [],
      timer: null
    }
    const sender = context.sender
    for (const path of paths) {
      const resolved = resolvePath(path, null)
      entry.watchers.push(
        watchFile(resolved, (kind) => {
          if (entry.timer) clearTimeout(entry.timer)
          entry.timer = setTimeout(() => {
            entry.timer = null
            const type =
              kind === 'rename' ? { remove: { kind: 'any' } } : { modify: { kind: 'any' } }
            emit(sender, `fs:watch:${id}`, { type, paths: [resolved], attrs: {} })
          }, delayMs)
        })
      )
    }
    watchers.set(id, entry)
    sender.once('destroyed', () => unwatch(id))
    return id
  },
  unwatch(_context: CallContext, id: number) {
    unwatch(id)
  }
}

function unwatch(id: number): void {
  const entry = watchers.get(id)
  if (!entry) return
  if (entry.timer) clearTimeout(entry.timer)
  for (const watcher of entry.watchers) watcher.close()
  watchers.delete(id)
}

export function registerFsHandlers(): void {
  registerAll(fsHandlers, 'fs')
}
