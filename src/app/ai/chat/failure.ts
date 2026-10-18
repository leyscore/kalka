import { APICallError, StreamProviderError } from 'ai'

import { errorFacts, JSONRPC_AUTH_REQUIRED_CODE } from '@/app/runtime/error'

export type AIChatFailureReason =
  | 'authentication'
  | 'forbidden'
  | 'insufficient-credit'
  | 'model-not-found'
  | 'network'
  | 'output-limit'
  | 'rate-limit'
  | 'request-failed'

export type AIChatFailure = {
  reason: AIChatFailureReason
  detail?: string
  statusCode?: number
  /** The error's own code, such as an ACP agent's JSON-RPC code. */
  code?: string | number
  retryable?: boolean
}

export type ProviderErrorShape = {
  statusCode?: unknown
  status?: unknown
  responseStatusCode?: unknown
  responseStatus?: unknown
  code?: unknown
  response?: { status?: unknown }
}

/** HTTP statuses only: a JSON-RPC code such as -32000 is not one. */
function statusNumber(value: unknown): number | null {
  let status: number | null = null
  if (typeof value === 'number') status = value
  else if (typeof value === 'string' && /^\d+$/.test(value)) status = Number(value)
  return status !== null && status >= 100 && status < 600 ? status : null
}

const MAX_CAUSE_DEPTH = 4

function ownStatus(error: unknown): number | null {
  if (APICallError.isInstance(error)) return error.statusCode ?? null
  if (typeof error !== 'object' || error === null) return null
  const value = error as ProviderErrorShape
  return (
    statusNumber(value.statusCode) ??
    statusNumber(value.status) ??
    statusNumber(value.responseStatusCode) ??
    statusNumber(value.responseStatus) ??
    statusNumber(value.code) ??
    statusNumber(value.response?.status)
  )
}

/** The HTTP status of the error or of the first cause that has one. */
export function providerErrorStatus(error: unknown): number | null {
  let current = error
  for (let depth = 0; depth < MAX_CAUSE_DEPTH && current != null; depth++) {
    const status = ownStatus(current)
    if (status !== null) return status
    current = typeof current === 'object' && 'cause' in current ? current.cause : null
  }
  return null
}

function normalizedErrorText(error: unknown): string {
  return errorFacts(error).messages.join('\n').toLowerCase()
}

/** What providers and coding agents say when a key, token, or sign-in no longer works. */
const AUTHENTICATION_PHRASES = [
  'failed to authenticate',
  'authentication required',
  'authentication failed',
  'authentication_error',
  'not authenticated',
  'unauthenticated',
  'unauthorized',
  'invalid x-api-key',
  'invalid api key',
  'invalid_api_key',
  'incorrect api key',
  'session expired',
  'token expired',
  'token has expired',
  'oauth session',
  'oauth token',
  'please run /login',
  'not logged in',
  'login required',
  'please log in'
]

function mentionsAuthentication(text: string): boolean {
  if (AUTHENTICATION_PHRASES.some((phrase) => text.includes(phrase))) return true
  return (
    (text.includes('expired') || text.includes('invalid') || text.includes('authentication')) &&
    (text.includes('key') || text.includes('token') || text.includes('credential'))
  )
}

/** A key, token, or agent sign-in that must be renewed before asking again can work. */
export function isAuthenticationError(error: unknown): boolean {
  const status = providerErrorStatus(error)
  if (status === 401) return true
  if (errorFacts(error).code === JSONRPC_AUTH_REQUIRED_CODE) return true
  return mentionsAuthentication(normalizedErrorText(error))
}

export function isInsufficientCreditError(error: unknown): boolean {
  if (providerErrorStatus(error) === 402) return true
  const text = normalizedErrorText(error)
  return [
    'insufficient credit',
    'insufficient balance',
    'insufficient quota',
    'credit balance',
    'payment required',
    'quota exceeded',
    'billing quota',
    'top up',
    'top-up'
  ].some((phrase) => text.includes(phrase))
}

function statusFailureReason(status: number | null): AIChatFailureReason | null {
  if (status === 401) return 'authentication'
  if (status === 402) return 'insufficient-credit'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'model-not-found'
  if (status === 408) return 'network'
  if (status === 429) return 'rate-limit'
  return null
}

function failureReason(error: unknown): AIChatFailureReason {
  // A 403 that says the sign-in expired is a sign-in to renew, not a model the key cannot use.
  if (isAuthenticationError(error)) return 'authentication'
  const statusReason = statusFailureReason(providerErrorStatus(error))
  if (statusReason) return statusReason
  if (isInsufficientCreditError(error)) return 'insufficient-credit'
  const text = normalizedErrorText(error)
  if (text.includes('rate limit') || text.includes('too many requests')) return 'rate-limit'
  if (text.includes('model not found') || text.includes('unknown model')) return 'model-not-found'
  if (
    text.includes('failed to fetch') ||
    text.includes('network') ||
    text.includes('cors') ||
    text.includes('connection')
  ) {
    return 'network'
  }
  return 'request-failed'
}

export function classifyAIChatFinish(finishReason?: string): AIChatFailure | null {
  return finishReason === 'length' ? { reason: 'output-limit' } : null
}

function retryable(error: unknown, reason: AIChatFailureReason): boolean | undefined {
  if (reason === 'authentication') return false
  // A provider error after the stream starts arrives as StreamProviderError, not APICallError.
  return APICallError.isInstance(error) || StreamProviderError.isInstance(error)
    ? error.isRetryable
    : undefined
}

export function classifyAIChatError(error: unknown): AIChatFailure {
  const facts = errorFacts(error)
  const reason = failureReason(error)
  return {
    reason,
    detail: facts.summary,
    statusCode: providerErrorStatus(error) ?? undefined,
    code: facts.code ?? undefined,
    retryable: retryable(error, reason)
  }
}

/**
 * Asking again cannot work until the key, token, or agent sign-in is renewed. A 403 counts:
 * reconnecting, or replacing the key in Settings, is also what fixes a key without access.
 */
export function needsReconnect(failure: AIChatFailure | null | undefined): boolean {
  return failure?.reason === 'authentication' || failure?.reason === 'forbidden'
}
