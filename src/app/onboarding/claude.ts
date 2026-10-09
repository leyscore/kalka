import { computed } from 'vue'

import { MCP_INSTALL_COMMAND } from '@/app/ai/acp/setup-prompt'
import { mcpRuntime } from '@/app/automation/mcp/runtime'
import { presenceOf } from '@/app/presence/registry'
import { activeTab } from '@/app/tabs'
import { isTauri } from '@/app/tauri/env'

export const mcpInstallCommand = MCP_INSTALL_COMMAND

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
