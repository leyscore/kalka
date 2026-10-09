import { computed } from 'vue'

import { MCP_INSTALL_COMMAND } from '@/app/ai/acp/setup-prompt'
import { mcpRuntime } from '@/app/automation/mcp/runtime'
import { presenceOf } from '@/app/presence/registry'
import { activeTab } from '@/app/tabs'
import { isTauri } from '@/app/tauri/env'

/** The name Kalka's tools appear under in a client: `mcp__kalka__*`. */
export const MCP_SERVER_NAME = 'kalka'
/** The stdio bridge an MCP client starts; it finds the running app through its discovery file. */
export const MCP_BRIDGE = 'openpencil-mcp'

export const mcpInstallCommand = MCP_INSTALL_COMMAND
export const claudeCodeCommand = `claude mcp add --scope user ${MCP_SERVER_NAME} -- ${MCP_BRIDGE}`
export const mcpClientConfig = JSON.stringify(
  { mcpServers: { [MCP_SERVER_NAME]: { command: MCP_BRIDGE } } },
  null,
  2
)

/** Where Claude Desktop keeps its configuration on this computer, as people write the path. */
export function claudeDesktopConfigPath(userAgent = navigator.userAgent): string {
  if (/Windows/i.test(userAgent)) return '%APPDATA%\\Claude\\claude_desktop_config.json'
  if (/Mac/i.test(userAgent))
    return '~/Library/Application Support/Claude/claude_desktop_config.json'
  return '~/.config/Claude/claude_desktop_config.json'
}

export type ClaudeConnection = 'connected' | 'waiting' | 'starting' | 'off' | 'web'

/**
 * How far Claude is from the canvas. A client counts as connected once it calls a tool: the MCP
 * server learns of a client only then.
 */
export const claudeConnection = computed<ClaudeConnection>(() => {
  const store = activeTab.value?.store
  if (store && presenceOf(store).agents.value.some((agent) => agent.kind === 'mcp'))
    return 'connected'
  if (!import.meta.env.DEV && !isTauri()) return 'web'
  if (mcpRuntime.status === 'running') return 'waiting'
  if (mcpRuntime.status === 'starting' || mcpRuntime.status === 'idle') return 'starting'
  return 'off'
})

/** Where Kalka was added in Claude Desktop's configuration, and the bridge it starts. */
export interface ClaudeDesktopConnection {
  path: string
  command: string
}

/** Whether this build can write Claude Desktop's configuration itself. */
export const canConnectClaudeDesktop = isTauri()

/**
 * Adds Kalka to Claude Desktop's configuration, keeping its other servers and a backup of the
 * previous file. Desktop only: the browser cannot reach another app's files.
 */
export async function connectClaudeDesktop(): Promise<ClaudeDesktopConnection> {
  const { invoke } = await import('@tauri-apps/api/core')
  return invoke<ClaudeDesktopConnection>('connect_claude_desktop')
}
