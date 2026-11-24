import { useLocalStorage } from '@vueuse/core'
import { computed, ref } from 'vue'

import { enqueueMCPConnectionMutation } from './mutations'
import { isOAuthConnection, isSignedIn, signInMCPConnection } from './oauth'
import { mcpConnectionSettings, saveMCPConnectionDraft } from './store'
import {
  SUGGESTED_MCP_CONNECTIONS,
  suggestedMCPConnectionDraft,
  suggestedMCPConnectionOf,
  type SuggestedMCPConnection
} from './suggested'
import type { MCPConnectionID } from './types'

export type ReferenceLibraryState = 'available' | 'connecting' | 'connected'

/** A design-reference library as the chat offers it: the suggestion and where it stands. */
export interface ReferenceLibrary extends SuggestedMCPConnection {
  state: ReferenceLibraryState
  /** Why the last attempt to connect failed, or empty. */
  error: string
}

/** Whether the person turned the offer down; they can still connect a library in Settings. */
export const referenceLibrariesDismissed = useLocalStorage(
  'kalka:reference-libraries-dismissed',
  false
)

const signInServices = { signIn: signInMCPConnection, signedIn: isSignedIn }

/**
 * The design-reference libraries for the chat's offer: which are connected, and connecting one in
 * a click. Connecting saves the suggestion as an ordinary MCP connection, then signs in where the
 * library asks for an account; a library counts as connected once the agent can call it.
 */
export function useReferenceLibraries(services = signInServices) {
  type Key = SuggestedMCPConnection['key']
  const connecting = ref<Key[]>([])
  const signedIn = ref<Partial<Record<Key, boolean>>>({})
  const errors = ref<Partial<Record<Key, string>>>({})

  const saved = (suggestion: SuggestedMCPConnection) =>
    suggestedMCPConnectionOf(mcpConnectionSettings.value.connections, suggestion)

  async function refresh(): Promise<void> {
    for (const suggestion of SUGGESTED_MCP_CONNECTIONS) {
      const connection = saved(suggestion)
      if (!connection || !isOAuthConnection(connection)) continue
      signedIn.value[suggestion.key] = await services.signedIn(connection).catch(() => false)
    }
  }

  const libraries = computed<ReferenceLibrary[]>(() =>
    SUGGESTED_MCP_CONNECTIONS.map((suggestion) => {
      const connection = saved(suggestion)
      const ready =
        connection?.enabled === true &&
        (!isOAuthConnection(connection) || signedIn.value[suggestion.key] === true)
      let state: ReferenceLibraryState = ready ? 'connected' : 'available'
      if (connecting.value.includes(suggestion.key)) state = 'connecting'
      return { ...suggestion, state, error: errors.value[suggestion.key] ?? '' }
    })
  )
  const connected = computed(() => libraries.value.some(({ state }) => state === 'connected'))

  async function connect(suggestion: SuggestedMCPConnection): Promise<void> {
    if (connecting.value.includes(suggestion.key)) return
    connecting.value = [...connecting.value, suggestion.key]
    errors.value[suggestion.key] = ''
    const id: MCPConnectionID = saved(suggestion)?.id ?? `mcp-${crypto.randomUUID()}`
    try {
      const connection = await enqueueMCPConnectionMutation(id, async () =>
        saveMCPConnectionDraft({ ...suggestedMCPConnectionDraft(suggestion), id })
      )
      if (isOAuthConnection(connection)) {
        await services.signIn(connection)
        signedIn.value[suggestion.key] = await services.signedIn(connection)
      }
    } catch (cause) {
      errors.value[suggestion.key] = cause instanceof Error ? cause.message : String(cause)
    } finally {
      connecting.value = connecting.value.filter((key) => key !== suggestion.key)
    }
  }

  void refresh()

  return { libraries, connected, connect, refresh }
}
