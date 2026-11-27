import { exportFigFile } from '@kalka/core/io/formats/fig'

import { getRecoveryStore } from '@/app/document/recovery'
import type { DraftDocument } from '@/app/home/drafts'
import { rememberRecentFile } from '@/app/recent-files'
import { createCanvasId } from '@/app/storage/id'
import { getTabsSnapshot } from '@/app/tabs'

/** The name Figma gives a duplicated file: its own with " copy" after it. */
export function duplicateName(name: string): string {
  return `${name || 'Untitled'} copy`
}

/**
 * Figma's Duplicate on a draft of Home: a second draft, "<name> copy", holding what it holds now,
 * listed with the others. A draft a tab has open is copied as the tab has it, without leaving Home.
 */
export async function duplicateDraft(draft: DraftDocument): Promise<boolean> {
  const store = getRecoveryStore()
  const tab = draft.tabId ? getTabsSnapshot().find(({ id }) => id === draft.tabId) : undefined
  if (tab) {
    const { graph, state } = tab.store
    const name = duplicateName(state.documentName)
    // Drawn with Skia, so the copy's card on Home shows the document too.
    const renderer = await tab.store.loadCanvasKit()
    await store.write({
      id: createCanvasId(),
      documentName: name,
      figBytes: await exportFigFile(graph, {
        ck: renderer?.ck,
        renderer: renderer ?? undefined,
        pageId: state.currentPageId,
        documentName: name
      })
    })
    return true
  }
  if (!draft.snapshotId) return false
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
