/** Without idle callbacks, how long a task waits for the first screen's work to finish. */
const FALLBACK_DELAY_MS = 1000

/**
 * Runs `task` once the page is idle, or after `timeoutMs` at the latest, and returns a function
 * that cancels it. Work that must not compete with the first screen, such as starting the MCP
 * server or fetching code a later click needs, waits here. Safari before 18 has no
 * `requestIdleCallback`; there the task runs after a fixed delay.
 */
export function whenIdle(task: () => void, timeoutMs: number): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const handle = window.requestIdleCallback(() => task(), { timeout: timeoutMs })
    return () => window.cancelIdleCallback(handle)
  }
  const handle = window.setTimeout(task, Math.min(timeoutMs, FALLBACK_DELAY_MS))
  return () => window.clearTimeout(handle)
}
