import { tryOnScopeDispose } from '@vueuse/core'
import { ref, watch } from 'vue'

import { ACP_AGENTS, type ACPAgentDef, type AIProviderID } from '@kalka/core/constants'

import type { ACPSignInOutcome, ACPTerminalSignIn } from '@/app/ai/acp/auth'
import {
  designModelConnection,
  modelCredentialRevision,
  setModelConnectionAPIKey
} from '@/app/ai/models'
import { fetchOpenRouterKeyInfo } from '@/app/ai/providers/openrouter/key'
import { OPENROUTER_KEY_LABEL, signInWithOpenRouter } from '@/app/ai/providers/openrouter/sign-in'

/**
 * How a sign-in that stopped working is renewed: a coding agent signs in again through ACP,
 * OpenRouter through its OAuth sign-in, and a provider with a pasted key in Settings.
 */
export type ChatReconnectRoute = 'agent' | 'sign-in' | 'settings'

export function chatReconnectRoute(providerID: AIProviderID): ChatReconnectRoute {
  if (providerID.startsWith('acp:')) return 'agent'
  if (providerID === 'openrouter') return 'sign-in'
  return 'settings'
}

export type ChatReconnectOutcome =
  | { status: 'reconnected' }
  /** The agent signs in only in a terminal; resending works once the person has. */
  | { status: 'terminal'; agent: string; signIn: ACPTerminalSignIn | null }
  /** Settings opened on the provider; resending works once a new key is saved. */
  | { status: 'settings' }
  | { status: 'cancelled' }
  | { status: 'failed' }

export type OpenRouterSignInOutcome = 'signed-in' | 'cancelled' | 'failed'

export interface ChatReconnectServices {
  signInToAgent: (agent: ACPAgentDef) => Promise<ACPSignInOutcome>
  /** Must open its window before it awaits anything, so the browser allows the popup. */
  signInToOpenRouter: () => Promise<OpenRouterSignInOutcome>
  openSettings: () => void
}

function agentOf(providerID: AIProviderID): ACPAgentDef | null {
  return ACP_AGENTS.find((agent) => `acp:${agent.id}` === providerID) ?? null
}

async function reconnectAgent(
  agent: ACPAgentDef,
  services: ChatReconnectServices
): Promise<ChatReconnectOutcome> {
  const outcome = await services.signInToAgent(agent)
  if (outcome.status === 'signed-in') return { status: 'reconnected' }
  if (outcome.status === 'terminal') {
    return { status: 'terminal', agent: agent.name, signIn: outcome.signIn }
  }
  return { status: 'failed' }
}

async function reconnectOpenRouter(
  signingIn: Promise<OpenRouterSignInOutcome>
): Promise<ChatReconnectOutcome> {
  const outcome = await signingIn
  if (outcome === 'signed-in') return { status: 'reconnected' }
  return { status: outcome }
}

/**
 * Renews the Design model's sign-in for `providerID`. Call it from the click that asks, since
 * OpenRouter's sign-in opens its window before anything is awaited.
 */
export function reconnectChat(
  providerID: AIProviderID,
  services: ChatReconnectServices
): Promise<ChatReconnectOutcome> {
  const route = chatReconnectRoute(providerID)
  if (route === 'sign-in') return reconnectOpenRouter(services.signInToOpenRouter())
  if (route === 'agent') {
    const agent = agentOf(providerID)
    return agent ? reconnectAgent(agent, services) : Promise.resolve({ status: 'failed' })
  }
  services.openSettings()
  return Promise.resolve({ status: 'settings' })
}

/** What the chat offers after reconnecting. */
export type ChatReconnectNotice =
  | { kind: 'resend' }
  | { kind: 'terminal'; agent: string; signIn: ACPTerminalSignIn | null }
  | { kind: 'failed' }

interface ChatReconnectOptions {
  providerID: () => AIProviderID
  /** The next message restarts the agent or rebuilds the model with the new sign-in. */
  markTransportDirty: () => void
  /** A renewed sign-in ends the failure, so the reply offers Retry again. */
  clearFailure: () => void
  /** Whether the current failure is one Reconnect answers; a key saved anywhere then ends it. */
  failureNeedsReconnect?: () => boolean
  openSettings: () => void
  services?: Partial<ChatReconnectServices>
}

async function signInToAgent(agent: ACPAgentDef): Promise<ACPSignInOutcome> {
  const { signInToACPAgent } = await import('@/app/ai/acp/auth')
  return signInToACPAgent(agent)
}

/** Signs in to OpenRouter again and saves the new key on the Design model's connection. */
function openRouterSignIn(signal: AbortSignal): Promise<OpenRouterSignInOutcome> {
  const connectionId = designModelConnection.value?.id
  const sign = signInWithOpenRouter({ signal, keyLabel: OPENROUTER_KEY_LABEL })
  return sign.result.then(async (result) => {
    if (!result.ok) return result.reason === 'cancelled' ? 'cancelled' : 'failed'
    if (!connectionId) return 'failed'
    // Checked with OpenRouter directly, which costs nothing, before it replaces the saved key.
    const account = await fetchOpenRouterKeyInfo(result.key).catch(() => null)
    if (!account || signal.aborted) return 'failed'
    await setModelConnectionAPIKey(connectionId, result.key)
    return 'signed-in'
  })
}

/** Reconnect for a chat whose provider or agent sign-in stopped working. */
export function useChatReconnect(options: ChatReconnectOptions) {
  const busy = ref(false)
  const notice = ref<ChatReconnectNotice | null>(null)
  let controller: AbortController | null = null
  let awaitingKey = false

  tryOnScopeDispose(() => controller?.abort())

  // A key saved in Settings, whether Reconnect sent the person there or they went on their own.
  watch(modelCredentialRevision, () => {
    if (!awaitingKey && !options.failureNeedsReconnect?.()) return
    awaitingKey = false
    options.clearFailure()
    notice.value = { kind: 'resend' }
  })

  const services = (signal: AbortSignal): ChatReconnectServices => ({
    signInToAgent,
    signInToOpenRouter: () => openRouterSignIn(signal),
    openSettings: options.openSettings,
    ...options.services
  })

  function apply(outcome: ChatReconnectOutcome): void {
    if (outcome.status === 'reconnected') {
      options.markTransportDirty()
      options.clearFailure()
      notice.value = { kind: 'resend' }
    } else if (outcome.status === 'terminal') {
      // Whatever the terminal sign-in changes, the agent restarts to read it.
      options.markTransportDirty()
      notice.value = { kind: 'terminal', agent: outcome.agent, signIn: outcome.signIn }
    } else if (outcome.status === 'settings') {
      awaitingKey = true
    } else if (outcome.status === 'failed') {
      notice.value = { kind: 'failed' }
    }
  }

  /**
   * Call from the click that asks for it: everything before the first await runs in that
   * click, which is what lets OpenRouter's sign-in open its window.
   */
  async function reconnect(): Promise<void> {
    if (busy.value) return
    controller?.abort()
    const current = new AbortController()
    controller = current
    busy.value = true
    notice.value = null
    let outcome: ChatReconnectOutcome
    try {
      outcome = await reconnectChat(options.providerID(), services(current.signal))
    } catch {
      outcome = { status: 'failed' }
    } finally {
      if (controller === current) busy.value = false
    }
    if (!current.signal.aborted) apply(outcome)
  }

  function dismiss(): void {
    notice.value = null
    awaitingKey = false
  }

  return { busy, notice, reconnect, dismiss }
}
