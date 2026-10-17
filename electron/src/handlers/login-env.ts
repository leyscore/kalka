import { execFile } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { basename } from 'node:path'

/**
 * Apps started from the Finder or a desktop launcher get a bare environment, without what the
 * user's shell profile adds (Homebrew, npm, bun, nvm, mise). This reads the environment of an
 * interactive login shell once, the way a terminal would see it, so CLIs such as `claude`,
 * `codex` or `gemini` are found where the user installed them. Windows apps inherit the user's
 * environment already, and get none.
 */

/** How long a slow profile may take before Kalka gives up and keeps its own environment. */
export const LOGIN_SHELL_TIMEOUT = 5000

/** Shells that take `-l -i -c` and run `env` as a command. */
const SUPPORTED_SHELLS = new Set(['zsh', 'bash', 'sh', 'ksh', 'fish', 'dash'])

/**
 * The variables between two markers in `env -0` output. Profiles may print banners before or
 * after; the random marker sets the dump apart from them.
 */
export function parseEnvDump(output: string, marker: string): Record<string, string> | null {
  const start = output.indexOf(marker)
  if (start < 0) return null
  const end = output.indexOf(marker, start + marker.length)
  if (end < 0) return null
  const env: Record<string, string> = {}
  for (const entry of output.slice(start + marker.length, end).split('\0')) {
    const separator = entry.indexOf('=')
    if (separator <= 0) continue
    env[entry.slice(0, separator)] = entry.slice(separator + 1)
  }
  return env
}

export interface LoginShellOptions {
  shell?: string
  timeout?: number
  /** The environment the shell starts from. */
  env?: NodeJS.ProcessEnv
}

/** Runs the user's login shell once and returns its environment, or null when that fails. */
export function readLoginShellEnv(
  options: LoginShellOptions = {}
): Promise<Record<string, string> | null> {
  const shell = options.shell ?? process.env.SHELL ?? '/bin/zsh'
  const name = basename(shell)
  if (!SUPPORTED_SHELLS.has(name)) return Promise.resolve(null)
  const marker = `__KALKA_ENV_${randomBytes(8).toString('hex')}__`
  // `printf` is a builtin in every supported shell; `env` is the system binary, so a shell
  // function of the same name cannot change its output.
  const command = `printf '%s' '${marker}'; /usr/bin/env -0; printf '%s' '${marker}'`
  return new Promise((resolve) => {
    const child = execFile(
      shell,
      ['-l', '-i', '-c', command],
      {
        timeout: options.timeout ?? LOGIN_SHELL_TIMEOUT,
        maxBuffer: 4 * 1024 * 1024,
        env: {
          ...(options.env ?? process.env),
          // Keep oh-my-zsh from prompting for updates and tmux plugins from attaching.
          DISABLE_AUTO_UPDATE: 'true',
          ZSH_TMUX_AUTOSTARTED: 'true',
          ZSH_TMUX_AUTOSTART: 'false'
        }
      },
      (_error, stdout) => resolve(parseEnvDump(stdout, marker))
    )
    // An interactive shell must not wait for input that never comes.
    child.stdin?.end()
  })
}

let cached: Promise<Record<string, string> | null> | null = null

/** The login shell's environment, read once per app run; null on Windows or when it fails. */
export function loginShellEnv(): Promise<Record<string, string> | null> {
  if (process.platform === 'win32') return Promise.resolve(null)
  cached ??= readLoginShellEnv()
  return cached
}

/** The login shell's PATH, or null when it could not be read. */
export async function loginShellPath(): Promise<string | null> {
  return (await loginShellEnv())?.PATH || null
}
