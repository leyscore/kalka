import { ref, type Ref } from 'vue'

import type { EditorStore } from '@/app/editor/active-store'

import {
  createGitBranch,
  deleteGitBranch,
  mergeGitBranch,
  pushVersions,
  readBranchChanges,
  readGitStatus,
  switchGitBranch,
  type GitBranchChange
} from './git'

export type BranchOperation = 'branch' | 'merge' | 'review' | 'switch'

interface BranchActionsOptions {
  store: Pick<EditorStore, 'reloadFromDisk'>
  /** Runs one operation at a time on the document's path, reporting what failed. */
  run: (
    operation: BranchOperation,
    action: (documentPath: string) => Promise<void>
  ) => Promise<void>
  /** Saves the document so Git sees what is on screen, or throws. */
  saveFirst: () => Promise<void>
  /** Records a version with this message. */
  record: (documentPath: string, text: string) => Promise<void>
  remote: Ref<string | null>
}

/**
 * The branches of a Kalka folder in the versions panel: start one from what is on screen, open
 * another, look at what one changed, merge it. Opening another branch or merging records the work
 * here first, so neither loses an edit, and both open the folder as it then is.
 */
export function createBranchActions({
  store,
  run,
  saveFirst,
  record,
  remote
}: BranchActionsOptions) {
  /** A branch looked at before merging it, with the files it changed. */
  const review = ref<{ branch: string; changes: GitBranchChange[] } | null>(null)

  async function recordFirst(documentPath: string, label: string): Promise<void> {
    await saveFirst()
    const before = await readGitStatus(documentPath)
    if (before && before.files.length > 0) await record(documentPath, label)
  }

  return {
    review,
    /** Starts a branch from what is on screen and moves onto it; nothing is reloaded. */
    createBranch: (name: string) =>
      run('branch', async (documentPath) => {
        await saveFirst()
        await createGitBranch(documentPath, name)
      }),
    /** Moves onto another branch, recording the work here first, and opens what is there. */
    switchBranch: (name: string, before: string) =>
      run('switch', async (documentPath) => {
        await recordFirst(documentPath, before)
        await switchGitBranch(documentPath, name)
        review.value = null
        await store.reloadFromDisk()
      }),
    reviewBranch: (name: string) =>
      run('review', async (documentPath) => {
        review.value = { branch: name, changes: await readBranchChanges(documentPath, name) }
      }),
    /**
     * Merges a branch into this one as one version; when changes meet, nothing is merged and the
     * error names the files.
     */
    mergeBranch: (name: string, before: string) =>
      run('merge', async (documentPath) => {
        await recordFirst(documentPath, before)
        await mergeGitBranch(documentPath, name)
        review.value = null
        await store.reloadFromDisk()
        if (remote.value) await pushVersions(documentPath)
      }),
    deleteBranch: (name: string) =>
      run('branch', async (documentPath) => {
        await deleteGitBranch(documentPath, name)
        review.value = null
      }),
    closeReview: () => {
      review.value = null
    }
  }
}
