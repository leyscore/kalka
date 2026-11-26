import { createDeferred } from '@/app/runtime/deferred'

/**
 * Snapshots a live editor keeps up to date, in this window or another one: another editor window
 * of the desktop app, or another tab of the browser. Each open document holds a Web Lock named
 * after its snapshot, which the browser lets go when the page closes or crashes, so a snapshot
 * nobody holds is one to recover, and a held one is someone's open document, never offered again.
 */
const LIVE_LOCK_PREFIX = 'kalka-recovery-live:'

function webLocks(): LockManager | null {
  return typeof navigator !== 'undefined' && 'locks' in navigator ? navigator.locks : null
}

/** Marks the snapshot `id` as an open document's until the returned function runs. */
export function holdLiveRecovery(id: string): () => void {
  const locks = webLocks()
  if (!locks) return () => undefined
  const released = createDeferred<undefined>()
  void locks
    .request(`${LIVE_LOCK_PREFIX}${id}`, { mode: 'shared' }, () => released.promise)
    .catch((error: unknown) => console.warn('[Recovery] Could not mark a snapshot live', error))
  return () => released.resolve(undefined)
}

/** The snapshots open documents hold, in any window or tab of this app. */
export async function liveRecoveryIds(): Promise<Set<string>> {
  const locks = webLocks()
  if (!locks) return new Set()
  try {
    const { held = [] } = await locks.query()
    return new Set(
      held.flatMap((lock) =>
        lock.name?.startsWith(LIVE_LOCK_PREFIX) ? [lock.name.slice(LIVE_LOCK_PREFIX.length)] : []
      )
    )
  } catch (error) {
    console.warn('[Recovery] Could not list live snapshots', error)
    return new Set()
  }
}
