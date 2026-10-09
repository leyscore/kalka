import { ref, watch, type Ref } from 'vue'

import { describeDiagnosticError, recordMCPConnectionFailure } from '@/app/diagnostics'

import { isOAuthConnection, isSignedIn, signInMCPConnection, signOutMCPConnection } from '../oauth'
import type { MCPConnection } from '../types'

export type MCPOAuthStatus = 'signed-in' | 'signed-out' | 'signing-in'

/**
 * A saved connection's OAuth sign-in for its editor: whether it is signed in, and signing in or
 * out. Sign-in runs in the browser; the editor shows it waiting until the server answers.
 */
export function useMCPOAuthSignIn(connection: Readonly<Ref<MCPConnection | undefined>>) {
  const status = ref<MCPOAuthStatus>('signed-out')
  const error = ref('')

  async function refresh(): Promise<void> {
    const current = connection.value
    status.value =
      current && isOAuthConnection(current) && (await isSignedIn(current))
        ? 'signed-in'
        : 'signed-out'
  }

  async function signIn(): Promise<void> {
    const current = connection.value
    if (!current || !isOAuthConnection(current)) return
    error.value = ''
    status.value = 'signing-in'
    try {
      await signInMCPConnection(current)
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : String(cause)
      recordMCPConnectionFailure({ operation: 'connect', ...describeDiagnosticError(cause) })
    }
    await refresh()
  }

  async function signOut(): Promise<void> {
    const current = connection.value
    if (!current || !isOAuthConnection(current)) return
    await signOutMCPConnection(current)
    await refresh()
  }

  watch(() => connection.value?.id, refresh, { immediate: true })

  return { status, error, signIn, signOut, refresh }
}
