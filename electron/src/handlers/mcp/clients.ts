import { execFile } from 'node:child_process'
import { access, copyFile, mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

import { parse as parseTOML, stringify as stringifyTOML } from 'smol-toml'
import * as v from 'valibot'

import { NativeError } from '../../ipc'
import { BUNDLED_MCP_STDIO, bundledMCPCommand, bundledMCPScript } from './bundled'

/** The name Kalka's tools appear under in a client: `mcp__kalka__*`. */
const MCP_SERVER_NAME = 'kalka'
/** The stdio bridge of a global `@kalka/mcp` install, for builds without the bundled one. */
const GLOBAL_MCP_BRIDGE = 'kalka-mcp'

export const MCP_CLIENT_IDS = [
  'claude-desktop',
  'claude-code',
  'cursor',
  'vscode',
  'windsurf',
  'codex',
  'gemini',
  'lm-studio',
  'opencode'
] as const
export type MCPClientID = (typeof MCP_CLIENT_IDS)[number]

/** How a client starts Kalka's stdio bridge, which finds the running app through its discovery file. */
export interface BridgeCommand {
  command: string
  args: string[]
  env: Record<string, string>
}

type Locate = (command: string) => Promise<string | null>

export async function bridgeCommand(locate: Locate): Promise<BridgeCommand> {
  const script = await bundledMCPScript(BUNDLED_MCP_STDIO)
  if (script) return bundledMCPCommand(script)
  const bridge = await locate(GLOBAL_MCP_BRIDGE)
  if (!bridge)
    throw new NativeError(
      `${GLOBAL_MCP_BRIDGE} is not installed. Install @kalka/mcp globally, then connect again.`
    )
  // Clients start servers without a login shell: name the bridge by its full path and put its
  // folder, where Node usually sits too, on the PATH it runs with.
  const pathEntries = [dirname(bridge), '/usr/local/bin', '/opt/homebrew/bin', '/usr/bin', '/bin']
  return {
    command: bridge,
    args: [],
    env: { PATH: process.platform === 'win32' ? dirname(bridge) : pathEntries.join(':') }
  }
}

const home = homedir()
const appData = process.env.APPDATA ?? join(home, 'AppData', 'Roaming')

/** A per-platform folder for apps that follow each system's convention. */
function appSupport(name: string): string {
  if (process.platform === 'darwin') return join(home, 'Library', 'Application Support', name)
  if (process.platform === 'win32') return join(appData, name)
  return join(home, '.config', name)
}

type Format = 'mcpServers' | 'mcpServersTyped' | 'vscode' | 'opencode' | 'codex'

interface ClientDefinition {
  name: string
  /** The configuration file Kalka is added to. */
  file: string
  /** Folders whose presence means the client is installed. */
  installed: string[]
  format: Format
  /** A CLI that adds servers itself; preferred over editing a file the client may rewrite. */
  cli?: { command: string; add: (bridge: BridgeCommand) => string[]; remove: string[] }
}

const CLIENTS: Record<MCPClientID, ClientDefinition> = {
  'claude-desktop': {
    name: 'Claude Desktop',
    file: join(appSupport('Claude'), 'claude_desktop_config.json'),
    installed: [appSupport('Claude')],
    format: 'mcpServers'
  },
  'claude-code': {
    name: 'Claude Code',
    file: join(home, '.claude.json'),
    installed: [join(home, '.claude')],
    format: 'mcpServersTyped',
    cli: {
      command: 'claude',
      add: (bridge) => [
        'mcp',
        'add',
        '--scope',
        'user',
        ...Object.entries(bridge.env).flatMap(([key, value]) => ['-e', `${key}=${value}`]),
        MCP_SERVER_NAME,
        '--',
        bridge.command,
        ...bridge.args
      ],
      remove: ['mcp', 'remove', '--scope', 'user', MCP_SERVER_NAME]
    }
  },
  cursor: {
    name: 'Cursor',
    file: join(home, '.cursor', 'mcp.json'),
    installed: [join(home, '.cursor')],
    format: 'mcpServers'
  },
  vscode: {
    name: 'VS Code',
    file: join(appSupport('Code'), 'User', 'mcp.json'),
    installed: [join(appSupport('Code'), 'User')],
    format: 'vscode'
  },
  windsurf: {
    name: 'Windsurf',
    file: join(home, '.codeium', 'windsurf', 'mcp_config.json'),
    installed: [join(home, '.codeium', 'windsurf')],
    format: 'mcpServers'
  },
  codex: {
    name: 'Codex',
    file: join(home, '.codex', 'config.toml'),
    installed: [join(home, '.codex')],
    format: 'codex'
  },
  gemini: {
    name: 'Gemini CLI',
    file: join(home, '.gemini', 'settings.json'),
    installed: [join(home, '.gemini')],
    format: 'mcpServers'
  },
  'lm-studio': {
    name: 'LM Studio',
    file: join(home, '.lmstudio', 'mcp.json'),
    installed: [join(home, '.lmstudio')],
    format: 'mcpServers'
  },
  opencode: {
    name: 'opencode',
    file: join(home, '.config', 'opencode', 'opencode.json'),
    installed: [join(home, '.config', 'opencode')],
    format: 'opencode'
  }
}

const ConfigJSON = v.pipe(v.string(), v.parseJson(), v.record(v.string(), v.unknown()))
const Servers = v.record(v.string(), v.unknown())

/** The file's text, or null when there is no file yet. */
async function readText(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf8')
  } catch {
    return null
  }
}

function parseConfig(client: ClientDefinition, text: string): Record<string, unknown> {
  if (!text.trim()) return {}
  if (client.format === 'codex') {
    try {
      return parseTOML(text)
    } catch {
      throw new NativeError(
        `${client.name}'s configuration at ${client.file} is not valid TOML. Fix it, then connect again.`
      )
    }
  }
  const parsed = v.safeParse(ConfigJSON, text)
  if (!parsed.success)
    throw new NativeError(
      `${client.name}'s configuration at ${client.file} is not valid JSON. Fix it, then connect again.`
    )
  return parsed.output
}

/** The key each format keeps its servers under, and Kalka's entry in that format. */
function serverEntry(format: Format, bridge: BridgeCommand): { key: string; entry: unknown } {
  const { command, args, env } = bridge
  switch (format) {
    case 'mcpServers':
      return { key: 'mcpServers', entry: { command, args, env } }
    case 'mcpServersTyped':
      return { key: 'mcpServers', entry: { type: 'stdio', command, args, env } }
    case 'vscode':
      return { key: 'servers', entry: { type: 'stdio', command, args, env } }
    case 'opencode':
      return {
        key: 'mcp',
        entry: { type: 'local', command: [command, ...args], environment: env, enabled: true }
      }
    case 'codex':
      return { key: 'mcp_servers', entry: { command, args, env } }
  }
}

function serversKey(format: Format): string {
  return serverEntry(format, { command: '', args: [], env: {} }).key
}

/**
 * Adds Kalka to a client's configuration and keeps every other setting. The previous file is kept
 * beside it as a backup, and the new one replaces it in a single rename. TOML comments do not
 * survive the rewrite; the backup keeps them.
 */
async function writeClientConfig(client: ClientDefinition, bridge: BridgeCommand): Promise<void> {
  const existing = await readText(client.file)
  const config = existing === null ? {} : parseConfig(client, existing)
  const { key, entry } = serverEntry(client.format, bridge)
  const servers = v.safeParse(Servers, config[key] ?? {})
  if (!servers.success)
    throw new NativeError(
      `"${key}" in ${client.file} is not an object. Fix it, then connect again.`
    )
  const next = { ...config, [key]: { ...servers.output, [MCP_SERVER_NAME]: entry } }
  const text =
    client.format === 'codex' ? stringifyTOML(next) : JSON.stringify(next, null, 2)
  await mkdir(dirname(client.file), { recursive: true })
  if (existing !== null) await copyFile(client.file, `${client.file}.kalka-backup`)
  const temporary = `${client.file}.kalka-${process.pid}`
  await writeFile(temporary, `${text.trimEnd()}\n`, 'utf8')
  await rename(temporary, client.file)
}

function run(command: string, args: string[], path: string): Promise<boolean> {
  return new Promise((resolve) => {
    execFile(command, args, { timeout: 15_000, env: { ...process.env, PATH: path } }, (error) =>
      resolve(!error)
    )
  })
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

export interface MCPClientStatus {
  id: MCPClientID
  name: string
  file: string
  installed: boolean
  connected: boolean
}

async function clientStatus(id: MCPClientID): Promise<MCPClientStatus> {
  const client = CLIENTS[id]
  const installed = (await Promise.all(client.installed.map(exists))).some(Boolean)
  let connected = false
  const text = await readText(client.file)
  if (text) {
    try {
      const servers = v.safeParse(Servers, parseConfig(client, text)[serversKey(client.format)])
      connected = servers.success && MCP_SERVER_NAME in servers.output
    } catch {
      connected = false
    }
  }
  return { id, name: client.name, file: client.file, installed, connected }
}

/** Every client Kalka knows how to connect, whether it is installed, and whether Kalka is in it. */
export function listMCPClients(): Promise<MCPClientStatus[]> {
  return Promise.all(MCP_CLIENT_IDS.map(clientStatus))
}

/** Adds Kalka to one client: through its own CLI when it has one on the PATH, else its file. */
export async function connectMCPClient(
  id: MCPClientID,
  locate: Locate,
  path: string
): Promise<MCPClientStatus> {
  const client = CLIENTS[id]
  const bridge = await bridgeCommand(locate)
  const cli = client.cli && (await locate(client.cli.command))
  if (client.cli && cli) {
    await run(cli, client.cli.remove, path)
    if (!(await run(cli, client.cli.add(bridge), path)))
      throw new NativeError(`${client.name} refused to add Kalka. Try again from a terminal.`)
  } else {
    await writeClientConfig(client, bridge)
  }
  return clientStatus(id)
}

export function isMCPClientID(value: unknown): value is MCPClientID {
  return typeof value === 'string' && (MCP_CLIENT_IDS as readonly string[]).includes(value)
}
