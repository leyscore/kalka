import { compact, uniq } from 'es-toolkit'
import * as v from 'valibot'

import { call } from '@/app/platform/tauri/bridge'

/**
 * A document's versions in Git, through the desktop app's main process. Each call names an
 * operation; the main process runs a fixed git command in the repository holding the document.
 */
const FileChangeSchema = v.object({ path: v.string(), status: v.string() })
const StatusSchema = v.nullable(
  v.object({
    root: v.string(),
    branch: v.nullable(v.string()),
    upstream: v.nullable(v.string()),
    ahead: v.number(),
    behind: v.number(),
    files: v.array(FileChangeSchema)
  })
)
const CommitSchema = v.object({
  hash: v.string(),
  author: v.string(),
  time: v.number(),
  subject: v.string(),
  /** Agents whose changes the version holds; older app builds do not send it. */
  agents: v.optional(v.array(v.string()), [])
})

const IdentitySchema = v.object({ name: v.nullable(v.string()), email: v.nullable(v.string()) })

export type GitIdentity = v.InferOutput<typeof IdentitySchema>
export type GitFileChange = v.InferOutput<typeof FileChangeSchema>
export type GitStatus = NonNullable<v.InferOutput<typeof StatusSchema>>
export type GitCommit = v.InferOutput<typeof CommitSchema>

export const HISTORY_LIMIT = 50

export async function readGitStatus(documentPath: string): Promise<GitStatus | null> {
  return v.parse(StatusSchema, await call('git.status', documentPath))
}

export async function readGitHistory(documentPath: string): Promise<GitCommit[]> {
  return v.parse(v.array(CommitSchema), await call('git.log', documentPath, HISTORY_LIMIT))
}

export async function startGitRepository(documentPath: string): Promise<void> {
  await call('git.init', documentPath)
}

/** Records every change in the repository as one version. */
export async function commitVersion(documentPath: string, message: string): Promise<void> {
  await call('git.commit', documentPath, message)
}

/** The trailer a version names an agent with, one line per agent. */
export const AGENT_TRAILER = 'Kalka-Agent'

/** A version's message with a trailer for each agent whose changes it holds. */
export function versionMessage(message: string, agents: readonly string[]): string {
  const names = compact(uniq(agents.map((name) => name.replaceAll(/[\r\n,]/g, ' ').trim())))
  if (names.length === 0) return message
  return `${message.trimEnd()}\n\n${names.map((name) => `${AGENT_TRAILER}: ${name}`).join('\n')}`
}

/** Puts the document's folder back to a version; recording the result is the caller's. */
export async function restoreVersion(documentPath: string, hash: string): Promise<void> {
  await call('git.restore', documentPath, hash)
}

/**
 * Versions in bursts: consecutive versions by the same person with the same agents, each within
 * `gap` of the next, read as one stretch of work.
 */
export interface VersionBurst {
  author: string
  agents: string[]
  commits: GitCommit[]
}

export const BURST_GAP_SECONDS = 30 * 60

export function versionBursts(
  history: readonly GitCommit[],
  gap = BURST_GAP_SECONDS
): VersionBurst[] {
  const bursts: VersionBurst[] = []
  for (const commit of history) {
    const last = bursts.at(-1)
    const previous = last?.commits.at(-1)
    const sameAgents =
      last !== undefined &&
      last.agents.length === commit.agents.length &&
      last.agents.every((name) => commit.agents.includes(name))
    if (
      last &&
      previous &&
      last.author === commit.author &&
      sameAgents &&
      previous.time - commit.time <= gap
    )
      last.commits.push(commit)
    else bursts.push({ author: commit.author, agents: [...commit.agents], commits: [commit] })
  }
  return bursts
}

const BranchesSchema = v.object({ current: v.nullable(v.string()), branches: v.array(v.string()) })
const BranchChangeSchema = v.object({ path: v.string(), status: v.string() })

export type GitBranches = v.InferOutput<typeof BranchesSchema>
export type GitBranchChange = v.InferOutput<typeof BranchChangeSchema>

export async function readGitBranches(documentPath: string): Promise<GitBranches> {
  return v.parse(BranchesSchema, await call('git.branches', documentPath))
}

/** Starts a branch from the current version and moves onto it. */
export async function createGitBranch(documentPath: string, name: string): Promise<void> {
  await call('git.createBranch', documentPath, name)
}

export async function switchGitBranch(documentPath: string, name: string): Promise<void> {
  await call('git.switchBranch', documentPath, name)
}

/** The files a branch changed since it left the current one. */
export async function readBranchChanges(
  documentPath: string,
  name: string
): Promise<GitBranchChange[]> {
  return v.parse(v.array(BranchChangeSchema), await call('git.branchChanges', documentPath, name))
}

/** Merges a branch into the current one; changes that meet leave everything as it was. */
export async function mergeGitBranch(documentPath: string, name: string): Promise<void> {
  await call('git.merge', documentPath, name)
}

export async function deleteGitBranch(documentPath: string, name: string): Promise<void> {
  await call('git.deleteBranch', documentPath, name)
}

export async function pullVersions(documentPath: string): Promise<void> {
  await call('git.pull', documentPath)
}

export async function pushVersions(documentPath: string): Promise<void> {
  await call('git.push', documentPath)
}

/** The address versions are published to, such as a GitHub repository; null when none is set. */
export async function readGitRemote(documentPath: string): Promise<string | null> {
  return v.parse(v.nullable(v.string()), await call('git.remote', documentPath))
}

export async function connectGitRemote(documentPath: string, url: string): Promise<void> {
  await call('git.connect', documentPath, url)
}

export async function readGitIdentity(documentPath: string): Promise<GitIdentity> {
  return v.parse(IdentitySchema, await call('git.identity', documentPath))
}

export async function saveGitIdentity(
  documentPath: string,
  name: string,
  email: string
): Promise<void> {
  await call('git.setIdentity', documentPath, name, email)
}

/** Paths relative to the repository read better than absolute ones; the file's own comes first. */
export function sortChanges(
  files: readonly GitFileChange[],
  root: string,
  documentPath: string
): GitFileChange[] {
  const own = documentPath.startsWith(`${root}/`) ? documentPath.slice(root.length + 1) : ''
  const rank = (change: GitFileChange) => (change.path === own ? 0 : 1)
  return [...files].sort((a, b) => rank(a) - rank(b) || a.path.localeCompare(b.path))
}

export type GitChangeKind = 'added' | 'conflict' | 'deleted' | 'modified'

/** A porcelain status as a single letter and the kind of change it is. */
export function changeKind(code: string): { letter: string; kind: GitChangeKind } {
  if (code === '??') return { letter: 'N', kind: 'added' }
  if (code.includes('U')) return { letter: '!', kind: 'conflict' }
  if (code.includes('D')) return { letter: 'D', kind: 'deleted' }
  if (code.includes('A')) return { letter: 'A', kind: 'added' }
  if (code.includes('R')) return { letter: 'R', kind: 'modified' }
  return { letter: 'M', kind: 'modified' }
}
