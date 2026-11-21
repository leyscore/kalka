import { describe, expect, test } from 'bun:test'

import { ServerRequestError } from '@/app/collab/server/api'
import { serverProblem } from '@/app/collab/server/problem'

describe('server problems', () => {
  test("reads the server's refusals as problems Kalka explains in its own words", () => {
    expect(serverProblem(new ServerRequestError(401, 'Wrong email or password.'))).toBe(
      'wrong-credentials'
    )
    expect(serverProblem(new ServerRequestError(403, 'This account is disabled.'))).toBe(
      'account-disabled'
    )
    expect(serverProblem(new ServerRequestError(403, 'Sign in with single sign-on.'))).toBe(
      'use-sso'
    )
    expect(serverProblem(new ServerRequestError(429, 'Too many attempts.'))).toBe(
      'too-many-attempts'
    )
  })

  test('tells an address that is not a Kalka server from one that cannot be reached', () => {
    expect(serverProblem(new ServerRequestError(0, 'unreachable'))).toBe('unreachable')
    expect(serverProblem(new ServerRequestError(200, 'not-a-kalka-server'))).toBe('not-kalka')
    expect(serverProblem(new ServerRequestError(401, 'signed-out'))).toBe('signed-out')
    expect(serverProblem(new Error('boom'))).toBe('unreachable')
  })
})
