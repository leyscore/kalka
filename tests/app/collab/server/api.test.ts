import { describe, expect, test } from 'bun:test'

import { normalizeServerURL } from '@/app/collab/server/api'

describe('server addresses', () => {
  test('a typed address without a scheme is HTTPS, except a server on this machine', () => {
    expect(normalizeServerURL('kalka.acme.com/')).toBe('https://kalka.acme.com')
    expect(normalizeServerURL('localhost:8787')).toBe('http://localhost:8787')
    expect(normalizeServerURL('127.0.0.1:8787')).toBe('http://127.0.0.1:8787')
    expect(normalizeServerURL('https://localhost:8443')).toBe('https://localhost:8443')
    expect(normalizeServerURL('ftp://kalka.acme.com')).toBeNull()
  })
})
