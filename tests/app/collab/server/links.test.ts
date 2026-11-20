import { describe, expect, test } from 'bun:test'

import { normalizeServerURL } from '@/app/collab/server/api'
import { linkedServerURL, offerLinkedServer, serverLinkURL } from '@/app/collab/server/links'

describe('Kalka server links', () => {
  test('a server link carries the address and round-trips through the URL', () => {
    const link = serverLinkURL('https://kalka.acme.com')
    expect(link).toBe('kalka://server?url=https%3A%2F%2Fkalka.acme.com')
    expect(new URL(link).searchParams.get('url')).toBe('https://kalka.acme.com')
  })

  test('an address from a link only fills in Settings, normalized', () => {
    let opened = 0
    expect(offerLinkedServer('kalka.acme.com/', () => opened++)).toBe(true)
    expect(linkedServerURL.value).toBe('https://kalka.acme.com')
    expect(opened).toBe(1)
  })

  test('anything that is not an http address is refused', () => {
    linkedServerURL.value = null
    for (const input of ['', 'mailto:team@acme.com', 'ftp://kalka.acme.com']) {
      expect(offerLinkedServer(input, () => undefined)).toBe(false)
    }
    expect(linkedServerURL.value).toBeNull()
    expect(normalizeServerURL('http://localhost:8787/')).toBe('http://localhost:8787')
  })
})
