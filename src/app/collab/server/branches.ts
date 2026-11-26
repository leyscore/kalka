import type { EditorStore } from '@/app/editor/active-store'

import { withServerSession } from './account'
import { ServerRequestError, serverAPI, type ServerDocument } from './api'
import { openServerDocument, saveServerFile, serverDocuments } from './documents'

/**
 * Branches of a server file: a copy to change apart from the file everyone works in, merged back
 * into it later. The server keeps them; merging puts the branch's file into the main one as a
 * version its editors apply. A merge replaces the main file as a whole, so a main file saved
 * since the branch began is replaced only when asked again (`force`).
 */

export function listServerBranches(roomId: string): Promise<ServerDocument[]> {
  return withServerSession((url, token) => serverAPI.branches(url, token, roomId))
}

/** Saves what is on screen, branches from it, and opens the branch in a tab of its own. */
export async function createServerBranch(
  roomId: string,
  store: EditorStore,
  name: string
): Promise<ServerDocument> {
  await saveServerFile(roomId, store)
  const branch = await withServerSession((url, token) =>
    serverAPI.createBranch(url, token, roomId, name)
  )
  serverDocuments.value = [branch, ...serverDocuments.value]
  openServerDocument(branch)
  return branch
}

export type BranchMergeResult =
  | { status: 'merged'; main: ServerDocument }
  /** The main file was saved since the branch began; merging again with `force` replaces it. */
  | { status: 'main-changed' }

/** Saves the branch as it is on screen, then merges it into the file it comes from. */
export async function mergeServerBranch(
  roomId: string,
  store: EditorStore,
  force = false
): Promise<BranchMergeResult> {
  await saveServerFile(roomId, store)
  try {
    const main = await withServerSession((url, token) =>
      serverAPI.mergeBranch(url, token, roomId, force)
    )
    serverDocuments.value = serverDocuments.value.filter((document) => document.id !== roomId)
    return { status: 'merged', main }
  } catch (error) {
    if (!force && error instanceof ServerRequestError && error.status === 409) {
      return { status: 'main-changed' }
    }
    throw error
  }
}
