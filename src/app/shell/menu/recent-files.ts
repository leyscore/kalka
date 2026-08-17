import { useLocalStorage } from '@vueuse/core'
import { computed } from 'vue'

import { extractFigThumbnailFromReader } from '@open-pencil/fig'

import {
  readCacheBytes,
  removeCacheEntriesWithPrefix,
  removeCachePrefix,
  writeCacheBytes
} from '@/app/cache'
import { isTauri } from '@/app/tauri/env'

const MAX_RECENT_FILES = 10
const RECENT_FILES_STORAGE_KEY = 'open-pencil:recent-files'
const RECENT_FILE_OPENED_AT_STORAGE_KEY = 'open-pencil:recent-file-opened-at'
const RECENT_FILE_THUMBNAIL_CACHE_DIR = 'recent-file-thumbnails/v2'
const LEGACY_RECENT_FILE_THUMBNAIL_CACHE_PREFIX = 'recent-file-thumbnail-v2-'

export type RecentFile = {
  id: string
  path: string
  name: string
  updatedAt: string
}

export const OPEN_RECENT_EVENT_PREFIX = 'open-recent:'
export const recentFilePaths = useLocalStorage<string[]>(RECENT_FILES_STORAGE_KEY, [])
const recentFileOpenedAt = useLocalStorage<Record<string, string>>(
  RECENT_FILE_OPENED_AT_STORAGE_KEY,
  {}
)

function fileName(path: string): string {
  return path.split(/[\\/]/).pop() ?? path
}

export const recentFiles = computed<RecentFile[]>(() =>
  normalizedRecentFiles().map((path) => ({
    id: path,
    path,
    name: fileName(path),
    updatedAt: recentFileOpenedAt.value[path] ?? new Date(0).toISOString()
  }))
)

function normalizedRecentFiles(): string[] {
  return recentFilePaths.value
    .filter((path): path is string => typeof path === 'string' && path.length > 0)
    .slice(0, MAX_RECENT_FILES)
}

export async function syncRecentFilesMenu(): Promise<void> {
  if (!isTauri()) return
  const { invoke } = await import('@tauri-apps/api/core')
  await invoke('set_recent_files', { paths: normalizedRecentFiles() })
}

function updateRecentFiles(paths: string[]): void {
  recentFilePaths.value = paths.slice(0, MAX_RECENT_FILES)
  void syncRecentFilesMenu().catch((error) => {
    console.warn('[Recent files] Failed to update the native menu', error)
  })
}

export function rememberRecentFile(path: string): void {
  recentFileOpenedAt.value = {
    ...recentFileOpenedAt.value,
    [path]: new Date().toISOString()
  }
  updateRecentFiles([path, ...normalizedRecentFiles().filter((recent) => recent !== path)])
}

export function forgetRecentFile(path: string): void {
  recentFileOpenedAt.value = Object.fromEntries(
    Object.entries(recentFileOpenedAt.value).filter(([recent]) => recent !== path)
  )
  updateRecentFiles(normalizedRecentFiles().filter((recent) => recent !== path))
}

export async function clearRecentFiles(): Promise<void> {
  recentFileOpenedAt.value = {}
  updateRecentFiles([])
  await Promise.all([
    removeCachePrefix(RECENT_FILE_THUMBNAIL_CACHE_DIR),
    removeCacheEntriesWithPrefix(LEGACY_RECENT_FILE_THUMBNAIL_CACHE_PREFIX)
  ])
}

export function recentFileAt(index: number): string | null {
  return normalizedRecentFiles()[index] ?? null
}

async function recentFileThumbnailCacheKey(path: string): Promise<string> {
  let fingerprint = path
  try {
    const { stat } = await import('@tauri-apps/plugin-fs')
    const info = await stat(path)
    fingerprint = `${path}\0${info.size}\0${info.mtime?.getTime() ?? 0}`
  } catch (error) {
    // A path-only key still permits a preview when metadata is unavailable.
    console.warn('[Recent files] Could not stat the file for thumbnail caching', error)
  }
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(fingerprint))
  const hash = [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
  return `${RECENT_FILE_THUMBNAIL_CACHE_DIR}/${hash}.png`
}

export async function loadCachedRecentFileThumbnail(path: string): Promise<Uint8Array | null> {
  if (!isTauri()) return null
  const bytes = await readCacheBytes(await recentFileThumbnailCacheKey(path))
  return bytes ? new Uint8Array(bytes) : null
}

export async function cacheRecentFileThumbnail(path: string, bytes: Uint8Array): Promise<void> {
  if (!isTauri()) return
  await writeCacheBytes(await recentFileThumbnailCacheKey(path), Uint8Array.from(bytes).buffer)
}

export async function loadRecentFileThumbnail(path: string): Promise<Uint8Array | null> {
  if (!isTauri() || !path.toLowerCase().endsWith('.fig')) return null
  const cached = await loadCachedRecentFileThumbnail(path)
  if (cached) return cached
  const { readFile } = await import('@tauri-apps/plugin-fs')
  const bytes = await readFile(path)
  return extractFigThumbnailFromReader({
    size: bytes.byteLength,
    async read(start, endExclusive) {
      return bytes.subarray(start, endExclusive)
    }
  })
}
