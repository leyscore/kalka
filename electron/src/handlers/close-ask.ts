import * as v from 'valibot'

/**
 * Closing or quitting asks the page, which draws its own unsaved-changes dialog. The page
 * acknowledges the request at once; when it cannot (crashed, hung, still loading), the main
 * process falls back to a native box so the window never becomes impossible to close.
 */

/** How long the page has to acknowledge a close request before the native box asks instead. */
export const PAGE_ANSWER_TIMEOUT_MS = 4000

export interface PageCloseRequest {
  /** Delivers the request to the page; false when the page cannot receive it. */
  send(): boolean
  /** Asks without the page; resolves true to close anyway. */
  fallback(): Promise<boolean>
  /** Closes the window or quits without asking the page again. */
  proceed(): void
}

type Schedule = (run: () => void, ms: number) => () => void

const scheduleTimeout: Schedule = (run, ms) => {
  const timer = setTimeout(run, ms)
  return () => clearTimeout(timer)
}

export function createPageCloseAsks<K extends object>(
  options: { timeoutMs?: number; schedule?: Schedule } = {}
) {
  const timeoutMs = options.timeoutMs ?? PAGE_ANSWER_TIMEOUT_MS
  const schedule = options.schedule ?? scheduleTimeout
  const waiting = new WeakMap<K, () => void>()
  const fallingBack = new WeakSet<K>()

  async function askNatively(key: K, request: PageCloseRequest): Promise<void> {
    if (fallingBack.has(key)) return
    fallingBack.add(key)
    try {
      if (await request.fallback()) request.proceed()
    } finally {
      fallingBack.delete(key)
    }
  }

  function stopWaiting(key: K): void {
    waiting.get(key)?.()
    waiting.delete(key)
  }

  return {
    ask(key: K, request: PageCloseRequest): void {
      // The native box is already up for this window; a second request would stack another.
      if (fallingBack.has(key)) return
      stopWaiting(key)
      if (!request.send()) {
        void askNatively(key, request)
        return
      }
      waiting.set(
        key,
        schedule(() => {
          waiting.delete(key)
          void askNatively(key, request)
        }, timeoutMs)
      )
    },
    /** The page received the request and is asking the person itself. */
    acknowledge(key: K): void {
      stopWaiting(key)
    },
    isWaiting(key: K): boolean {
      return waiting.has(key)
    }
  }
}

/** The native fallback's text; the page supplies it in its language once it loads. */
export const CloseFallbackText = v.object({
  title: v.string(),
  description: v.string(),
  closeAnyway: v.string(),
  cancel: v.string()
})
export type CloseFallbackText = v.InferOutput<typeof CloseFallbackText>

export const DEFAULT_CLOSE_FALLBACK_TEXT: CloseFallbackText = {
  title: 'Kalka is not responding',
  description: 'Close anyway? Changes you have not saved may be lost.',
  closeAnyway: 'Close Anyway',
  cancel: 'Cancel'
}
