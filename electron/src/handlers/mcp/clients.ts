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
import { hasServer } from './config/file'
import {
  CLAUDE_CODE_CLI,
  connectClient,
  MCP_SERVER_NAME,
  MCPClientError,
  type ClientCLI,
  type MCPClientFailure
} from './connect'

export { isMCPClientID } from './config/clients'

/** The stdio bridge of a global `@kalka/mcp` install, for builds without the bundled one. */
const GLOBAL_MCP_BRIDGE = 'kalka-mcp'

type Locate = (command: string) => Promise<string | null>

/** Hands a failure to the page as `{code, ...}`, which it words in the user's language. */
async function reporting<T>(action: () => Promise<T>): Promise<T> {
  try {
    return await action()
  } catch (error) {
    if (error instanceof MCPClientError) throw new NativeError(error.failure)
    throw error
  }
}

async function bridgeCommand(locate: Locate): Promise<BridgeCommand> {
  const script = await bundledMCPScript(BUNDLED_MCP_STDIO)
  if (script) return bundledMCPCommand(script)
  const bridge = await locate(GLOBAL_MCP_BRIDGE)
  if (!bridge) throw new MCPClientError({ code: 'bridge-missing', bridge: GLOBAL_MCP_BRIDGE })
  // Clients start servers without a login shell: name the bridge by its full path and put its
  // folder, where Node usually sits too, on the PATH it runs with.
  const pathEntries = [dirname(bridge), '/usr/local/bin', '/opt/homebrew/bin', '/usr/bin', '/bin']
  return {
    command: bridge,
    args: [],
    env: { PATH: process.platform === 'win32' ? dirname(bridge) : pathEntries.join(':') }
  }
}

/** The bridge command for the page, with a missing bridge reported as a code. */
export function reportedBridgeCommand(locate: Locate): Promise<BridgeCommand> {
  return reporting(() => bridgeCommand(locate))
}

const CLIS: Partial<Record<MCPClientID, ClientCLI>> = { 'claude-code': CLAUDE_CODE_CLI }

/** Clients that install Kalka as a bundle the app builds (`scripts/build-mcp.ts`). */
const EXTENSION_CLIENTS: ReadonlySet<MCPClientID> = new Set(['claude-desktop'])

let definitions: Record<MCPClientID, ClientDefinition> | null = null
function clients(): Record<MCPClientID, ClientDefinition> {
  definitions ??= localClientDefinitions()
  return definitions
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
  /** Set when the client's CLI failed and Kalka edited its file instead: what the CLI printed. */
  cliOutput?: string
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
export function connectMCPClient(
  id: MCPClientID,
  locate: Locate,
  path: string
): Promise<MCPClientStatus> {
  return reporting(async () => {
    const client = clients()[id]
    const bridge = await bridgeCommand(locate)
    const definition = CLIS[id]
    const executable = definition && (await locate(definition.command))
    const route = await connectClient({
      client,
      bridge,
      cli: definition && executable ? { definition, executable } : undefined,
      path
    })
    const status = await clientStatus(id)
    return route.via === 'file' && route.cliOutput !== undefined
      ? { ...status, cliOutput: route.cliOutput }
      : status
  })
}

/**
 * Opens Kalka's MCP bundle with the app registered for `.mcpb` files, Claude Desktop, which
 * then asks the user to confirm the install.
 */
export async function installMCPExtension(id: MCPClientID): Promise<void> {
  const bundle = EXTENSION_CLIENTS.has(id) ? await bundledMCPScript(BUNDLED_MCP_EXTENSION) : null
  if (!bundle) throw new NativeError({ code: 'extension-missing' } satisfies MCPClientFailure)
  const failure = await shell.openPath(bundle)
  if (failure)
    throw new NativeError({
      code: 'extension-failed',
      client: clients()[id].name,
      details: failure
    } satisfies MCPClientFailure)
}
