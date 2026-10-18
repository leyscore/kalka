import { runCLI, type RunCLI } from './cli'
import { FORMATS, type BridgeCommand, type ClientDefinition } from './config/clients'
import { ConfigFileError } from './config/edit'
import { writeServer } from './config/file'

/** The name Kalka's tools appear under in a client: `mcp__kalka__*`. */
export const MCP_SERVER_NAME = 'kalka'

/**
 * Why a client could not be connected, as a code the page words in the user's language
 * (`src/app/automation/mcp/clients.ts`), with what it needs to say which file and what failed.
 */
export type MCPClientFailure =
  | { code: 'bridge-missing'; bridge: string }
  | { code: 'config-invalid'; client: string; file: string; syntax: 'JSON' | 'TOML'; details: string }
  | { code: 'config-unusable'; client: string; file: string; details: string }
  | { code: 'config-unwritable'; client: string; file: string; details: string }
  | { code: 'extension-missing' }
  | { code: 'extension-failed'; client: string; details: string }

export class MCPClientError extends Error {
  constructor(readonly failure: MCPClientFailure) {
    super(failure.code)
  }
}

/** A CLI that adds servers itself; preferred over editing a file the client may rewrite. */
export interface ClientCLI {
  command: string
  add: (bridge: BridgeCommand) => string[]
  remove: string[]
}

/**
 * Claude Code takes the whole entry as one JSON argument with `add-json`, so no path or
 * variable has to survive its `-e` and `--` parsing, and `remove` first replaces an entry
 * `add-json` would refuse to overwrite.
 */
export const CLAUDE_CODE_CLI: ClientCLI = {
  command: 'claude',
  add: (bridge) => [
    'mcp',
    'add-json',
    '--scope',
    'user',
    MCP_SERVER_NAME,
    JSON.stringify(FORMATS.mcpServersTyped.entry(bridge))
  ],
  remove: ['mcp', 'remove', '--scope', 'user', MCP_SERVER_NAME]
}

/** Writes Kalka's entry into the client's file; `cliOutput` explains why the CLI was not used. */
export async function writeClientConfig(
  client: ClientDefinition,
  bridge: BridgeCommand,
  cliOutput = ''
): Promise<void> {
  const format = FORMATS[client.format]
  const withCLI = (details: string) =>
    [cliOutput && `${client.name}: ${cliOutput}`, details].filter((part) => part).join('\n\n')
  try {
    await writeServer(client.file, {
      syntax: format.syntax,
      path: format.path,
      name: MCP_SERVER_NAME,
      entry: format.entry(bridge)
    })
  } catch (error) {
    const details = withCLI(error instanceof Error ? error.message : String(error))
    const where = { client: client.name, file: client.file, details }
    if (!(error instanceof ConfigFileError))
      throw new MCPClientError({ code: 'config-unwritable', ...where })
    throw new MCPClientError(
      error.reason === 'syntax'
        ? { code: 'config-invalid', ...where, syntax: format.syntax === 'toml' ? 'TOML' : 'JSON' }
        : { code: 'config-unusable', ...where }
    )
  }
}

/** How a connect went: by the client's CLI, or by its file after the CLI failed with `cliOutput`. */
export type ConnectRoute = { via: 'cli' } | { via: 'file'; cliOutput?: string }

export interface ConnectRequest {
  client: ClientDefinition
  bridge: BridgeCommand
  /** The client's CLI and where it was found, when it has one on the PATH. */
  cli?: { definition: ClientCLI; executable: string }
  path: string
  run?: RunCLI
}

/**
 * Adds Kalka to one client through its CLI, and falls back to editing the client's file when
 * the CLI fails, keeping what the CLI printed so the page can show it.
 */
export async function connectClient(request: ConnectRequest): Promise<ConnectRoute> {
  const { client, bridge, cli, path, run = runCLI } = request
  if (!cli) {
    await writeClientConfig(client, bridge)
    return { via: 'file' }
  }
  await run(cli.executable, cli.definition.remove, path)
  const added = await run(cli.executable, cli.definition.add(bridge), path)
  if (added.ok) return { via: 'cli' }
  await writeClientConfig(client, bridge, added.output)
  return { via: 'file', cliOutput: added.output }
}
