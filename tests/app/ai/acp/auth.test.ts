import { describe, expect, test } from 'bun:test'

import type { AuthMethod, InitializeResponse } from '@agentclientprotocol/sdk'

import { ACP_AGENTS, type ACPAgentDef } from '@kalka/core/constants'

import {
  interactiveSignInMethod,
  signInToACPAgent,
  terminalSignIn,
  type ACPSignInConnection
} from '@/app/ai/acp/auth'

import { asDouble } from '#tests/helpers/doubles'

function agentDef(id: ACPAgentDef['id']): ACPAgentDef {
  const agent = ACP_AGENTS.find((definition) => definition.id === id)
  if (!agent) throw new Error(`No ${id} agent`)
  return agent
}

const CLAUDE_LOGIN: AuthMethod = {
  id: 'claude-login',
  name: 'Log in with Claude Code',
  description: 'Run `claude /login` in the terminal'
}
const CHATGPT: AuthMethod = { id: 'chatgpt', name: 'Login with ChatGPT' }
const CODEX_KEY: AuthMethod = { id: 'codex-api-key', name: 'Use CODEX_API_KEY' }

interface FakeAgent {
  open: (agent: ACPAgentDef) => Promise<ACPSignInConnection>
  authenticated: string[]
  closed: () => boolean
}

function fakeAgent(
  authMethods: AuthMethod[],
  authenticate: (methodId: string) => Promise<void> = async () => undefined
): FakeAgent {
  const authenticated: string[] = []
  let closed = false
  const initialized: InitializeResponse = { protocolVersion: 1, authMethods }
  return {
    authenticated,
    closed: () => closed,
    open: async () => ({
      agent: {
        initialized,
        connection: asDouble({
          authenticate: async ({ methodId }: { methodId: string }) => {
            authenticated.push(methodId)
            await authenticate(methodId)
            return {}
          }
        })
      },
      close: async () => {
        closed = true
      }
    })
  }
}

describe('ACP sign-in methods', () => {
  test('chooses a method authenticate can complete, not one that reads a key', () => {
    expect(interactiveSignInMethod([CODEX_KEY, CHATGPT])).toEqual(CHATGPT)
    expect(interactiveSignInMethod([CODEX_KEY])).toBeNull()
  })

  test('leaves terminal sign-ins to the terminal', () => {
    const terminal: AuthMethod = {
      ...CLAUDE_LOGIN,
      _meta: { 'terminal-auth': { command: 'node', args: ['cli.js', '/login'] } }
    }
    expect(interactiveSignInMethod([terminal])).toBeNull()
    expect(terminalSignIn([terminal], agentDef('claude-code'))).toEqual({
      command: 'node cli.js /login'
    })
  })

  test('falls back to the sign-in Kalka knows for the agent', () => {
    expect(terminalSignIn([CLAUDE_LOGIN], agentDef('claude-code'))).toEqual(
      agentDef('claude-code').terminalSignIn ?? null
    )
  })
})

describe('signing an ACP agent in again', () => {
  test('authenticates with the advertised method and stops the agent', async () => {
    const agent = fakeAgent([CODEX_KEY, CHATGPT])
    expect(await signInToACPAgent(agentDef('codex'), agent.open)).toEqual({
      status: 'signed-in'
    })
    expect(agent.authenticated).toEqual(['chatgpt'])
    expect(agent.closed()).toBe(true)
  })

  test('sends the person to a terminal when the agent cannot sign in over ACP', async () => {
    const agent = fakeAgent([CLAUDE_LOGIN], async () => {
      throw { code: -32603, message: 'Method not implemented.' }
    })
    const outcome = await signInToACPAgent(agentDef('claude-code'), agent.open)
    expect(outcome).toEqual({
      status: 'terminal',
      signIn: agentDef('claude-code').terminalSignIn ?? null
    })
    expect(agent.closed()).toBe(true)
  })

  test('treats an agent without sign-in methods as ready', async () => {
    const agent = fakeAgent([])
    expect(await signInToACPAgent(agentDef('gemini-cli'), agent.open)).toEqual({
      status: 'signed-in'
    })
    expect(agent.authenticated).toEqual([])
  })

  test('reports an agent that does not start with its readable message', async () => {
    const outcome = await signInToACPAgent(agentDef('codex'), async () => {
      throw new Error('"codex-acp" is not installed.')
    })
    expect(outcome).toEqual({ status: 'failed', message: '"codex-acp" is not installed.' })
  })
})
