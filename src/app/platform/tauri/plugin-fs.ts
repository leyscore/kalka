import { call, native } from './bridge'

export enum BaseDirectory {
  AppLocalData = 15
}

export enum SeekMode {
  Start = 0,
  Current = 1,
  End = 2
}

interface BaseOptions {
  baseDir?: BaseDirectory
}

export interface FileInfo {
  size: number
  isFile: boolean
  isDirectory: boolean
  mtime: Date | null
}

interface RawFileInfo {
  size: number
  isFile: boolean
  isDirectory: boolean
  mtimeMs: number | null
}

const info = (raw: RawFileInfo): FileInfo => ({
  size: raw.size,
  isFile: raw.isFile,
  isDirectory: raw.isDirectory,
  mtime: raw.mtimeMs === null ? null : new Date(raw.mtimeMs)
})

const base = (options?: BaseOptions) => options?.baseDir ?? null

export async function readFile(path: string, options?: BaseOptions): Promise<Uint8Array> {
  return new Uint8Array(await call<ArrayBuffer | Uint8Array>('fs.readFile', path, base(options)))
}

export function readTextFile(path: string, options?: BaseOptions): Promise<string> {
  return call<string>('fs.readTextFile', path, base(options))
}

export function writeFile(path: string, data: Uint8Array, options?: BaseOptions): Promise<void> {
  return call('fs.writeFile', path, data, base(options))
}

export function writeTextFile(path: string, data: string, options?: BaseOptions): Promise<void> {
  return call('fs.writeFile', path, new TextEncoder().encode(data), base(options))
}

export function mkdir(
  path: string,
  options?: BaseOptions & { recursive?: boolean }
): Promise<void> {
  return call('fs.mkdir', path, base(options), options?.recursive ?? false)
}

export function remove(
  path: string,
  options?: BaseOptions & { recursive?: boolean }
): Promise<void> {
  return call('fs.remove', path, base(options), options?.recursive ?? false)
}

export function exists(path: string, options?: BaseOptions): Promise<boolean> {
  return call<boolean>('fs.exists', path, base(options))
}

export async function stat(path: string, options?: BaseOptions): Promise<FileInfo> {
  return info(await call<RawFileInfo>('fs.stat', path, base(options)))
}

/** An open file read at a position the handle keeps, as Tauri's resource handles do. */
export class FileHandle {
  private position = 0

  constructor(private readonly rid: number) {}

  async stat(): Promise<FileInfo> {
    return info(await call<RawFileInfo>('fs.fstat', this.rid))
  }

  async seek(offset: number, whence: SeekMode): Promise<number> {
    if (whence === SeekMode.Start) this.position = offset
    else if (whence === SeekMode.Current) this.position += offset
    else this.position = (await this.stat()).size + offset
    return this.position
  }

  /** Reads into `buffer` from the current position; null at the end of the file. */
  async read(buffer: Uint8Array): Promise<number | null> {
    const bytes = new Uint8Array(
      await call<ArrayBuffer | Uint8Array>('fs.read', this.rid, this.position, buffer.byteLength)
    )
    if (bytes.byteLength === 0) return null
    buffer.set(bytes)
    this.position += bytes.byteLength
    return bytes.byteLength
  }

  close(): Promise<void> {
    return call('fs.close', this.rid)
  }
}

export async function open(path: string, _options?: { read?: boolean }): Promise<FileHandle> {
  return new FileHandle(await call<number>('fs.open', path))
}

export interface WatchEvent {
  type: 'any' | 'other' | { modify: { kind: 'any' } } | { remove: { kind: 'any' } }
  paths: string[]
  attrs: unknown
}

export type UnwatchFn = () => void

/** Calls back when the file changes, at most once per `delayMs`. */
export async function watch(
  paths: string | string[],
  callback: (event: WatchEvent) => void,
  options?: { delayMs?: number; recursive?: boolean }
): Promise<UnwatchFn> {
  const id = await call<number>(
    'fs.watch',
    Array.isArray(paths) ? paths : [paths],
    options?.delayMs ?? 0
  )
  const stop = native().on(`fs:watch:${id}`, (event) => callback(event as WatchEvent))
  return () => {
    stop()
    void call('fs.unwatch', id)
  }
}
