import { afterEach, expect, setSystemTime, test } from 'bun:test'

import { createMCPSessionManager } from '#mcp/server/sessions'

afterEach(() => setSystemTime())

function manager(closed: string[]) {
  return createMCPSessionManager({
    serverVersion: '0.0.0',
    registerTools: () => undefined,
    onSessionClosed: (id) => closed.push(id)
  })
}

test('at the limit, a session idle for a minute gives its place to a new client', async () => {
  const closed: string[] = []
  const sessions = manager(closed)
  const start = new Date('2026-10-15T12:00:00Z')
  setSystemTime(start)
  for (let index = 0; index < 10; index++) {
    expect('error' in (await sessions.resolveTransport(`client-${index}`))).toBe(false)
  }
  expect(await sessions.resolveTransport('newcomer')).toEqual({ error: 'too_many' })

  setSystemTime(new Date(start.getTime() + 2 * 60_000))
  for (let index = 1; index < 10; index++) {
    const transport = await sessions.resolveTransport(`client-${index}`)
    if (!('error' in transport)) sessions.touch(`client-${index}`, transport)
  }
  expect('error' in (await sessions.resolveTransport('newcomer'))).toBe(false)
  expect(closed).toEqual(['client-0'])
  await sessions.clear()
})
