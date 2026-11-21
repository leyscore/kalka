import { afterEach, expect, test } from 'bun:test'

import { cloudBilling, cloudWorkspaceOf } from '@/app/collab/server/cloud-billing'

const original = globalThis.fetch
const calls: { url: string; init?: RequestInit }[] = []

afterEach(() => {
  globalThis.fetch = original
  calls.length = 0
})

test('a Cloud workspace is named by its address; a self-hosted server is not one', () => {
  expect(cloudWorkspaceOf('https://app.kalka.design/w/abcdefgh12345678')).toEqual({
    origin: 'https://app.kalka.design',
    id: 'abcdefgh12345678'
  })
  expect(cloudWorkspaceOf('https://kalka.pixelers.fr')).toBeNull()
})

test('checkout goes with the session cookie and the app header', async () => {
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    calls.push({ url, init })
    return new Response(JSON.stringify({ url: 'https://checkout.stripe.com/c/pay' }))
  }) as typeof fetch
  const result = await cloudBilling.checkout(
    'https://app.kalka.design',
    'abcdefgh12345678',
    'pro',
    'year'
  )
  expect(result.url).toContain('checkout.stripe.com')
  expect(calls[0]?.init?.credentials).toBe('same-origin')
  expect(new Headers(calls[0]?.init?.headers).get('X-Kalka-App')).toBe('1')
  expect(String(calls[0]?.init?.body)).toBe(JSON.stringify({ plan: 'pro', interval: 'year' }))
})
