import { applyLayerChanges } from '@kalka/scene-graph/diff'

import { compareForMerge } from '@/app/document/versions/compare'
import type { EditorStore } from '@/app/editor/active-store'

import { withServerSession } from './account'
import { serverAPI, type ServerDocument } from './api'
import { openServerDocument, saveServerFile, serverDocuments } from './documents'

/**
 * Reviewing a server branch layer by layer, as Figma reviews one before a merge: what the branch
 * changed since it began, each change taken or left, merged into the main file as one version;
 * and the other way, updating the branch with what the main file changed since.
 */

async function readArchive(bytes: Uint8Array) {
  const { readKalkaArchive } = await import('@kalka/core/io/formats/kalka')
  return readKalkaArchive(bytes)
}

async function branchSides(roomId: string) {
  const [base, main] = await withServerSession((url, token) =>
    Promise.all([
      serverAPI.branchBase(url, token, roomId),
      serverAPI.branchMain(url, token, roomId)
    ])
  )
  return main ? { base: base ? await readArchive(base) : null, main } : null
}

export interface BranchReviewLabels {
  branch: string
  main: string
}

/**
 * Opens the review of what the branch on screen would bring into its main file. False when the
 * server cannot send the main file, as one older than layer reviews: merge the branch whole.
 */
export async function reviewServerMerge(
  roomId: string,
  store: EditorStore,
  labels: BranchReviewLabels,
  merged: (main: ServerDocument) => void
): Promise<boolean> {
  const sides = await branchSides(roomId)
  if (!sides) return false
  const { base, main } = sides
  compareForMerge({
    base,
    target: await readArchive(main.data),
    incoming: store.graph,
    targetLabel: labels.main,
    incomingLabel: labels.branch,
    afterIsOpen: true,
    merge: {
      kind: 'merge',
      otherSide: labels.main,
      apply: async (changes) => {
        const target = await readArchive(main.data)
        const skipped = applyLayerChanges(target, store.graph, changes)
        const { writeKalkaArchive } = await import('@kalka/core/io/formats/kalka')
        const bytes = await writeKalkaArchive(target)
        const document = await withServerSession((url, token) =>
          serverAPI.mergeBranchFile(url, token, roomId, bytes, main.savedAt)
        )
        serverDocuments.value = serverDocuments.value.filter((known) => known.id !== roomId)
        openServerDocument(document)
        merged(document)
        return skipped
      }
    }
  })
  return true
}

/** Opens the review of what the main file changed since the branch on screen began. */
export async function reviewServerUpdate(
  roomId: string,
  store: EditorStore,
  labels: BranchReviewLabels & { olderServer: string }
): Promise<void> {
  const sides = await branchSides(roomId)
  // Without where the branch began, the branch's own work would read as the main file's.
  if (!sides?.base) throw new Error(labels.olderServer)
  const { base, main } = sides
  const incoming = await readArchive(main.data)
  compareForMerge({
    base,
    target: store.graph,
    incoming,
    targetLabel: labels.branch,
    incomingLabel: labels.main,
    afterIsOpen: false,
    merge: {
      kind: 'update',
      otherSide: labels.branch,
      apply: async (changes) => {
        const skipped = applyLayerChanges(store.graph, incoming, changes)
        store.undo.clear()
        store.requestRender()
        await saveServerFile(roomId, store)
        await withServerSession((url, token) =>
          serverAPI.updateBranch(url, token, roomId, main.savedAt)
        )
        return skipped
      }
    }
  })
}
