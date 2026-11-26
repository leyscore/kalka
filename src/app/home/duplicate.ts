import { getRecoveryStore } from '@/app/document/recovery'
import type { DraftDocument } from '@/app/home/drafts'
import { rememberRecentFile } from '@/app/recent-files'
import { createCanvasId } from '@/app/storage/id'

/** The name Figma gives a duplicated file: its own with " copy" after it. */
export function duplicateName(name: string): string {
  return `${name || 'Untitled'} copy`
}

/**
 * Figma's Duplicate on a file of Home, for a draft recovery keeps: a second draft, "<name> copy",
 * holding what it holds. False for a draft a tab has open, which File › Duplicate copies.
 */
export async function duplicateDraft(draft: DraftDocument): Promise<boolean> {
  if (!draft.snapshotId || draft.tabId) return false
  const store = getRecoveryStore()
  const snapshot = await store.read(draft.snapshotId)
  if (!snapshot) return false
  await store.write({
    id: createCanvasId(),
    documentName: duplicateName(snapshot.documentName),
    figBytes: snapshot.figBytes
  })
  return true
}

/** `dir/name copy.ext`, or `name copy 2.ext` and on when that is taken. */
export async function duplicatePath(
  path: string,
  taken: (candidate: string) => Promise<boolean>
): Promise<string> {
  const slash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'))
  const dir = path.slice(0, slash + 1)
  const file = path.slice(slash + 1)
  const dot = file.lastIndexOf('.')
  const base = dot > 0 ? file.slice(0, dot) : file
  const ext = dot > 0 ? file.slice(dot) : ''
  for (let count = 1; ; count++) {
    const candidate = `${dir}${duplicateName(base)}${count > 1 ? ` ${count}` : ''}${ext}`
    if (!(await taken(candidate))) return candidate
  }
}

/**
 * Figma's Duplicate on a file of Home, for a file on this computer: a copy beside it, "<name>
 * copy", which then leads Recent. A Kalka folder, a directory, is not copied.
 */
export async function duplicateLocalFile(path: string): Promise<string | null> {
  const { exists, readFile, stat, writeFile } = await import('@tauri-apps/plugin-fs')
  if ((await stat(path)).isDirectory) return null
  const copy = await duplicatePath(path, exists)
  await writeFile(copy, await readFile(path))
  rememberRecentFile(copy)
  return copy
}
