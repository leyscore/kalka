import { computed, reactive, ref } from 'vue'

import { isTauri } from '@/app/tauri/env'

/** The name Kalka's tools appear under in a client: `mcp__kalka__*`. */
export const MCP_SERVER_NAME = 'kalka'

/** An MCP client the desktop app can add Kalka to, as the main process reports it. */
export interface MCPClientStatus {
  id: string
  name: string
  file: string
  installed: boolean
  connected: boolean
}

/** How a client starts Kalka's stdio bridge. */
export interface MCPBridgeCommand {
  command: string
  args: string[]
  env: Record<string, string>
}

type ClientState =
  | { state: 'idle' }
  | { state: 'connecting' }
  | { state: 'done' }
  | { state: 'error'; message: string }

/** Whether this build can write other apps' configuration: desktop only. */
export const canConnectMCPClients = isTauri()

async function invoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  const { invoke: tauriInvoke } = await import('@tauri-apps/api/core')
  return tauriInvoke<T>(command, args)
}

/** The server entry any client that starts stdio servers accepts, in the common `mcpServers` shape. */
export function mcpClientConfig(bridge: MCPBridgeCommand | null): string {
  const entry: { command: string; args?: string[]; env?: Record<string, string> } = {
    command: bridge?.command ?? 'openpencil-mcp'
  }
  if (bridge && bridge.args.length > 0) entry.args = bridge.args
  if (bridge && Object.keys(bridge.env).length > 0) entry.env = bridge.env
  return JSON.stringify({ mcpServers: { [MCP_SERVER_NAME]: entry } }, null, 2)
}

/**
 * The MCP clients on this computer and Kalka's place in each. Installed clients come first;
 * connecting one adds Kalka to its configuration and keeps its other servers.
 */
export function useMCPClients() {
  const clients = ref<MCPClientStatus[]>([])
  const bridge = ref<MCPBridgeCommand | null>(null)
  const states = reactive<Record<string, ClientState>>({})
  const loading = ref(false)

  const sorted = computed(() =>
    [...clients.value].sort((a, b) => Number(b.installed) - Number(a.installed))
  )
  const config = computed(() => mcpClientConfig(bridge.value))

  async function refresh(): Promise<void> {
    if (!canConnectMCPClients) return
    loading.value = true
    try {
      const [list, command] = await Promise.all([
        invoke<MCPClientStatus[]>('mcp_clients'),
        invoke<MCPBridgeCommand>('mcp_bridge_command').catch(() => null)
      ])
      clients.value = list
      bridge.value = command
    } catch {
      // A main process older than this page lists no clients; the config to paste still shows.
      clients.value = []
    } finally {
      loading.value = false
    }
  }

  async function connect(id: string): Promise<void> {
    states[id] = { state: 'connecting' }
    try {
      const status = await invoke<MCPClientStatus>('connect_mcp_client', { id })
      clients.value = clients.value.map((client) => (client.id === id ? status : client))
      states[id] = { state: 'done' }
    } catch (error) {
      states[id] = {
        state: 'error',
        message: error instanceof Error ? error.message : String(error)
      }
    }
  }

  function stateOf(id: string): ClientState {
    return states[id] ?? { state: 'idle' }
  }

  function errorOf(id: string): string | null {
    const state = stateOf(id)
    return state.state === 'error' ? state.message : null
  }

  return { clients: sorted, config, loading, refresh, connect, stateOf, errorOf }
}
