import { afterEach, expect, test } from 'bun:test'

import { trashAPI } from '@/app/collab/server/trash-api'

const original = globalThis.fetch
const calls: { url: string; method?: string }[] = []

function reply(body: unknown) {
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    calls.push({ url, method: init?.method })
    return new Response(JSON.stringify(body), { status: 200 })
  }) as typeof fetch
}

afterEach(() => {
  globalThis.fetch = original
  calls.length = 0
})

test('reads the trash with who deleted each file and when it goes', async () => {
  reply([{ id: 'd1', name: 'Pricing', deletedAt: 1, deletedBy: null, expiresAt: 2 }])
  const trash = await trashAPI.list('https://team.test', 'token')
  expect(trash[0]).toEqual({
    id: 'd1',
    name: 'Pricing',
    deletedAt: 1,
    deletedBy: null,
    expiresAt: 2
  })
  expect(calls[0]?.url).toBe('https://team.test/api/trash')
})

test('restoring and erasing name the file in the trash', async () => {
  reply({ id: 'd1', name: 'Pricing', createdAt: 1, updatedAt: 2, hasFile: false })
  await trashAPI.restore('https://team.test', 'token', 'd1')
  reply({ deleted: true })
  await trashAPI.erase('https://team.test', 'token', 'd1')
  expect(calls).toEqual([
    { url: 'https://team.test/api/trash/d1/restore', method: 'POST' },
    { url: 'https://team.test/api/trash/d1', method: 'DELETE' }
  ])
})
