import { describe, expect, test } from 'bun:test'

import { APICallError, StreamProviderError } from 'ai'

import {
  classifyAIChatError,
  classifyAIChatFinish,
  isAuthenticationError,
  isInsufficientCreditError,
  needsReconnect
} from '@/app/ai/chat/failure'

describe('AI chat failures', () => {
  test('recognizes provider credit and quota failures', () => {
    expect(isInsufficientCreditError({ statusCode: 402 })).toBe(true)
    expect(isInsufficientCreditError(new Error('Insufficient balance. Please top up.'))).toBe(true)
    expect(isInsufficientCreditError(new Error('Quota exceeded for this account'))).toBe(true)
    expect(isInsufficientCreditError(new Error('Rate limit reached'))).toBe(false)
  })

  test('classifies output-limit finishes', () => {
    expect(classifyAIChatFinish('length')).toEqual({ reason: 'output-limit' })
    expect(classifyAIChatFinish('stop')).toBeNull()
  })

  test('classifies actionable provider failures', () => {
    const apiError = (statusCode: number, message: string) =>
      new APICallError({
        message,
        url: 'https://provider.example/v1/chat',
        requestBodyValues: {},
        statusCode
      })

    expect(classifyAIChatError(apiError(401, 'API key expired.'))).toMatchObject({
      reason: 'authentication',
      statusCode: 401,
      retryable: false
    })
    expect(classifyAIChatError(apiError(403, 'Forbidden'))).toMatchObject({
      reason: 'forbidden',
      statusCode: 403
    })
    expect(classifyAIChatError(apiError(404, 'Model not found'))).toMatchObject({
      reason: 'model-not-found',
      statusCode: 404
    })
    expect(classifyAIChatError(apiError(429, 'Too many requests'))).toMatchObject({
      reason: 'rate-limit',
      statusCode: 429,
      retryable: true
    })
  })

  test('classifies provider errors reported after the stream started', () => {
    const streamError = new StreamProviderError({
      message: 'Too many requests',
      statusCode: 429,
      isRetryable: true
    })
    expect(classifyAIChatError(streamError)).toMatchObject({
      reason: 'rate-limit',
      statusCode: 429,
      retryable: true
    })
  })

  test('classifies provider messages without exposing them as presentation copy', () => {
    expect(classifyAIChatError(new Error('API key expired.')).reason).toBe('authentication')
    expect(classifyAIChatError(new Error('Invalid API key.')).reason).toBe('authentication')
    expect(classifyAIChatError(new Error('Failed to fetch provider')).reason).toBe('network')
    expect(classifyAIChatError(new Error('Provider unavailable')).reason).toBe('request-failed')
  })

  test('retains request details for diagnostics', () => {
    expect(classifyAIChatError(new Error('Payment required'))).toMatchObject({
      reason: 'insufficient-credit',
      detail: 'Payment required'
    })
    expect(classifyAIChatError(new Error('Provider unavailable'))).toMatchObject({
      reason: 'request-failed',
      detail: 'Provider unavailable'
    })
  })

  test('recognizes expired sign-ins in what providers and coding agents report', () => {
    const reported = [
      'Failed to authenticate: OAuth session expired and could not be refreshed',
      'Failed to authenticate. API Error: 401 {"type":"error","error":{"type":"authentication_error","message":"OAuth token has expired."}}',
      'invalid x-api-key',
      'Invalid API key · Please run /login',
      '{"type":"error","error":{"type":"authentication_error","message":"invalid x-api-key"}}'
    ]
    for (const message of reported) {
      expect(isAuthenticationError(new Error(message))).toBe(true)
      expect(classifyAIChatError(new Error(message))).toMatchObject({
        reason: 'authentication',
        retryable: false
      })
    }
    expect(isAuthenticationError(new Error('Rate limit reached'))).toBe(false)
    expect(isAuthenticationError(new Error('Model not found'))).toBe(false)
  })

  test('recognizes an ACP agent that answers it needs signing in', () => {
    const rpc = { code: -32000, message: 'Authentication required' }
    expect(classifyAIChatError(rpc)).toMatchObject({
      reason: 'authentication',
      code: -32000,
      detail: 'Authentication required',
      retryable: false
    })
    // A wrapper keeps the agent's error as its cause.
    const wrapped = new Error('The agent did not start', { cause: rpc })
    expect(classifyAIChatError(wrapped)).toMatchObject({ reason: 'authentication', code: -32000 })
    // A JSON-RPC code is not an HTTP status.
    expect(classifyAIChatError(rpc).statusCode).toBeUndefined()
  })

  test('keeps the message of an agent error object instead of [object Object]', () => {
    const failure = classifyAIChatError({
      code: -32603,
      message: 'Internal error',
      data: { details: 'Query closed before response received' }
    })
    expect(failure.reason).toBe('request-failed')
    expect(failure.detail).toContain('Query closed before response received')
    expect(failure.detail).not.toContain('[object Object]')
  })

  test('reads a status from the cause of a wrapped provider error', () => {
    const wrapped = new Error('Request failed', { cause: { status: 401 } })
    expect(classifyAIChatError(wrapped)).toMatchObject({
      reason: 'authentication',
      statusCode: 401
    })
  })

  test('offers Reconnect only for sign-ins and keys that stopped working', () => {
    const forbidden = new APICallError({
      message: 'Forbidden',
      url: 'https://provider.example/v1/chat',
      requestBodyValues: {},
      statusCode: 403
    })
    expect(needsReconnect(classifyAIChatError(new Error('invalid x-api-key')))).toBe(true)
    expect(needsReconnect(classifyAIChatError(forbidden))).toBe(true)
    expect(needsReconnect(classifyAIChatError(new Error('Rate limit reached')))).toBe(false)
    expect(needsReconnect(classifyAIChatError(new Error('Provider unavailable')))).toBe(false)
    expect(needsReconnect(null)).toBe(false)
  })
})
