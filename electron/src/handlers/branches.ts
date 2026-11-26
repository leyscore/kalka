import * as v from 'valibot'

import { git, GitError, requireRepository } from './git-operations'

/**
 * Branches of a Kalka folder's repository: try changes on a branch, look at what it changed,
 * merge it back. A Kalka folder is HTML, CSS and JSON, so Git merges changes to different files
 * and lines by itself; changes that meet are not resolved here: the merge is undone and the
 * files named, so the folder is never left half merged.
 */

/** A branch name the page may pass: one git accepts, never one read as an option. */
const BranchName = v.pipe(
  v.string(),
  v.trim(),
  v.minLength(1),
  v.maxLength(100),
  v.check((name) => !name.startsWith('-'), 'A branch name cannot start with a dash')
)

export interface GitBranches {
  /** The branch checked out, or null on a detached commit. */
  current: string | null
  branches: string[]
}

export interface GitBranchChange {
  path: string
  /** Git's letter for the change: A added, M modified, D deleted, R renamed. */
  status: string
}

async function branchName(root: string, name: unknown): Promise<string> {
  const parsed = v.parse(BranchName, name)
  try {
    return (await git(root, ['check-ref-format', '--branch', parsed])).trim()
  } catch {
    throw new GitError(`“${parsed}” is not a valid branch name`)
  }
}

async function existingBranch(root: string, name: unknown): Promise<string> {
  const branch = await branchName(root, name)
  const { branches } = await gitBranchHandlers.branches(null, root)
  if (!branches.includes(branch)) throw new GitError(`There is no branch named “${branch}”`)
  return branch
}

/** The files that meet in a merge in progress. */
async function conflictedFiles(root: string): Promise<string[]> {
  const output = await git(root, ['diff', '--name-only', '--diff-filter=U', '-z'])
  return output.split('\0').filter((path) => path.length > 0)
}

export const gitBranchHandlers = {
  async branches(_context: unknown, documentPath: unknown): Promise<GitBranches> {
    const root = await requireRepository(documentPath)
    const output = await git(root, ['branch', '--format=%(refname:short)'])
    const branches = output.split('\n').filter((name) => name.length > 0)
    let current: string | null = null
    try {
      current = (await git(root, ['symbolic-ref', '--quiet', '--short', 'HEAD'])).trim() || null
    } catch {
      current = null
    }
    // A repository without commits has its branch only in HEAD.
    if (current && !branches.includes(current)) branches.unshift(current)
    return { current, branches }
  },
  /** Starts a branch from the current version and moves onto it, keeping what is not recorded. */
  async createBranch(_context: unknown, documentPath: unknown, name: unknown): Promise<void> {
    const root = await requireRepository(documentPath)
    await git(root, ['switch', '--create', await branchName(root, name)])
  },
  /** Moves onto another branch; git refuses while recorded changes there would be overwritten. */
  async switchBranch(_context: unknown, documentPath: unknown, name: unknown): Promise<void> {
    const root = await requireRepository(documentPath)
    await git(root, ['switch', await existingBranch(root, name)])
  },
  /** What a branch changed since it left the current one, for a look before merging. */
  async branchChanges(
    _context: unknown,
    documentPath: unknown,
    name: unknown
  ): Promise<GitBranchChange[]> {
    const root = await requireRepository(documentPath)
    const branch = await existingBranch(root, name)
    const output = await git(root, ['diff', '--name-status', '-z', `HEAD...${branch}`, '--'])
    const parts = output.split('\0').filter((part) => part.length > 0)
    const changes: GitBranchChange[] = []
    for (let index = 0; index < parts.length;) {
      const status = parts[index] ?? ''
      // A rename or a copy names the path before and after; the one after is kept.
      const renamed = status.startsWith('R') || status.startsWith('C')
      const path = parts[index + (renamed ? 2 : 1)] ?? ''
      changes.push({ path, status: status.charAt(0) })
      index += renamed ? 3 : 2
    }
    return changes
  },
  /**
   * Merges a branch into the current one as one version. When changes meet, the merge is
   * undone and the error names the files, so nothing is left half merged.
   */
  async merge(_context: unknown, documentPath: unknown, name: unknown): Promise<void> {
    const root = await requireRepository(documentPath)
    const branch = await existingBranch(root, name)
    try {
      await git(root, ['merge', '--no-ff', '--no-edit', branch])
    } catch (error) {
      const conflicts = await conflictedFiles(root).catch(() => [])
      if (conflicts.length === 0) throw error
      await git(root, ['merge', '--abort'])
      throw new GitError(
        `“${branch}” and this branch both changed ${conflicts.join(', ')}: nothing was merged`
      )
    }
  },
  /** Deletes a branch already merged; git refuses one with work that would be lost. */
  async deleteBranch(_context: unknown, documentPath: unknown, name: unknown): Promise<void> {
    const root = await requireRepository(documentPath)
    await git(root, ['branch', '--delete', await existingBranch(root, name)])
  }
}
