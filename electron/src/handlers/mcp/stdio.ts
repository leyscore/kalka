import { spawn, type ChildProcess } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { app, dialog } from 'electron'
import * as v from 'valibot'

import { emit, registerAll, type CallContext } from '../../ipc'
import { inheritedEnv } from '../shell'

/** What a server wrote to stderr last, kept to explain why it stopped. */
const MAX_STDERR = 4096
const MAX_COMMAND = 4096

const StartRequest = v.object({
  command: v.pipe(v.string(), v.minLength(1), v.maxLength(MAX_COMMAND)),
  args: v.array(v.pipe(v.string(), v.maxLength(MAX_COMMAND))),
  env: v.record(v.pipe(v.string(), v.regex(/^[A-Za-z_][A-Za-z0-9_]*$/)), v.string())
})
const ApprovedJSON = v.pipe(v.string(), v.parseJson(), v.array(v.string()))

const servers = new Map<number, ChildProcess>()

function approvalsFile(): string {
  return join(app.getPath('userData'), 'mcp-stdio-approved.json')
}

async function readApprovals(): Promise<string[]> {
  try {
    const parsed = v.safeParse(ApprovedJSON, await readFile(approvalsFile(), 'utf8'))
    return parsed.success ? parsed.output : []
  } catch {
    return []
  }
}

/**
 * A page cannot start a program on its own say: the first time a command line runs, the person
 * approves it in a native dialog the page cannot draw or click. Approval is per exact command
 * line; changing a single argument asks again.
 */
async function approve(context: CallContext, command: string, args: string[]): Promise<boolean> {
  const key = JSON.stringify([command, ...args])
  const approvals = await readApprovals()
  if (approvals.includes(key)) return true
  const french = app.getLocale().startsWith('fr')
  const options = {
    type: 'question' as const,
    buttons: french ? ['Autoriser', 'Annuler'] : ['Allow', 'Cancel'],
    defaultId: 1,
    cancelId: 1,
    message: french ? 'Démarrer ce serveur MCP ?' : 'Start this MCP server?',
    detail: `${[command, ...args].join(' ')}\n\n${
      french
        ? 'Kalka va lancer ce programme sur cet ordinateur, avec vos droits, pour que l’IA utilise ses outils.'
        : 'Kalka will run this program on this computer, with your permissions, so the AI can use its tools.'
    }`
  }
  const { response } = context.window
    ? await dialog.showMessageBox(context.window, options)
    : await dialog.showMessageBox(options)
  if (response !== 0) return false
  await writeFile(approvalsFile(), JSON.stringify([...approvals, key]))
  return true
}

/** Splits a stream into lines, as stdio MCP frames one JSON-RPC message per line. */
function lines(send: (line: string) => void) {
  let pending = ''
  return (chunk: Buffer) => {
    pending += chunk.toString('utf8')
    const parts = pending.split('\n')
    pending = parts.pop() ?? ''
    for (const part of parts) if (part.trim()) send(part.replace(/\r$/, ''))
  }
}

const ApproveRequest = v.object({ command: StartRequest.entries.command, args: StartRequest.entries.args })

export const mcpStdioHandlers = {
  /** Asks to allow a command line an agent will start itself, as `start` does for Kalka. */
  async approve(context: CallContext, request: unknown): Promise<boolean> {
    const parsed = v.safeParse(ApproveRequest, request)
    if (!parsed.success) throw new Error('Invalid MCP server command')
    return approve(context, parsed.output.command, parsed.output.args)
  },
  async start(context: CallContext, request: unknown): Promise<number> {
    const parsed = v.safeParse(StartRequest, request)
    if (!parsed.success) throw new Error('Invalid MCP server command')
    const { command, args, env } = parsed.output
    if (!(await approve(context, command, args))) throw new Error('The MCP server was not allowed')
    const child = spawn(command, args, {
      env: await inheritedEnv(env),
      stdio: 'pipe',
      windowsHide: true
    })
    const pid = await new Promise<number>((resolve, reject) => {
      child.once('spawn', () => resolve(child.pid ?? -1))
      child.once('error', reject)
    })
    servers.set(pid, child)
    const sender = context.sender
    let stderr = ''
    child.stdout.on(
      'data',
      lines((line) => emit(sender, `mcp-stdio:${pid}:message`, line))
    )
    child.stderr.on('data', (chunk: Buffer) => {
      stderr = (stderr + chunk.toString('utf8')).slice(-MAX_STDERR)
    })
    child.on('close', (code) => {
      servers.delete(pid)
      emit(sender, `mcp-stdio:${pid}:close`, { code, stderr })
    })
    sender.once('destroyed', () => child.kill())
    return pid
  },
  send(_context: CallContext, pid: number, message: string): Promise<void> {
    const child = servers.get(pid)
    if (!child?.stdin) throw new Error('The MCP server has stopped')
    const { stdin } = child
    return new Promise((resolve, reject) => {
      stdin.write(`${message}\n`, (error) => {
        if (error) reject(error)
        else resolve()
      })
    })
  },
  close(_context: CallContext, pid: number): void {
    servers.get(pid)?.kill()
  }
}

export function registerMCPStdioHandlers(): void {
  registerAll(mcpStdioHandlers, 'mcpStdio')
  app.on('before-quit', () => {
    for (const child of servers.values()) child.kill()
  })
}
