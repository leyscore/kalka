import * as v from 'valibot'
import { computed, reactive, ref } from 'vue'

import type { StdioServerSpec } from '@/app/integrations/mcp/stdio'
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
  /** Whether Kalka can also be installed as an extension the client opens itself (`.mcpb`). */
  extension?: boolean
  /** Set when the client's CLI failed and the desktop app edited its file instead. */
  cliOutput?: string
}

const ClientFile = { client: v.string(), file: v.string(), details: v.string() }

/**
 * Why the desktop app could not connect a client, as the main process reports it
 * (`electron/src/handlers/mcp/connect.ts`). Codes stay in the domain so Settings words them
 * in the user's language; `details` is diagnostic output, never translated.
 */
const MCPClientFailureSchema = v.variant('code', [
  v.object({ code: v.literal('bridge-missing'), bridge: v.string() }),
  v.object({
    code: v.literal('config-invalid'),
    ...ClientFile,
    syntax: v.picklist(['JSON', 'TOML'])
  }),
  v.object({ code: v.literal('config-unusable'), ...ClientFile }),
  v.object({ code: v.literal('config-unwritable'), ...ClientFile }),
  v.object({ code: v.literal('extension-missing') }),
  v.object({ code: v.literal('extension-failed'), client: v.string(), details: v.string() })
])
export type MCPClientFailure = v.InferOutput<typeof MCPClientFailureSchema>

/** A failure the page can word, or the raw text of one it cannot (an older main process). */
export type MCPClientError = { failure: MCPClientFailure } | { failure: null; message: string }

export function mcpClientError(error: unknown): MCPClientError {
  const parsed = v.safeParse(MCPClientFailureSchema, error)
  if (parsed.success) return { failure: parsed.output }
  if (typeof error === 'string') return { failure: null, message: error }
  if (error instanceof Error) return { failure: null, message: error.message }
  const message =
    typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error)
  return { failure: null, message }
}

/** How a client starts Kalka's stdio bridge. */
export type MCPBridgeCommand = StdioServerSpec

export type MCPClientState =
  | { state: 'idle' }
  | { state: 'connecting' }
  | { state: 'opening' }
  | { state: 'done'; cliOutput?: string }
  | { state: 'extension-opened' }
  | { state: 'error'; error: MCPClientError }

function errorState(error: unknown): MCPClientState {
  return { state: 'error', error: mcpClientError(error) }
}

/** Whether this build can write other apps' configuration: desktop only. */
export const canConnectMCPClients = isTauri()

async function invoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  const { invoke: tauriInvoke } = await import('@tauri-apps/api/core')
  return tauriInvoke<T>(command, args)
}

/** The server entry any client that starts stdio servers accepts, in the common `mcpServers` shape. */
export function mcpClientConfig(bridge: MCPBridgeCommand | null): string {
  const entry: { command: string; args?: string[]; env?: Record<string, string> } = {
    command: bridge?.command ?? 'kalka-mcp'
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
  const states = reactive<Record<string, MCPClientState>>({})
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
      states[id] = { state: 'done', cliOutput: status.cliOutput }
    } catch (error) {
      states[id] = errorState(error)
    }
  }

  /** Hands Kalka's MCP bundle to the client, which asks the user to confirm the install. */
  async function installExtension(id: string): Promise<void> {
    states[id] = { state: 'opening' }
    try {
      await invoke<unknown>('install_mcp_extension', { id })
      states[id] = { state: 'extension-opened' }
    } catch (error) {
      states[id] = errorState(error)
    }
  }

  function stateOf(id: string): MCPClientState {
    return states[id] ?? { state: 'idle' }
  }

  return { clients: sorted, config, loading, refresh, connect, installExtension, stateOf }
}
