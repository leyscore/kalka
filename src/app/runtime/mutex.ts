import { createDeferred } from '@/app/runtime/deferred'

/** Runs holders one at a time, in arrival order. `acquire` resolves with the release function. */
export function createMutex() {
  let tail: Promise<unknown> = Promise.resolve()
  return async function acquire(): Promise<() => void> {
    const { promise, resolve } = createDeferred<undefined>()
    const previous = tail
    tail = previous.then(() => promise)
    await previous
    return () => resolve(undefined)
  }
}

const documentLocks = new WeakMap<object, ReturnType<typeof createMutex>>()

/**
 * The one lock for edits recorded as what a document changed over a call, such as an agent's
 * tool call or an automation script: each records the whole page, so two that overlap would each
 * record the other's changes and undo them together. Every agent of a document, the chat's and
 * MCP's alike, takes the same lock.
 */
export function documentEditLock(document: object): ReturnType<typeof createMutex> {
  let lock = documentLocks.get(document)
  if (!lock) {
    lock = createMutex()
    documentLocks.set(document, lock)
  }
  return lock
}
