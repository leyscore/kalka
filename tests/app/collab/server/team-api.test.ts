import { afterEach, expect, test } from 'bun:test'

import { teamAPI } from '@/app/collab/server/team-api'

const original = globalThis.fetch
const calls: { url: string; init?: RequestInit }[] = []

function reply(body: unknown, status = 200) {
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    calls.push({ url, init })
    return new Response(JSON.stringify(body), { status })
  }) as typeof fetch
}

afterEach(() => {
  globalThis.fetch = original
  calls.length = 0
})

test('reads the people a server lists, as it sends them', async () => {
  reply([
    {
      id: 'u1',
      email: 'ada@team.test',
      name: 'Ada',
      role: 'editor',
      source: 'local',
      disabled: false,
      createdAt: 1,
      lastSeenAt: null,
      provisioned: false
    }
  ])
  const members = await teamAPI.members('https://team.test', 'token')
  expect(members[0]?.lastSeenAt).toBeNull()
  expect(calls[0]?.url).toBe('https://team.test/api/users')
  expect(new Headers(calls[0]?.init?.headers).get('Authorization')).toBe('Bearer token')
})

test('an invitation without an address asks the server for a link', async () => {
  reply({ code: 'c', expiresAt: 2, url: 'https://team.test/#invite=c', emailed: false })
  const invite = await teamAPI.invite('https://team.test', 'token', 'viewer')
  expect(invite.url).toContain('#invite=')
  expect(JSON.parse(String(calls[0]?.init?.body))).toEqual({ role: 'viewer' })
})

test("the server's refusal comes back as its message", async () => {
  reply({ error: 'You cannot delete your own account.' }, 409)
  await expect(teamAPI.removeMember('https://team.test', 'token', 'u1')).rejects.toThrow(
    'You cannot delete your own account.'
  )
})
