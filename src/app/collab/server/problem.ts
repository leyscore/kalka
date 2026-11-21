import { ServerRequestError } from './api'

/** What went wrong talking to a Kalka server, for the person to read in their language. */
export type ServerProblem =
  | 'not-kalka'
  | 'unreachable'
  | 'popup-blocked'
  | 'wrong-credentials'
  | 'account-disabled'
  | 'use-sso'
  | 'too-many-attempts'
  | 'signed-out'
  | 'other'

/**
 * Reads a failed request as a problem the app can explain: the server's own sentences are in
 * English, so they are never shown as they come.
 */
export function serverProblem(reason: unknown): ServerProblem {
  if (!(reason instanceof ServerRequestError)) return 'unreachable'
  const { status, message } = reason
  if (message === 'not-a-kalka-server' || message === 'invalid-url') return 'not-kalka'
  if (message === 'unreachable') return 'unreachable'
  if (message === 'popup-blocked') return 'popup-blocked'
  if (message === 'signed-out') return 'signed-out'
  if (status === 429) return 'too-many-attempts'
  if (status === 401) return 'wrong-credentials'
  if (status === 403 && /disabled/i.test(message)) return 'account-disabled'
  if (status === 403 && /single sign-on/i.test(message)) return 'use-sso'
  if (status === 404) return 'not-kalka'
  return 'other'
}
