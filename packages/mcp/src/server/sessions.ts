import { randomUUID } from 'node:crypto'

import {
  isJSONRPCResultResponse,
  McpServer,
  WebStandardStreamableHTTPServerTransport
} from '@modelcontextprotocol/server'
import { withTimeout } from 'es-toolkit/promise'
import * as v from 'valibot'

import { MCP_AGENT_HEADER } from '@kalka/core/constants'

import { createServerIdentity } from '#mcp/server/identity'
import { createPendingRequests } from '#mcp/server/pending-requests'
import {
  MCP_AGENT_KINDS,
  type MCPAgentKind,
  type MCPAgentSession,
  type MCPToolSettled
} from '#mcp/tool/registration'

export type MCPTransport = {
  handleRequest: (request: Request) => Promise<Response>
  close: () => Promise<void>
}

type MCPSession = {
  transport: MCPTransport
  server: McpServer
  requests: ReturnType<typeof createPendingRequests>
  lastSeen: number
  /** Requests still being answered: a session in use is neither expired nor evicted. */
  activeRequests: number
  /** Whether its first request was a successful initialize; until then it is no agent. */
  initialized: boolean
}

type MCPSessionManagerOptions = {
  serverVersion: string
  /** `streams` says whether the session can carry requests from the server during a call. */
  registerTools: (
    server: McpServer,
    session: MCPAgentSession,
    streams: boolean,
    onToolSettled: MCPToolSettled
  ) => void
  /** Told when a session ends, so the app stops showing its agent. */
  onSessionClosed?: (sessionId: string) => void
}

/** The capabilities part of an `initialize` request, alone or in a batch. */
const InitializeMessage = v.looseObject({
  method: v.literal('initialize'),
  params: v.looseObject({
    capabilities: v.looseObject({
      elicitation: v.optional(v.unknown()),
      sampling: v.optional(v.unknown())
    })
  })
})
const InitializeBody = v.union([InitializeMessage, v.array(v.unknown())])

/** What a new session is: who sends its calls, and whether its answers stream. */
export interface NewSession {
  kind: MCPAgentKind
  /** Whether the client can answer the server's own requests, such as a form for the user. */
  streams: boolean
}

/**
 * Whether a session's first request comes from a client that can answer the server's own requests
 * (elicitation or sampling), read from its `initialize` capabilities without consuming the body.
 */
async function answersServerRequests(request: Request): Promise<boolean> {
  if (request.method !== 'POST') return false
  const text = await request
    .clone()
    .text()
    .catch(() => '')
  const parsed = v.safeParse(v.pipe(v.string(), v.parseJson(), InitializeBody), text)
  if (!parsed.success) return false
  const messages = Array.isArray(parsed.output) ? parsed.output : [parsed.output]
  return messages.some((message) => {
    const initialize = v.safeParse(InitializeMessage, message)
    if (!initialize.success) return false
    const { elicitation, sampling } = initialize.output.params.capabilities
    return elicitation !== undefined || sampling !== undefined
  })
}

/** The session a request without a session ID opens, from its agent header and capabilities. */
export async function newSession(request: Request): Promise<NewSession> {
  const header = request.headers.get(MCP_AGENT_HEADER)
  return {
    kind: MCP_AGENT_KINDS.find((kind) => kind === header) ?? 'mcp',
    streams: await answersServerRequests(request)
  }
}

const MAX_MCP_SESSIONS = 10
const MCP_SESSION_TTL_MS = 15 * 60_000
/**
 * At the session limit, a session idle this long gives its place to a new one: a client that
 * crashed without closing its session would otherwise lock every other client out until the TTL.
 */
const MCP_SESSION_EVICT_IDLE_MS = 60_000
const SESSION_CLOSE_TIMEOUT_MS = 5_000

function describeError(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

async function closeSession(session: Pick<MCPSession, 'transport' | 'server'>): Promise<void> {
  try {
    await withTimeout(() => session.transport.close(), SESSION_CLOSE_TIMEOUT_MS)
  } catch (e) {
    // Best-effort: the transport may already be closed or in a bad state
    process.stderr.write(`  MCP session: transport close warning (${describeError(e)})\n`)
  }
  try {
    await withTimeout(() => session.server.close(), SESSION_CLOSE_TIMEOUT_MS)
  } catch (e) {
    // Best-effort
    process.stderr.write(`  MCP session: server close warning (${describeError(e)})\n`)
  }
}

/**
 * The SDK assigns the session ID before it validates the InitializeRequest, so a 200 carrying the
 * session header can still be a JSON-RPC error.
 */
async function isInitializeResult(response: Response, id: string): Promise<boolean> {
  if (!response.ok || response.headers.get('mcp-session-id') !== id) return false
  // A streamed answer is an event stream, not JSON; the SDK sends it only once initialized.
  if (response.headers.get('content-type')?.includes('text/event-stream')) return true
  const message: unknown = await response
    .clone()
    .json()
    .catch(() => undefined)
  return isJSONRPCResultResponse(message)
}

export function createMCPSessionManager({
  serverVersion,
  registerTools,
  onSessionClosed
}: MCPSessionManagerOptions) {
  const sessions = new Map<string, MCPSession>()
  const closing = new Map<string, Promise<void>>()

  function scheduleClose(session: MCPSession, id: string): Promise<void> {
    try {
      if (session.initialized) onSessionClosed?.(id)
    } catch (e) {
      // The app's notification must not prevent resource cleanup.
      process.stderr.write(`  MCP session: close notification warning (${describeError(e)})\n`)
    }
    const task = closeSession(session).finally(() => closing.delete(id))
    closing.set(id, task)
    return task
  }

  function notifyToolsChanged() {
    for (const session of sessions.values()) {
      try {
        session.server.sendToolListChanged()
      } catch {
        continue
      }
    }
  }

  function cleanupExpired() {
    const now = Date.now()
    for (const [id, session] of sessions) {
      if (session.activeRequests === 0 && now - session.lastSeen > MCP_SESSION_TTL_MS) {
        sessions.delete(id)
        void scheduleClose(session, id)
      }
    }
  }

  /** Closes the session idle the longest, when it has been idle long enough to give way. */
  function evictIdlest(): boolean {
    let idlest: [string, MCPSession] | undefined
    for (const entry of sessions) {
      if (entry[1].activeRequests > 0) continue
      if (!idlest || entry[1].lastSeen < idlest[1].lastSeen) idlest = entry
    }
    if (!idlest || Date.now() - idlest[1].lastSeen < MCP_SESSION_EVICT_IDLE_MS) return false
    sessions.delete(idlest[0])
    void scheduleClose(idlest[1], idlest[0])
    return true
  }

  const creating = new Map<string, Promise<MCPTransport>>()
  let closed = false

  async function createSession(
    id: string,
    kind: MCPAgentKind,
    streams: boolean
  ): Promise<MCPTransport> {
    if (closed) throw new Error('Session manager is closed')
    const inFlight = creating.get(id)
    if (inFlight) return inFlight

    const promise = (async () => {
      const server = new McpServer(...createServerIdentity(serverVersion))

      // A plain JSON answer cannot carry the server's own requests, such as a form for the user,
      // so a client that can answer them gets each tool call's answer as an event stream.
      const transport = new WebStandardStreamableHTTPServerTransport({
        sessionIdGenerator: () => id,
        enableJsonResponse: !streams
      })
      const requests = createPendingRequests(transport)
      // Connect the SDK before exposing its transport; the client's InitializeRequest is
      // processed later by handleRequest, so connect() alone does not make a valid session.
      try {
        registerTools(server, { id, kind }, streams, requests.releaseCancelled)
        await server.connect(transport)
      } catch (e) {
        await closeSession({ transport, server })
        throw e
      }
      // `closed` is mutated by clear() which can run concurrently — TypeScript's
      // control-flow analysis can't track this cross-closure mutation.
      // oxlint-disable-next-line no-unnecessary-condition
      if (closed) {
        // Manager was closed while we were connecting — clean up immediately.
        await closeSession({ transport, server })
        throw new Error('Session manager closed during session creation')
      }
      const session: MCPSession = {
        server,
        requests,
        lastSeen: Date.now(),
        activeRequests: 0,
        initialized: false,
        transport: {
          close: () => transport.close(),
          handleRequest: (request) => handleSessionRequest(id, session, request)
        }
      }
      // Only a full close ends the session; keep the SDK's own protocol cleanup.
      const onclose = transport.onclose
      transport.onclose = () => {
        requests.close()
        try {
          onclose?.()
        } finally {
          void deleteSession(id)
        }
      }
      sessions.set(id, session)
      return session.transport
    })()

    creating.set(id, promise)
    try {
      return await promise
    } finally {
      creating.delete(id)
    }
  }

  async function handleSessionRequest(
    id: string,
    session: MCPSession,
    request: Request
  ): Promise<Response> {
    session.activeRequests++
    session.lastSeen = Date.now()
    try {
      const response = await session.requests.handle(request)
      if (!session.initialized) {
        // A session whose first request does not initialize it would hold a slot forever.
        session.initialized = await isInitializeResult(response, id)
        if (!session.initialized) await deleteSession(id)
      }
      return response
    } catch (error) {
      if (!session.initialized) await deleteSession(id)
      throw error
    } finally {
      session.activeRequests--
      session.lastSeen = Date.now()
    }
  }

  function resolveTransport(
    sessionId: string | undefined,
    session: NewSession = { kind: 'mcp', streams: false }
  ): Promise<MCPTransport | { error: 'too_many' | 'closed' }> {
    if (closed) return Promise.resolve({ error: 'closed' })
    cleanupExpired()
    const existing = sessionId ? sessions.get(sessionId) : undefined
    if (existing) return Promise.resolve(existing.transport)
    // Reuse an in-flight creation for the same sessionId before enforcing the cap.
    if (sessionId) {
      const inFlight = creating.get(sessionId)
      if (inFlight) {
        // Wrap with the same catch as createSession so clear() during
        // in-flight creation returns { error: 'closed' } instead of throwing.
        return inFlight.catch((e) => {
          if (closed) return { error: 'closed' as const }
          throw e
        })
      }
    }
    if (sessions.size + creating.size + closing.size >= MAX_MCP_SESSIONS && !evictIdlest()) {
      return Promise.resolve({ error: 'too_many' })
    }
    return createSession(sessionId ?? randomUUID(), session.kind, session.streams).catch((e) => {
      // If the manager was closed during session creation, return the structured
      // error instead of letting the throw escape as a route-level 500.
      if (closed) return { error: 'closed' as const }
      throw e
    })
  }

  /**
   * Look up an existing session's transport without creating a new session.
   * Used for DELETE requests where creating a session just to delete it
   * would waste a session slot.
   */
  function getExistingTransport(
    sessionId: string | undefined
  ): MCPTransport | { error: 'not_found' | 'closed' } {
    if (closed) return { error: 'closed' }
    if (!sessionId) return { error: 'not_found' }
    const existing = sessions.get(sessionId)
    if (existing) return existing.transport
    return { error: 'not_found' }
  }

  function deleteSession(sessionId: string | undefined): Promise<void> {
    if (closed || !sessionId) return Promise.resolve()
    const session = sessions.get(sessionId)
    if (!session) return closing.get(sessionId) ?? Promise.resolve()
    sessions.delete(sessionId)
    return scheduleClose(session, sessionId)
  }

  async function clear() {
    closed = true
    // Collect sessions before awaiting in-flight creations so new sessions
    // can't be added during shutdown.
    const all = [...sessions]
    sessions.clear()
    // Wait for in-flight session creations to finish (they will check
    // `closed` and clean up without storing the session).
    const inFlight = [...creating.values()]
    await Promise.allSettled(inFlight)
    creating.clear()
    // Await both previously-scheduled closes (from cleanupExpired/deleteSession)
    // and closes for sessions still alive at clear() time.
    await Promise.allSettled([
      ...closing.values(),
      ...all.map(([id, session]) => scheduleClose(session, id))
    ])
  }

  return { clear, deleteSession, getExistingTransport, notifyToolsChanged, resolveTransport }
}
