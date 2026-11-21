import { describe, expect, test } from 'bun:test'

import { isKalkaCloud } from '@/app/collab/server/cloud'

const ORIGIN = 'https://app.kalka.design'

function answering(body: unknown, status = 200): (url: string) => Promise<Response> {
  return async () =>
    new Response(typeof body === 'string' ? body : JSON.stringify(body), { status })
}

describe('isKalkaCloud', () => {
  test('recognises a Cloud whose config names this origin', async () => {
    const config = { auth: { password: true, google: true }, url: ORIGIN }
    expect(await isKalkaCloud(ORIGIN, answering(config))).toBe(true)
  })

  test('refuses a config for another address, an HTML fallback or an error', async () => {
    const elsewhere = { auth: { password: true }, url: 'https://evil.example' }
    expect(await isKalkaCloud(ORIGIN, answering(elsewhere))).toBe(false)
    expect(await isKalkaCloud(ORIGIN, answering('<!doctype html><title>Kalka</title>'))).toBe(false)
    expect(await isKalkaCloud(ORIGIN, answering({ error: 'Not found.' }, 404))).toBe(false)
  })
})
