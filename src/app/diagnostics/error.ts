import { errorFacts, JSONRPC_AUTH_REQUIRED_CODE, type ErrorFacts } from '@/app/runtime/error'

import { REDACTED, scrubDiagnosticText } from './scrub'

export type DiagnosticErrorInfo = {
  errorName: string
  errorCode: string | null
  retryable: boolean | null
}

function isRetryableError(error: unknown, facts: ErrorFacts): boolean | null {
  // An agent that needs signing in again fails the same way until someone does.
  if (facts.code === JSONRPC_AUTH_REQUIRED_CODE) return false
  if (!(error instanceof Error)) return null
  if (error.name === 'AbortError') return false
  if ('status' in error && typeof error.status === 'number') {
    return error.status === 408 || error.status === 429 || error.status >= 500
  }
  return null
}

/**
 * The name, code, and whether retrying can help, for an Error, a JSON-RPC error object such as
 * an ACP agent's, or an Error wrapping one as its `cause`.
 */
export function describeDiagnosticError(error: unknown): DiagnosticErrorInfo {
  const facts = errorFacts(error)
  return {
    errorName: facts.name,
    errorCode: facts.code === null ? null : String(facts.code),
    retryable: isRetryableError(error, facts)
  }
}

export type DiagnosticErrorDetails = DiagnosticErrorInfo & {
  message: string | null
  stack: string | null
}

const MAX_MESSAGE_LENGTH = 500
const MAX_STACK_LINES = 25
const MAX_STACK_LENGTH = 4000

/**
 * AI SDK and provider errors (`AI_APICallError`, `AI_InvalidPromptError`, …) and errors that
 * carry a response can quote prompts, responses, or request URLs in their message.
 */
function mayQuoteContent(error: Error): boolean {
  return error.name.startsWith('AI_') || 'responseBody' in error || 'requestBodyValues' in error
}

/**
 * Errors the engine raises on its own bugs, such as `x.map is not a function`. Their messages
 * name code, not content, unlike the errors a tool throws on purpose, which quote its input.
 */
export function isInternalError(error: unknown): error is Error {
  return (
    error instanceof TypeError || error instanceof ReferenceError || error instanceof RangeError
  )
}

/**
 * The metadata of `describeDiagnosticError`, plus the message and stack of a runtime failure,
 * scrubbed by `scrubDiagnosticText` and bounded in length.
 * A provider error keeps its stack but not its message, which can quote user content; V8 and
 * Bun repeat the message on the stack's first line, so it is removed there too.
 */
export function diagnosticErrorDetails(error: unknown): DiagnosticErrorDetails {
  const info = describeDiagnosticError(error)
  const facts = errorFacts(error)
  const message = facts.messages.length ? storedMessage(facts.summary) : null
  if (!(error instanceof Error)) return { ...info, message, stack: null }
  if (!mayQuoteContent(error)) {
    return {
      ...info,
      message,
      stack: error.stack ? storedStack(error.stack) : null
    }
  }
  const stack = error.message ? error.stack?.replaceAll(error.message, REDACTED) : error.stack
  return { ...info, message: null, stack: stack ? storedStack(stack) : null }
}

function storedMessage(message: string): string | null {
  return scrubDiagnosticText(message).slice(0, MAX_MESSAGE_LENGTH) || null
}

function storedStack(stack: string): string {
  const lines = scrubDiagnosticText(stack).split('\n').slice(0, MAX_STACK_LINES)
  return lines.join('\n').slice(0, MAX_STACK_LENGTH)
}
