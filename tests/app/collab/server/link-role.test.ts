import { afterEach, expect, test } from 'bun:test'

import { serverAPI } from '@/app/collab/server/api'

const original = globalThis.fetch
const calls: { url: string; init?: RequestInit }[] = []

function reply(body: unknown) {
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    calls.push({ url, init })
    return new Response(JSON.stringify(body), { status: 200 })
  }) as typeof fetch
}

afterEach(() => {
  globalThis.fetch = original
  calls.length = 0
})

const document = { id: 'd1', name: 'Poster', createdAt: 1, updatedAt: 2, hasFile: false }

test('a file from a server older than link roles is shared to edit', async () => {
  reply(document)
  expect((await serverAPI.document('https://team.test', 'token', 'd1')).linkRole).toBe('edit')
})

test('sharing a file to view asks the server to store it', async () => {
  reply({ ...document, createdBy: 'u1', linkRole: 'view' })
  const shared = await serverAPI.setLinkRole('https://team.test', 'token', 'd1', 'view')
  expect(shared).toMatchObject({ linkRole: 'view', createdBy: 'u1' })
  expect(calls[0]?.url).toBe('https://team.test/api/documents/d1')
  expect(calls[0]?.init?.method).toBe('PATCH')
  expect(calls[0]?.init?.body).toBe(JSON.stringify({ linkRole: 'view' }))
})
