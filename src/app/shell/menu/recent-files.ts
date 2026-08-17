import { useLocalStorage } from '@vueuse/core'
import { computed } from 'vue'

import { extractFigThumbnailFromReader } from '@open-pencil/fig'

import { isTauri } from '@/app/tauri/env'

const MAX_RECENT_FILES = 10
const RECENT_FILES_STORAGE_KEY = 'open-pencil:recent-files'
const RECENT_FILE_OPENED_AT_STORAGE_KEY = 'open-pencil:recent-file-opened-at'

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

export function clearRecentFiles(): void {
  recentFileOpenedAt.value = {}
  updateRecentFiles([])
}

export function recentFileAt(index: number): string | null {
  return normalizedRecentFiles()[index] ?? null
}

export async function loadRecentFileThumbnail(path: string): Promise<Uint8Array | null> {
  if (!isTauri() || !path.toLowerCase().endsWith('.fig')) return null
  const { readFile } = await import('@tauri-apps/plugin-fs')
  const bytes = await readFile(path)
  return extractFigThumbnailFromReader({
    size: bytes.byteLength,
    async read(start, endExclusive) {
      return bytes.subarray(start, endExclusive)
    }
  })
}
