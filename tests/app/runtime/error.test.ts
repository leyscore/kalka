import { describe, expect, test } from 'bun:test'

import { RequestError } from '@agentclientprotocol/sdk'

import { errorFacts, errorSummary, UNKNOWN_ERROR_MESSAGE } from '@/app/runtime/error'

describe('error facts', () => {
  test('reads a JSON-RPC error object as an ACP agent rejects with it', () => {
    const facts = errorFacts({
      code: -32000,
      message: 'Authentication required',
      data: { reason: 'OAuth session expired and could not be refreshed' }
    })
    expect(facts).toMatchObject({
      name: 'JSONRPCError',
      code: -32000,
      message: 'Authentication required',
      data: { reason: 'OAuth session expired and could not be refreshed' }
    })
    expect(facts.messages).toEqual([
      'Authentication required',
      'OAuth session expired and could not be refreshed'
    ])
  })

  test('reads a failed JSON-RPC response for its error', () => {
    const facts = errorFacts({ jsonrpc: '2.0', id: 3, error: { code: -32603, message: 'Boom' } })
    expect(facts).toMatchObject({ code: -32603, message: 'Boom' })
  })

  test('reads the ACP SDK’s RequestError', () => {
    const facts = errorFacts(RequestError.authRequired())
    expect(facts).toMatchObject({ name: 'RequestError', code: -32000 })
  })

  test('follows an Error’s object cause for its message and code', () => {
    const error = new Error('The agent did not start', {
      cause: { code: -32000, message: 'Authentication required' }
    })
    const facts = errorFacts(error)
    expect(facts).toMatchObject({ name: 'Error', code: -32000 })
    expect(facts.summary).toBe('The agent did not start: Authentication required')
  })

  test('skips an [object Object] message for the cause that explains it', () => {
    const error = new Error('[object Object]', { cause: { message: 'invalid x-api-key' } })
    expect(errorSummary(error)).toBe('invalid x-api-key')
  })

  test('reads strings and gives anything unreadable a plain message', () => {
    expect(errorFacts('plain failure')).toMatchObject({
      name: 'UnknownError',
      message: 'plain failure',
      code: null
    })
    expect(errorSummary({})).toBe(UNKNOWN_ERROR_MESSAGE)
    expect(errorSummary(undefined)).toBe(UNKNOWN_ERROR_MESSAGE)
  })

  test('stops at a cause that loops back', () => {
    const error = new Error('outer')
    const inner = new Error('inner', { cause: error })
    error.cause = inner
    expect(errorFacts(error).messages).toEqual(['outer', 'inner'])
  })
})
