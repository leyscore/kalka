import { describe, expect, test } from 'bun:test'

import { nextTick } from 'vue'

import type { ACPAgentDef, AIProviderID } from '@kalka/core/constants'

import type { ACPSignInOutcome } from '@/app/ai/acp/auth'
import {
  chatReconnectRoute,
  reconnectChat,
  useChatReconnect,
  type ChatReconnectServices,
  type OpenRouterSignInOutcome
} from '@/app/ai/chat/reconnect'
import { modelCredentialRevision } from '@/app/ai/models'

interface Calls {
  agents: string[]
  openRouter: number
  settings: number
}

function services(
  agent: ACPSignInOutcome = { status: 'signed-in' },
  openRouter: OpenRouterSignInOutcome = 'signed-in'
): { calls: Calls; services: ChatReconnectServices } {
  const calls: Calls = { agents: [], openRouter: 0, settings: 0 }
  return {
    calls,
    services: {
      signInToAgent: async (definition: ACPAgentDef) => {
        calls.agents.push(definition.id)
        return agent
      },
      signInToOpenRouter: () => {
        calls.openRouter++
        return Promise.resolve(openRouter)
      },
      openSettings: () => {
        calls.settings++
      }
    }
  }
}

describe('reconnect routes', () => {
  test('sends each kind of provider to the sign-in it has', () => {
    expect(chatReconnectRoute('acp:claude-code')).toBe('agent')
    expect(chatReconnectRoute('acp:codex')).toBe('agent')
    expect(chatReconnectRoute('openrouter')).toBe('sign-in')
    expect(chatReconnectRoute('anthropic')).toBe('settings')
    expect(chatReconnectRoute('openai-compatible')).toBe('settings')
    expect(chatReconnectRoute('harness:pi')).toBe('settings')
  })
})

describe('reconnecting a chat', () => {
  test('signs a coding agent in again', async () => {
    const fake = services()
    expect(await reconnectChat('acp:codex', fake.services)).toEqual({ status: 'reconnected' })
    expect(fake.calls.agents).toEqual(['codex'])
  })

  test('names the agent and its terminal sign-in when ACP cannot sign it in', async () => {
    const signIn = { command: 'claude', prompt: '/login' }
    const fake = services({ status: 'terminal', signIn })
    const outcome = await reconnectChat('acp:claude-code', fake.services)
    expect(outcome).toMatchObject({ status: 'terminal', signIn })
  })

  test('starts OpenRouter’s sign-in in the same call, before anything is awaited', () => {
    const fake = services()
    void reconnectChat('openrouter', fake.services)
    expect(fake.calls.openRouter).toBe(1)
  })

  test('reports a cancelled OpenRouter sign-in', async () => {
    const fake = services(undefined, 'cancelled')
    expect(await reconnectChat('openrouter', fake.services)).toEqual({ status: 'cancelled' })
  })

  test('opens Settings for a provider with a pasted key', async () => {
    const fake = services()
    expect(await reconnectChat('anthropic', fake.services)).toEqual({ status: 'settings' })
    expect(fake.calls.settings).toBe(1)
    expect(fake.calls.agents).toEqual([])
  })
})

function reconnectFor(
  providerID: AIProviderID,
  fake: ChatReconnectServices,
  failureNeedsReconnect = false
) {
  const state = { dirty: 0, cleared: 0, settings: 0 }
  const reconnect = useChatReconnect({
    providerID: () => providerID,
    markTransportDirty: () => state.dirty++,
    clearFailure: () => state.cleared++,
    failureNeedsReconnect: () => failureNeedsReconnect,
    openSettings: () => state.settings++,
    services: fake
  })
  return { reconnect, state }
}

describe('the chat after reconnecting', () => {
  test('offers to resend once the agent signed in, and restarts it for that message', async () => {
    const { reconnect, state } = reconnectFor('acp:codex', services().services)
    await reconnect.reconnect()
    expect(reconnect.notice.value).toEqual({ kind: 'resend' })
    expect(state).toMatchObject({ dirty: 1, cleared: 1 })
    expect(reconnect.busy.value).toBe(false)
  })

  test('keeps the failure while the agent waits for a terminal sign-in', async () => {
    const signIn = { command: 'claude', prompt: '/login' }
    const { reconnect, state } = reconnectFor(
      'acp:claude-code',
      services({ status: 'terminal', signIn }).services
    )
    await reconnect.reconnect()
    expect(reconnect.notice.value).toMatchObject({ kind: 'terminal', signIn })
    expect(state.cleared).toBe(0)
  })

  test('offers to resend after a new key is saved in Settings', async () => {
    const fake = services()
    const { reconnect, state } = reconnectFor('anthropic', {
      ...fake.services,
      openSettings: () => state.settings++
    })
    await reconnect.reconnect()
    expect(reconnect.notice.value).toBeNull()
    modelCredentialRevision.value++
    await nextTick()
    expect(reconnect.notice.value).toEqual({ kind: 'resend' })
    expect(state.cleared).toBe(1)
  })

  test('offers to resend when a key is saved in Settings without Reconnect', async () => {
    const { reconnect, state } = reconnectFor('openrouter', services().services, true)
    modelCredentialRevision.value++
    await nextTick()
    expect(reconnect.notice.value).toEqual({ kind: 'resend' })
    expect(state.cleared).toBe(1)
  })

  test('ignores a saved key when no sign-in failed', async () => {
    const { reconnect, state } = reconnectFor('openrouter', services().services)
    modelCredentialRevision.value++
    await nextTick()
    expect(reconnect.notice.value).toBeNull()
    expect(state.cleared).toBe(0)
  })

  test('says when reconnecting failed', async () => {
    const { reconnect } = reconnectFor(
      'acp:codex',
      services({ status: 'failed', message: 'not installed' }).services
    )
    await reconnect.reconnect()
    expect(reconnect.notice.value).toEqual({ kind: 'failed' })
    reconnect.dismiss()
    expect(reconnect.notice.value).toBeNull()
  })
})
