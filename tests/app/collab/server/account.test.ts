import { describe, expect, test } from 'bun:test'

import { replacesAccount } from '@/app/collab/server/account'

const SERVER = 'https://app.kalka.design/w/0123456789abcdef'

describe('a launch link that signs in', () => {
  test('replaces the stored account when it names another server or another person', () => {
    const current = { url: SERVER, user: { id: 'me' } }
    expect(
      replacesAccount(current, 'https://app.kalka.design/w/fedcba9876543210', { id: 'me' })
    ).toBe(true)
    expect(replacesAccount(current, SERVER, { id: 'someone-else' })).toBe(true)
  })

  test('replaces nothing when it is the same account, or none is stored', () => {
    expect(replacesAccount({ url: SERVER, user: { id: 'me' } }, SERVER, { id: 'me' })).toBe(false)
    expect(replacesAccount(null, SERVER, { id: 'me' })).toBe(false)
  })
})
