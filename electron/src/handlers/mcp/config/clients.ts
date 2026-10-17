import { homedir } from 'node:os'
import { posix, win32 } from 'node:path'

import type { ConfigSyntax } from './edit'

/**
 * The MCP clients Kalka can add itself to, where each keeps its user-level configuration, and
 * the entry each expects. Paths follow each client's public documentation; see
 * `packages/docs/programmable/mcp-server.md` (Connect a client) for the sources.
 */
export const MCP_CLIENT_IDS = [
  'claude-desktop',
  'claude-code',
  'cursor',
  'vscode',
  'windsurf',
  'codex',
  'gemini',
  'antigravity',
  'kiro',
  'zed',
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

export type Format = 'mcpServers' | 'mcpServersTyped' | 'vscode' | 'opencode' | 'codex' | 'zed'

export interface ClientDefinition {
  name: string
  /** The configuration file Kalka is added to. */
  file: string
  /** Folders whose presence means the client is installed. */
  installed: string[]
  format: Format
}

/** The parts of the environment client paths depend on, so tests can point them at a temporary home. */
export interface ClientEnvironment {
  home: string
  platform: NodeJS.Platform
  /** `%APPDATA%` on Windows. */
  appData?: string
  /** `$XDG_CONFIG_HOME` on Linux. */
  xdgConfigHome?: string
}

export function clientDefinitions(
  environment: ClientEnvironment
): Record<MCPClientID, ClientDefinition> {
  const { home, platform } = environment
  const path = platform === 'win32' ? win32 : posix
  const appData = environment.appData ?? path.join(home, 'AppData', 'Roaming')
  const xdgConfig = environment.xdgConfigHome || path.join(home, '.config')
  const at = (...parts: string[]) => path.join(home, ...parts)

  /** A per-platform folder for apps that follow each system's convention. */
  const appSupport = (name: string): string => {
    if (platform === 'darwin') return at('Library', 'Application Support', name)
    if (platform === 'win32') return path.join(appData, name)
    return path.join(xdgConfig, name)
  }
  // Zed keeps settings in ~/.config/zed on macOS too, and in %APPDATA%\Zed on Windows.
  const zed =
    platform === 'win32'
      ? path.join(appData, 'Zed')
      : platform === 'darwin'
        ? at('.config', 'zed')
        : path.join(xdgConfig, 'zed')

  return {
    'claude-desktop': {
      name: 'Claude Desktop',
      file: path.join(appSupport('Claude'), 'claude_desktop_config.json'),
      installed: [appSupport('Claude')],
      format: 'mcpServers'
    },
    'claude-code': {
      name: 'Claude Code',
      file: at('.claude.json'),
      installed: [at('.claude')],
      format: 'mcpServersTyped'
    },
    cursor: {
      name: 'Cursor',
      file: at('.cursor', 'mcp.json'),
      installed: [at('.cursor')],
      format: 'mcpServers'
    },
    vscode: {
      name: 'VS Code',
      file: path.join(appSupport('Code'), 'User', 'mcp.json'),
      installed: [path.join(appSupport('Code'), 'User')],
      format: 'vscode'
    },
    windsurf: {
      name: 'Windsurf',
      file: at('.codeium', 'windsurf', 'mcp_config.json'),
      installed: [at('.codeium', 'windsurf')],
      format: 'mcpServers'
    },
    codex: {
      name: 'Codex',
      file: at('.codex', 'config.toml'),
      installed: [at('.codex')],
      format: 'codex'
    },
    gemini: {
      name: 'Gemini CLI',
      file: at('.gemini', 'settings.json'),
      installed: [at('.gemini')],
      format: 'mcpServers'
    },
    antigravity: {
      name: 'Antigravity',
      file: at('.gemini', 'config', 'mcp_config.json'),
      installed: [appSupport('Antigravity'), at('.antigravity'), at('.gemini', 'antigravity')],
      format: 'mcpServers'
    },
    kiro: {
      name: 'Kiro',
      file: at('.kiro', 'settings', 'mcp.json'),
      installed: [at('.kiro')],
      format: 'mcpServers'
    },
    zed: {
      name: 'Zed',
      file: path.join(zed, 'settings.json'),
      installed: [zed],
      format: 'zed'
    },
    'lm-studio': {
      name: 'LM Studio',
      file: at('.lmstudio', 'mcp.json'),
      installed: [at('.lmstudio')],
      format: 'mcpServers'
    },
    opencode: {
      name: 'opencode',
      file: at('.config', 'opencode', 'opencode.json'),
      installed: [at('.config', 'opencode')],
      format: 'opencode'
    }
  }
}

/** The definitions for this computer. */
export function localClientDefinitions(): Record<MCPClientID, ClientDefinition> {
  return clientDefinitions({
    home: homedir(),
    platform: process.platform,
    appData: process.env.APPDATA,
    xdgConfigHome: process.env.XDG_CONFIG_HOME
  })
}

export interface FormatSpec {
  syntax: ConfigSyntax
  /** Where the client keeps its servers. */
  path: readonly string[]
  entry: (bridge: BridgeCommand) => Record<string, unknown>
}

export const FORMATS: Record<Format, FormatSpec> = {
  mcpServers: {
    syntax: 'json',
    path: ['mcpServers'],
    entry: ({ command, args, env }) => ({ command, args, env })
  },
  mcpServersTyped: {
    syntax: 'json',
    path: ['mcpServers'],
    entry: ({ command, args, env }) => ({ type: 'stdio', command, args, env })
  },
  vscode: {
    syntax: 'json',
    path: ['servers'],
    entry: ({ command, args, env }) => ({ type: 'stdio', command, args, env })
  },
  opencode: {
    syntax: 'json',
    path: ['mcp'],
    entry: ({ command, args, env }) => ({
      type: 'local',
      command: [command, ...args],
      environment: env,
      enabled: true
    })
  },
  codex: {
    syntax: 'toml',
    path: ['mcp_servers'],
    entry: ({ command, args, env }) => ({ command, args, env })
  },
  zed: {
    syntax: 'json',
    path: ['context_servers'],
    entry: ({ command, args, env }) => ({ command, args, env })
  }
}

export function isMCPClientID(value: unknown): value is MCPClientID {
  return typeof value === 'string' && (MCP_CLIENT_IDS as readonly string[]).includes(value)
}
