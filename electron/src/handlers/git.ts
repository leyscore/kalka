import { execFile } from 'node:child_process'
import { stat } from 'node:fs/promises'
import { dirname, isAbsolute, relative, sep } from 'node:path'

import * as v from 'valibot'

import { registerAll, type CallContext } from '../ipc'
import { inheritedEnv } from './shell'

/**
 * Git for the document's folder, through the `git` the person already has. The page names an
 * operation, never a command line: each handler runs one fixed git invocation in a repository
 * found from a document path, with arguments it builds itself.
 */
const TIMEOUT_MS = 30_000
const NETWORK_TIMEOUT_MS = 120_000
const MAX_OUTPUT = 8 * 1024 * 1024
const MAX_LOG = 200

class GitError extends Error {}

async function git(cwd: string, args: string[], timeout = TIMEOUT_MS): Promise<string> {
  const env = await inheritedEnv({ GIT_TERMINAL_PROMPT: '0', LC_ALL: 'C' })
  return new Promise((resolve, reject) => {
    execFile(
      'git',
      args,
      { cwd, env, timeout, maxBuffer: MAX_OUTPUT, windowsHide: true },
      (error, stdout, stderr) => {
        if (!error) return resolve(stdout)
        const detail = stderr.trim().split('\n').at(-1) || error.message
        reject(new GitError(detail))
      }
    )
  })
}

const AbsolutePath = v.pipe(
  v.string(),
  v.check((path) => isAbsolute(path), 'Expected an absolute path')
)

/** The folder a path stands for: itself when it is one, else the folder holding the file. */
async function folderOf(path: string): Promise<string> {
  try {
    return (await stat(path)).isDirectory() ? path : dirname(path)
  } catch {
    return dirname(path)
  }
}

/** The repository a document lives in, or null when it is in none or git is missing. */
async function repositoryOf(path: string): Promise<string | null> {
  try {
    return (await git(await folderOf(path), ['rev-parse', '--show-toplevel'])).trim() || null
  } catch {
    return null
  }
}

export interface GitFileChange {
  path: string
  /** Two-letter porcelain status: staged then unstaged, such as ` M`, `??` or `A `. */
  status: string
}

export interface GitStatus {
  root: string
  branch: string | null
  upstream: string | null
  ahead: number
  behind: number
  files: GitFileChange[]
}

/** Reads `git status --porcelain=v2 --branch -z`. */
function parseStatus(root: string, output: string): GitStatus {
  const status: GitStatus = { root, branch: null, upstream: null, ahead: 0, behind: 0, files: [] }
  const records = output.split('\0')
  for (let index = 0; index < records.length; index++) {
    const record = records[index]
    if (record.startsWith('# branch.head ')) {
      const head = record.slice('# branch.head '.length)
      status.branch = head === '(detached)' ? null : head
    } else if (record.startsWith('# branch.upstream ')) {
      status.upstream = record.slice('# branch.upstream '.length)
    } else if (record.startsWith('# branch.ab ')) {
      const [ahead, behind] = record.slice('# branch.ab '.length).split(' ')
      status.ahead = Math.abs(Number(ahead))
      status.behind = Math.abs(Number(behind))
    } else if (record.startsWith('1 ')) {
      const fields = record.split(' ')
      status.files.push({ status: fields[1].replaceAll('.', ' '), path: fields.slice(8).join(' ') })
    } else if (record.startsWith('2 ')) {
      // A rename names the new path here and the old one in the next record.
      const fields = record.split(' ')
      status.files.push({ status: fields[1].replaceAll('.', ' '), path: fields.slice(9).join(' ') })
      index++
    } else if (record.startsWith('? ')) {
      status.files.push({ status: '??', path: record.slice(2) })
    } else if (record.startsWith('u ')) {
      status.files.push({ status: 'UU', path: record.split(' ').slice(10).join(' ') })
    }
  }
  return status
}

export interface GitCommit {
  hash: string
  author: string
  /** Epoch seconds. */
  time: number
  subject: string
}

function parseLog(output: string): GitCommit[] {
  return output
    .split('\x1e')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [hash, author, time, subject] = entry.split('\x1f')
      return { hash, author, time: Number(time), subject }
    })
}

/** Paths a commit may include: inside the repository, never options. */
function repositoryPaths(root: string, paths: string[]): string[] {
  return paths.map((path) => {
    const inside = relative(root, isAbsolute(path) ? path : `${root}${sep}${path}`)
    if (!inside || inside.startsWith('..') || isAbsolute(inside)) {
      throw new GitError(`${path} is outside the repository`)
    }
    return inside
  })
}

async function requireRepository(documentPath: unknown): Promise<string> {
  const path = v.parse(AbsolutePath, documentPath)
  const root = await repositoryOf(path)
  if (!root) throw new GitError('This document is not in a Git repository')
  return root
}

/**
 * The part of the repository a document owns: its folder. A design kept inside a larger
 * repository, such as an app's, records and lists only its own files, never the rest.
 */
async function documentScope(root: string, documentPath: unknown): Promise<string> {
  const folder = await folderOf(v.parse(AbsolutePath, documentPath))
  return relative(root, folder) || '.'
}

export const gitHandlers = {
  /** The repository holding a document, with its branch and changes; null when there is none. */
  async status(_context: CallContext, documentPath: unknown): Promise<GitStatus | null> {
    const path = v.parse(AbsolutePath, documentPath)
    const root = await repositoryOf(path)
    if (!root) return null
    const scope = await documentScope(root, path)
    return parseStatus(
      root,
      await git(root, [
        'status',
        '--porcelain=v2',
        '--branch',
        '-z',
        '--untracked-files=all',
        '--',
        scope
      ])
    )
  },
  async log(_context: CallContext, documentPath: unknown, limit: unknown): Promise<GitCommit[]> {
    const root = await requireRepository(documentPath)
    const count = v.parse(v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(MAX_LOG)), limit)
    try {
      return parseLog(
        await git(root, ['log', `-n${count}`, '--format=%H%x1f%an%x1f%at%x1f%s%x1e'])
      )
    } catch {
      // A repository without commits has no history yet.
      return []
    }
  },
  /** Starts a repository in the document's folder. */
  async init(_context: CallContext, documentPath: unknown): Promise<string> {
    const folder = await folderOf(v.parse(AbsolutePath, documentPath))
    await git(folder, ['init'])
    return folder
  },
  /** Records the given changes, or all of the document's folder, as one commit. */
  async commit(
    _context: CallContext,
    documentPath: unknown,
    message: unknown,
    paths: unknown
  ): Promise<string> {
    const root = await requireRepository(documentPath)
    const text = v.parse(v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(10_000)), message)
    const chosen = v.parse(v.optional(v.array(v.string())), paths)
    const scope =
      chosen && chosen.length > 0
        ? repositoryPaths(root, chosen)
        : [await documentScope(root, documentPath)]
    await git(root, ['add', '--all', '--', ...scope])
    // Only these paths: anything else already staged in the repository stays as it was.
    await git(root, ['commit', '--message', text, '--', ...scope])
    return (await git(root, ['rev-parse', 'HEAD'])).trim()
  },
  async pull(_context: CallContext, documentPath: unknown): Promise<void> {
    const root = await requireRepository(documentPath)
    await git(root, ['pull', '--ff-only'], NETWORK_TIMEOUT_MS)
  },
  async push(_context: CallContext, documentPath: unknown): Promise<void> {
    const root = await requireRepository(documentPath)
    await git(root, ['push'], NETWORK_TIMEOUT_MS)
  }
}

export function registerGitHandlers(): void {
  registerAll(gitHandlers, 'git')
}
