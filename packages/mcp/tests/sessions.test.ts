import { afterEach, expect, setSystemTime, test } from 'bun:test'

import { createMCPSessionManager } from '../src/server/sessions'

afterEach(() => setSystemTime())

function manager(closed: string[]) {
  return createMCPSessionManager({
    serverVersion: '0.0.0',
    registerTools: () => undefined,
    onSessionClosed: (id) => closed.push(id)
  })
}

const HEADERS = {
  'content-type': 'application/json',
  accept: 'application/json, text/event-stream'
}

function post(body: unknown, sessionId?: string): Request {
  return new Request('http://localhost/mcp', {
    method: 'POST',
    headers: sessionId
      ? { ...HEADERS, 'mcp-session-id': sessionId, 'mcp-protocol-version': '2025-06-18' }
      : HEADERS,
    body: JSON.stringify(body)
  })
}

const initialize = post({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 't', version: '1' }
  }
})

type Sessions = ReturnType<typeof manager>

/** Opens a session as a client does, with an initialize request. */
async function open(sessions: Sessions, id: string): Promise<void> {
  const transport = await sessions.resolveTransport(id)
  if ('error' in transport) throw new Error(transport.error)
  expect((await transport.handleRequest(initialize.clone())).ok).toBe(true)
}

test('at the limit, a session idle for a minute gives its place to a new client', async () => {
  const closed: string[] = []
  const sessions = manager(closed)
  const start = new Date('2026-10-15T12:00:00Z')
  setSystemTime(start)
  for (let index = 0; index < 10; index++) await open(sessions, `client-${index}`)
  expect(await sessions.resolveTransport('newcomer')).toEqual({ error: 'too_many' })

  setSystemTime(new Date(start.getTime() + 2 * 60_000))
  for (let index = 1; index < 10; index++) {
    const transport = sessions.getExistingTransport(`client-${index}`)
    if ('error' in transport) throw new Error(transport.error)
    await transport.handleRequest(
      post({ jsonrpc: '2.0', id: 2, method: 'ping' }, `client-${index}`)
    )
  }
  expect('error' in (await sessions.resolveTransport('newcomer'))).toBe(false)
  expect(closed).toEqual(['client-0'])
  await sessions.clear()
})

test('a session whose first request does not initialize it is closed without an agent', async () => {
  const closed: string[] = []
  const sessions = manager(closed)
  const transport = await sessions.resolveTransport('broken')
  if ('error' in transport) throw new Error(transport.error)
  await transport.handleRequest(post({ jsonrpc: '2.0', id: 1, method: 'tools/list' }))
  expect(sessions.getExistingTransport('broken')).toEqual({ error: 'not_found' })
  expect(closed).toEqual([])
  await sessions.clear()
})

test('failed initializations do not use up the session limit', async () => {
  const sessions = manager([])
  for (let index = 0; index < 12; index++) {
    const transport = await sessions.resolveTransport(`bad-${index}`)
    if ('error' in transport) throw new Error(transport.error)
    await transport.handleRequest(post({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }))
  }
  await open(sessions, 'good')
  expect('error' in sessions.getExistingTransport('good')).toBe(false)
  await sessions.clear()
})
