/** How long the app may take to answer an ordinary call. */
export const RPC_TIMEOUT_MS = 20_000

/**
 * How long a call that waits on the person may take: ask_user returns once they have answered
 * every question, which takes minutes, not seconds.
 */
export const PERSON_RPC_TIMEOUT_MS = 30 * 60_000

/** Tools whose call lasts as long as the person takes to answer. */
const PERSON_TOOLS: ReadonlySet<string> = new Set(['ask_user'])

/** The timeout for one call to the app: a tool call that waits on the person gets far longer. */
export function rpcTimeoutMs(body: Record<string, unknown>): number {
  if (body.command !== 'tool') return RPC_TIMEOUT_MS
  const args = body.args
  if (!args || typeof args !== 'object' || Array.isArray(args)) return RPC_TIMEOUT_MS
  const name = Reflect.get(args, 'name')
  return typeof name === 'string' && PERSON_TOOLS.has(name) ? PERSON_RPC_TIMEOUT_MS : RPC_TIMEOUT_MS
}
