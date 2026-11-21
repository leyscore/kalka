import { describe, expect, test } from 'bun:test'

import { answersFlow, signInStartURL } from '@/app/collab/server/sign-in-flow'
import { createPKCEFlow, pkceChallenge } from '@/app/runtime/pkce'

describe('a single sign-on started by the app', () => {
  test('sends the challenge of a verifier it keeps, and a state of its own', async () => {
    const flow = await createPKCEFlow()
    expect(flow.verifier).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(flow.challenge).toBe(await pkceChallenge(flow.verifier))
    const other = await createPKCEFlow()
    expect(other.state).not.toBe(flow.state)
    expect(other.verifier).not.toBe(flow.verifier)
  })

  test('asks the server to come back with its state, and never sends the verifier', () => {
    const flow = { state: 'st', verifier: 'secret-verifier', challenge: 'ch' }
    const url = new URL(
      signInStartURL('https://kalka.example.com/auth/oidc/start', 'kalka://oauth/server', flow)
    )
    expect(url.searchParams.get('return')).toBe('kalka://oauth/server?state=st')
    expect(url.searchParams.get('code_challenge')).toBe('ch')
    expect(url.searchParams.get('code_challenge_method')).toBe('S256')
    expect(url.href).not.toContain('secret-verifier')
    const browser = new URL(
      signInStartURL(
        'https://s.example/auth/oidc/start',
        'https://app.example/oauth/server.html?x=1',
        flow
      )
    )
    expect(browser.searchParams.get('return')).toBe(
      'https://app.example/oauth/server.html?x=1&state=st'
    )
  })

  test('takes only the answer to its own sign-in', () => {
    const flow = { state: 'st', verifier: 'v', challenge: 'c' }
    expect(answersFlow('?state=st&code=abc', flow)).toBe(true)
    expect(answersFlow('?code=abc', flow)).toBe(false)
    expect(answersFlow('?state=other&code=abc', flow)).toBe(false)
  })
})
