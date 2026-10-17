import { execFile } from 'node:child_process'
import { access } from 'node:fs/promises'
import { dirname } from 'node:path'

import { shell } from 'electron'

import { NativeError } from '../../ipc'
import {
  BUNDLED_MCP_EXTENSION,
  BUNDLED_MCP_STDIO,
  bundledMCPCommand,
  bundledMCPScript
} from './bundled'
import {
  FORMATS,
  localClientDefinitions,
  MCP_CLIENT_IDS,
  type BridgeCommand,
  type ClientDefinition,
  type MCPClientID
} from './config/clients'
import { ConfigFileError } from './config/edit'
import { hasServer, writeServer } from './config/file'

export { isMCPClientID } from './config/clients'

/** The name Kalka's tools appear under in a client: `mcp__kalka__*`. */
const MCP_SERVER_NAME = 'kalka'
/** The stdio bridge of a global `@kalka/mcp` install, for builds without the bundled one. */
const GLOBAL_MCP_BRIDGE = 'kalka-mcp'

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

/** A CLI that adds servers itself; preferred over editing a file the client may rewrite. */
interface ClientCLI {
  command: string
  add: (bridge: BridgeCommand) => string[]
  remove: string[]
}

const CLIS: Partial<Record<MCPClientID, ClientCLI>> = {
  'claude-code': {
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
}

/** Clients that install Kalka as a bundle the app builds (`scripts/build-mcp.ts`). */
const EXTENSION_CLIENTS: ReadonlySet<MCPClientID> = new Set(['claude-desktop'])

let definitions: Record<MCPClientID, ClientDefinition> | null = null
function clients(): Record<MCPClientID, ClientDefinition> {
  definitions ??= localClientDefinitions()
  return definitions
}

async function writeClientConfig(client: ClientDefinition, bridge: BridgeCommand): Promise<void> {
  const format = FORMATS[client.format]
  try {
    await writeServer(client.file, {
      syntax: format.syntax,
      path: format.path,
      name: MCP_SERVER_NAME,
      entry: format.entry(bridge)
    })
  } catch (error) {
    if (!(error instanceof ConfigFileError)) throw error
    const problem =
      error.reason === 'syntax'
        ? `is not valid ${format.syntax === 'toml' ? 'TOML' : 'JSON'}`
        : `cannot hold Kalka's entry (${error.message})`
    throw new NativeError(
      `${client.name}'s configuration at ${client.file} ${problem}. Fix it, then connect again.`
    )
  }
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
  /** Whether Kalka can also be installed as a bundle the client opens itself. */
  extension: boolean
}

async function clientStatus(id: MCPClientID): Promise<MCPClientStatus> {
  const client = clients()[id]
  const format = FORMATS[client.format]
  const [installed, connected, extension] = await Promise.all([
    Promise.all(client.installed.map(exists)).then((found) => found.some(Boolean)),
    hasServer(client.file, format.syntax, format.path, MCP_SERVER_NAME),
    EXTENSION_CLIENTS.has(id)
      ? bundledMCPScript(BUNDLED_MCP_EXTENSION).then(Boolean)
      : Promise.resolve(false)
  ])
  return { id, name: client.name, file: client.file, installed, connected, extension }
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
  const client = clients()[id]
  const bridge = await bridgeCommand(locate)
  const cli = CLIS[id]
  const executable = cli && (await locate(cli.command))
  if (cli && executable) {
    await run(executable, cli.remove, path)
    if (!(await run(executable, cli.add(bridge), path)))
      throw new NativeError(`${client.name} refused to add Kalka. Try again from a terminal.`)
  } else {
    await writeClientConfig(client, bridge)
  }
  return clientStatus(id)
}

/**
 * Opens Kalka's MCP bundle with the app registered for `.mcpb` files, Claude Desktop, which
 * then asks the user to confirm the install.
 */
export async function installMCPExtension(id: MCPClientID): Promise<void> {
  const bundle = EXTENSION_CLIENTS.has(id) ? await bundledMCPScript(BUNDLED_MCP_EXTENSION) : null
  if (!bundle) throw new NativeError('This build of Kalka has no extension for that client.')
  const failure = await shell.openPath(bundle)
  if (failure)
    throw new NativeError(`${clients()[id].name} could not open the extension: ${failure}`)
}
