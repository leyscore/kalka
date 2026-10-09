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
