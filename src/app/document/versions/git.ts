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
  subject: v.string()
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
