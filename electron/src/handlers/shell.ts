import { spawn, type ChildProcess, execFile } from 'node:child_process'
import { constants } from 'node:os'

import capabilities from '../../../desktop/capabilities/default.json'
import { emit, registerAll, type CallContext } from '../ipc'
import { BUNDLED_MCP_HTTP, bundledMCPCommand, bundledMCPScript } from './mcp/bundled'

type ArgRule = string | { validator: string }
interface ScopeEntry {
  name: string
  cmd: string
  args: boolean | ArgRule[]
}

/**
 * The programs the editor may start, and the exact arguments each takes: the same allowlist
 * the Tauri build enforced, read from its capability file so there is one source of truth.
 */
const scope: ScopeEntry[] = (capabilities.permissions as unknown[]).flatMap((permission) =>
  typeof permission === 'object' &&
  permission !== null &&
  (permission as { identifier?: string }).identifier === 'shell:allow-spawn'
    ? ((permission as { allow: ScopeEntry[] }).allow ?? [])
    : []
)

/** The full command line for an allowlisted name, or an error naming what was refused. */
export function resolveAllowed(name: string, args: string[]): { cmd: string; args: string[] } {
  const entry = scope.find((candidate) => candidate.name === name)
  if (!entry) throw new Error(`Program not allowed: ${name}`)
  if (entry.args === true) return { cmd: entry.cmd, args }
  const rules = entry.args === false ? [] : entry.args
  if (rules.length !== args.length) throw new Error(`Arguments not allowed for ${name}`)
  rules.forEach((rule, index) => {
    const ok =
      typeof rule === 'string' ? rule === args[index] : new RegExp(rule.validator).test(args[index])
    if (!ok) throw new Error(`Argument ${index} not allowed for ${name}`)
  })
  return { cmd: entry.cmd, args }
}

/** The editor starts the MCP server by its global name; the copy bundled with the app wins. */
const MCP_SERVER_NAMES = new Set(['kalka-mcp-http', 'cmd-kalka-mcp-http'])

async function resolveProgram(
  name: string,
  args: string[]
): Promise<{ cmd: string; args: string[]; env: Record<string, string> }> {
  const script = MCP_SERVER_NAMES.has(name) ? await bundledMCPScript(BUNDLED_MCP_HTTP) : null
  if (script) {
    const bundled = bundledMCPCommand(script)
    return { cmd: bundled.command, args: bundled.args, env: bundled.env }
  }
  return { ...resolveAllowed(name, args), env: {} }
}

/**
 * Apps started from the Finder get a bare PATH. Read the login shell's once, so programs
 * installed with npm, Homebrew or bun are found as they are in a terminal.
 */
let shellPath: Promise<string | null> | null = null
export function loginShellPath(): Promise<string | null> {
  if (process.platform === 'win32') return Promise.resolve(null)
  shellPath ??= new Promise((resolve) => {
    const shell = process.env.SHELL || '/bin/zsh'
    execFile(shell, ['-ilc', 'printf "%s" "$PATH"'], { timeout: 5000 }, (error, stdout) =>
      resolve(error ? null : stdout.trim().split('\n').pop() || null)
    )
  })
  return shellPath
}

export async function inheritedEnv(extra: Record<string, string> = {}): Promise<NodeJS.ProcessEnv> {
  const path = await loginShellPath()
  return { ...process.env, ...(path ? { PATH: path } : {}), ...extra }
}

const children = new Map<number, ChildProcess>()

function signalNumber(signal: NodeJS.Signals | null): number | null {
  return signal ? (constants.signals[signal] ?? null) : null
}

/** Emits text output line by line, as Tauri does for commands without raw encoding. */
function lineEmitter(send: (line: string) => void) {
  let pending = ''
  return {
    push(chunk: Buffer) {
      pending += chunk.toString('utf8')
      const lines = pending.split('\n')
      pending = lines.pop() ?? ''
      for (const line of lines) send(line.replace(/\r$/, ''))
    },
    flush() {
      if (pending) send(pending)
      pending = ''
    }
  }
}

export const shellHandlers = {
  async spawn(
    context: CallContext,
    name: string,
    args: string[],
    options: { cwd?: string; env?: Record<string, string>; raw?: boolean }
  ) {
    const allowed = await resolveProgram(name, args)
    const child = spawn(allowed.cmd, allowed.args, {
      cwd: options.cwd,
      env: await inheritedEnv({ ...options.env, ...allowed.env }),
      stdio: 'pipe',
      windowsHide: true
    })
    const sender = context.sender
    // A spawn error comes after the pid is known, or with none at all.
    const pid = await new Promise<number>((resolve, reject) => {
      child.once('spawn', () => resolve(child.pid ?? -1))
      child.once('error', reject)
    })
    children.set(pid, child)
    const send = (event: string, payload?: unknown) =>
      emit(sender, `shell:${pid}:${event}`, payload)
    const streams = (['stdout', 'stderr'] as const).map((stream) => {
      if (options.raw) {
        child[stream].on('data', (chunk: Buffer) => send(stream, new Uint8Array(chunk)))
        return null
      }
      const lines = lineEmitter((line) => send(stream, line))
      child[stream].on('data', (chunk: Buffer) => lines.push(chunk))
      return lines
    })
    child.on('error', (error) => send('error', error.message))
    child.on('close', (code, signal) => {
      for (const lines of streams) lines?.flush()
      children.delete(pid)
      send('close', { code, signal: signalNumber(signal) })
    })
    sender.once('destroyed', () => child.kill())
    return pid
  },
  write(_context: CallContext, pid: number, data: Uint8Array) {
    const child = children.get(pid)
    if (!child?.stdin) throw new Error('The process has exited')
    return new Promise<void>((resolve, reject) =>
      child.stdin?.write(Buffer.from(data), (error) => (error ? reject(error) : resolve()))
    )
  },
  kill(_context: CallContext, pid: number) {
    children.get(pid)?.kill()
  }
}

export function registerShellHandlers(): void {
  registerAll(shellHandlers, 'shell')
  void loginShellPath()
}
