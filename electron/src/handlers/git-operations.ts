import { execFile } from 'node:child_process'
import { realpath, stat, writeFile } from 'node:fs/promises'
import { basename, dirname, isAbsolute, join, relative, sep } from 'node:path'

import * as v from 'valibot'

import { RemoteURL } from './git-remote'
import { loginShellPath } from './login-env'

/**
 * Git for the document's folder, through the `git` the person already has. The page names an
 * operation, never a command line: each handler runs one fixed git invocation in a repository
 * found from a document path, with arguments it builds itself.
 */
const TIMEOUT_MS = 30_000
const NETWORK_TIMEOUT_MS = 120_000
const MAX_OUTPUT = 8 * 1024 * 1024
const MAX_LOG = 200
/** What a repository Kalka starts leaves out: the files macOS and Windows scatter in folders. */
const IGNORED_AT_START = '.DS_Store\nThumbs.db\n'
/** The one remote Kalka sets up and publishes to. */
const REMOTE = 'origin'

export class GitError extends Error {}

/** The environment git runs in: the login shell's PATH, so the person's own git is found. */
async function gitEnv(extra: Record<string, string>): Promise<NodeJS.ProcessEnv> {
  const path = await loginShellPath()
  return { ...process.env, ...(path ? { PATH: path } : {}), ...extra }
}

/** A file's bytes as git holds them, for files that may not be text. */
export async function gitBytes(cwd: string, args: string[]): Promise<Uint8Array> {
  const env = await gitEnv({ GIT_TERMINAL_PROMPT: '0', LC_ALL: 'C' })
  return new Promise((resolve, reject) => {
    execFile(
      'git',
      args,
      {
        cwd,
        env,
        timeout: TIMEOUT_MS,
        maxBuffer: MAX_OUTPUT * 4,
        encoding: 'buffer',
        windowsHide: true
      },
      (error, stdout, stderr) => {
        if (!error) return resolve(new Uint8Array(stdout))
        reject(new GitError(stderr.toString().trim().split('\n').at(-1) || error.message))
      }
    )
  })
}

export async function git(cwd: string, args: string[], timeout = TIMEOUT_MS): Promise<string> {
  const env = await gitEnv({ GIT_TERMINAL_PROMPT: '0', LC_ALL: 'C' })
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

const IdentityPart = v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(200))

export interface GitIdentity {
  name: string | null
  email: string | null
}

/** A configuration value, or null when it is not set. */
async function configValue(cwd: string, key: string): Promise<string | null> {
  try {
    return (await git(cwd, ['config', '--get', key])).trim() || null
  } catch {
    return null
  }
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

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
  /** Agents whose changes the version holds, from its `Kalka-Agent` trailers. */
  agents: string[]
}

/** The trailer a version names an agent with, one per agent. */
const AGENT_TRAILER = 'Kalka-Agent'
/** A version to restore: an abbreviated or full commit hash, never an option or a range. */
const CommitHash = v.pipe(v.string(), v.regex(/^[0-9a-f]{7,40}$/i, 'Expected a commit hash'))

function parseLog(output: string): GitCommit[] {
  return output
    .split('\x1e')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [hash, author, time, subject, agents = ''] = entry.split('\x1f')
      return {
        hash,
        author,
        time: Number(time),
        subject,
        agents: agents
          .split(',')
          .map((name) => name.trim())
          .filter(Boolean)
      }
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

export async function requireRepository(documentPath: unknown): Promise<string> {
  const path = v.parse(AbsolutePath, documentPath)
  const root = await repositoryOf(path)
  if (!root) throw new GitError('This document is not in a Git repository')
  return root
}

/**
 * The part of the repository a document owns: its folder. A design kept inside a larger
 * repository, such as an app's, records and lists only its own files, never the rest.
 */
/**
 * The paths a document's versions hold: a Kalka folder's whole folder, a document file alone,
 * so a `.fig` kept in a repository never records or restores the files beside it.
 */
export async function documentScope(root: string, documentPath: unknown): Promise<string> {
  const path = v.parse(AbsolutePath, documentPath)
  const folder = await folderOf(path)
  // Git names the repository by its real path; a folder reached through a link, such as macOS's
  // /var for /private/var, must be compared the same way.
  const real = await realpath(folder).catch(() => folder)
  const scope = relative(root, real) || '.'
  if (folder === path) return scope
  const file = basename(path)
  return scope === '.' ? file : join(scope, file)
}

/** The page's calls; none needs to know which window made it. */
export const gitHandlers = {
  /** The repository holding a document, with its branch and changes; null when there is none. */
  async status(_context: unknown, documentPath: unknown): Promise<GitStatus | null> {
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
  async log(_context: unknown, documentPath: unknown, limit: unknown): Promise<GitCommit[]> {
    const root = await requireRepository(documentPath)
    const count = v.parse(
      v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(MAX_LOG)),
      limit
    )
    try {
      return parseLog(
        await git(root, [
          'log',
          `-n${count}`,
          `--format=%H%x1f%an%x1f%at%x1f%s%x1f%(trailers:key=${AGENT_TRAILER},valueonly,separator=%x2c)%x1e`
        ])
      )
    } catch {
      // A repository without commits has no history yet.
      return []
    }
  },
  /** Starts a repository in the document's folder. */
  async init(_context: unknown, documentPath: unknown): Promise<string> {
    const folder = await folderOf(v.parse(AbsolutePath, documentPath))
    await git(folder, ['init'])
    // The files a computer leaves beside a design are not part of it.
    const ignore = join(folder, '.gitignore')
    if (!(await exists(ignore))) await writeFile(ignore, IGNORED_AT_START)
    return folder
  },
  /** Records the given changes, or all of the document's folder, as one commit. */
  async commit(
    _context: unknown,
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
  /**
   * Puts the document's folder back to how it was in a version: its files as they were then,
   * files added since removed, in the working tree and the index. The rest of the repository is
   * left alone. Recording the result is the caller's, after it recorded what was there before.
   */
  async restore(_context: unknown, documentPath: unknown, hash: unknown): Promise<void> {
    const root = await requireRepository(documentPath)
    const commit = v.parse(CommitHash, hash)
    const scope = await documentScope(root, documentPath)
    await git(root, ['restore', `--source=${commit}`, '--staged', '--worktree', '--', scope])
  },
  async pull(_context: unknown, documentPath: unknown): Promise<void> {
    const root = await requireRepository(documentPath)
    await git(root, ['pull', '--ff-only'], NETWORK_TIMEOUT_MS)
  },
  /** Publishes the branch; the first time, to the remote it then follows. */
  async push(_context: unknown, documentPath: unknown): Promise<void> {
    const root = await requireRepository(documentPath)
    let follows = true
    try {
      await git(root, ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}'])
    } catch {
      follows = false
    }
    const args = follows ? ['push'] : ['push', '--set-upstream', REMOTE, 'HEAD']
    await git(root, args, NETWORK_TIMEOUT_MS)
  },
  /** The address versions are published to, or null when the repository has none yet. */
  async remote(_context: unknown, documentPath: unknown): Promise<string | null> {
    const root = await requireRepository(documentPath)
    return configValue(root, `remote.${REMOTE}.url`)
  },
  /** Sets where versions are published, replacing an earlier address. */
  async connect(_context: unknown, documentPath: unknown, url: unknown): Promise<void> {
    const root = await requireRepository(documentPath)
    const address = v.parse(RemoteURL, url)
    const known = await configValue(root, `remote.${REMOTE}.url`)
    await git(root, ['remote', known ? 'set-url' : 'add', REMOTE, address])
  },
  /** Who signs the versions: the repository's own name and e-mail, else the computer's. */
  async identity(_context: unknown, documentPath: unknown): Promise<GitIdentity> {
    const folder = await folderOf(v.parse(AbsolutePath, documentPath))
    return {
      name: await configValue(folder, 'user.name'),
      email: await configValue(folder, 'user.email')
    }
  },
  /** Keeps a name and e-mail in this repository alone, leaving the computer's settings as they are. */
  async setIdentity(
    _context: unknown,
    documentPath: unknown,
    name: unknown,
    email: unknown
  ): Promise<void> {
    const root = await requireRepository(documentPath)
    await git(root, ['config', '--local', 'user.name', v.parse(IdentityPart, name)])
    await git(root, [
      'config',
      '--local',
      'user.email',
      v.parse(v.pipe(IdentityPart, v.email()), email)
    ])
  }
}
