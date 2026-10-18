import type { AuthMethod, Client } from '@agentclientprotocol/sdk'
import * as v from 'valibot'

import type { ACPAgentDef } from '@kalka/core/constants'

import { errorSummary } from '@/app/runtime/error'

import { openACPConnection, type ACPConnection } from './transport'

/** How a coding agent's sign-in can be renewed. */
export type ACPTerminalSignIn = { command: string; prompt?: string }

export type ACPSignInOutcome =
  /** The agent signed in again, or has no sign-in of its own; its next session can work. */
  | { status: 'signed-in' }
  /** The agent signs in only in a terminal, with this command when Kalka knows it. */
  | { status: 'terminal'; signIn: ACPTerminalSignIn | null }
  | { status: 'failed'; message: string }

/** ACP's terminal-auth extension: a method the client runs as a command in a terminal. */
const TERMINAL_AUTH_META = 'terminal-auth'
const terminalAuthSchema = v.object({
  command: v.pipe(v.string(), v.minLength(1)),
  args: v.optional(v.array(v.string()), [])
})
/** Methods that read a key from the environment, which `authenticate` cannot ask for. */
const KEY_METHOD = /api[-_ ]?key|gateway|vertex/i

function terminalAuth(method: AuthMethod) {
  const parsed = v.safeParse(terminalAuthSchema, method._meta?.[TERMINAL_AUTH_META])
  return parsed.success ? parsed.output : null
}

/**
 * The method `authenticate` can complete on its own, such as a browser sign-in: not a key from
 * the environment, and not a terminal login.
 */
export function interactiveSignInMethod(methods: readonly AuthMethod[]): AuthMethod | null {
  return (
    methods.find(
      (method) => !terminalAuth(method) && !KEY_METHOD.test(`${method.id} ${method.name}`)
    ) ?? null
  )
}

/** The terminal sign-in the agent advertises, else the one Kalka knows for it. */
export function terminalSignIn(
  methods: readonly AuthMethod[],
  agentDef: ACPAgentDef
): ACPTerminalSignIn | null {
  for (const method of methods) {
    const auth = terminalAuth(method)
    if (auth) return { command: [auth.command, ...auth.args].join(' ') }
  }
  return agentDef.terminalSignIn ?? null
}

/** Answers nothing: the sign-in connection opens no session, so no tool asks for permission. */
const signInClient: Client = {
  requestPermission: async () => ({ outcome: { outcome: 'cancelled' } }),
  sessionUpdate: async () => undefined
}

/** An agent started only to sign in, and how to stop it. */
export interface ACPSignInConnection {
  agent: Pick<ACPConnection, 'connection' | 'initialized'>
  close(): Promise<void>
}

type OpenConnection = (agentDef: ACPAgentDef) => Promise<ACPSignInConnection>

async function openSignInConnection(agentDef: ACPAgentDef): Promise<ACPSignInConnection> {
  // Stopping it is expected, not a crash to report.
  let closing = false
  const agent = await openACPConnection({
    agentDef,
    client: signInClient,
    destroying: () => closing,
    onUnexpectedClose: () => undefined
  })
  return {
    agent,
    close: async () => {
      closing = true
      await agent.child.kill().catch(() => undefined)
    }
  }
}

/**
 * Starts the agent on its own, signs it in through ACP `authenticate` with the method it
 * advertises, and stops it. The chat's own agent restarts for the next message, so it picks
 * up the new sign-in. Claude Code's adapter signs in only from a terminal, which the outcome
 * says, with the command to run.
 */
export async function signInToACPAgent(
  agentDef: ACPAgentDef,
  open: OpenConnection = openSignInConnection
): Promise<ACPSignInOutcome> {
  let opened: ACPSignInConnection
  try {
    opened = await open(agentDef)
  } catch (error) {
    return { status: 'failed', message: errorSummary(error) }
  }
  const { agent } = opened
  try {
    const methods = agent.initialized.authMethods ?? []
    if (methods.length === 0) return { status: 'signed-in' }
    const method = interactiveSignInMethod(methods)
    const terminal = terminalSignIn(methods, agentDef)
    if (!method) return { status: 'terminal', signIn: terminal }
    try {
      await agent.connection.authenticate({ methodId: method.id })
      return { status: 'signed-in' }
    } catch (error) {
      if (terminal) return { status: 'terminal', signIn: terminal }
      return { status: 'failed', message: errorSummary(error) }
    }
  } finally {
    await opened.close()
  }
}
