import { execFile } from 'node:child_process'

/** How long a client's CLI may take; Claude Code can be slow to start on Windows. */
const CLI_TIMEOUT = 30_000
/** The end of a CLI's output kept to explain a failure. */
const MAX_OUTPUT = 4096

/** A program and its arguments, ready for `execFile`. */
export interface CommandLine {
  command: string
  args: string[]
  /** Set when `args` are already quoted for `cmd.exe` and Node must pass them as they are. */
  windowsVerbatimArguments?: boolean
}

/** What a CLI run returned: whether it exited with 0, and what it printed. */
export interface CLIResult {
  ok: boolean
  output: string
}

export type RunCLI = (executable: string, args: string[], path: string) => Promise<CLIResult>

/** Characters `cmd.exe` treats specially outside quotes, escaped with `^` (as cross-spawn does). */
const CMD_META = /[()[\]%!^"`<>&|;, *?]/g
/** Characters no amount of `^` keeps `cmd.exe` from expanding or splitting a line on. */
const CMD_UNSAFE = /[%!\r\n\0]/

/** One argument quoted the way `CommandLineToArgvW` and the C runtime read it back. */
export function quoteWindowsArgument(argument: string): string {
  let quoted = '"'
  let backslashes = 0
  for (const char of argument) {
    if (char === '\\') {
      backslashes++
      continue
    }
    quoted +=
      char === '"' ? `${'\\'.repeat(backslashes * 2 + 1)}"` : `${'\\'.repeat(backslashes)}${char}`
    backslashes = 0
  }
  return `${quoted}${'\\'.repeat(backslashes * 2)}"`
}

function escapeCmd(text: string): string {
  return text.replace(CMD_META, '^$&')
}

/**
 * The command line that runs `executable` with `args`. Node refuses to start `.cmd` and `.bat`
 * files without a shell (CVE-2024-27980), and an npm install of a CLI on Windows is such a
 * file (`%APPDATA%\npm\claude.cmd`), so those run through `cmd.exe /d /s /c` with every
 * argument quoted and its metacharacters escaped twice: once for `cmd.exe` and once more for
 * the shim, which hands its arguments on with `%*` and so parses them again. Returns null when
 * an argument holds a character `cmd.exe` would expand whatever the escaping.
 */
export function cliCommandLine(
  executable: string,
  args: string[],
  platform: NodeJS.Platform = process.platform,
  comspec: string = process.env.ComSpec ?? 'cmd.exe'
): CommandLine | null {
  if (platform !== 'win32' || !/\.(?:cmd|bat)$/i.test(executable)) {
    return { command: executable, args }
  }
  if ([executable, ...args].some((part) => CMD_UNSAFE.test(part))) return null
  const line = [
    escapeCmd(executable),
    ...args.map((argument) => escapeCmd(escapeCmd(quoteWindowsArgument(argument))))
  ].join(' ')
  return { command: comspec, args: ['/d', '/s', '/c', `"${line}"`], windowsVerbatimArguments: true }
}

/** The environment with `path` as its only PATH; Windows spells it `Path`, and keys differ only in case. */
export function withPath(env: NodeJS.ProcessEnv, path: string): NodeJS.ProcessEnv {
  const next = { ...env }
  for (const key of Object.keys(next)) if (key.toUpperCase() === 'PATH') delete next[key]
  next.PATH = path
  return next
}

function lastOutput(...parts: (string | undefined)[]): string {
  const text = parts
    .map((part) => part?.trim() ?? '')
    .filter((part) => part.length > 0)
    .join('\n')
  return text.length > MAX_OUTPUT ? text.slice(-MAX_OUTPUT) : text
}

/** Runs a client's CLI and keeps what it printed, so a failure can say why. */
export const runCLI: RunCLI = (executable, args, path) => {
  const line = cliCommandLine(executable, args)
  if (!line) {
    return Promise.resolve({
      ok: false,
      output: `Kalka cannot pass these arguments to ${executable} safely through cmd.exe.`
    })
  }
  return new Promise((resolve) => {
    execFile(
      line.command,
      line.args,
      {
        timeout: CLI_TIMEOUT,
        windowsHide: true,
        windowsVerbatimArguments: line.windowsVerbatimArguments,
        env: withPath(process.env, path)
      },
      (error, stdout, stderr) => {
        resolve({
          ok: !error,
          output: error ? lastOutput(stderr, stdout, error.message) : lastOutput(stdout)
        })
      }
    )
  })
}
