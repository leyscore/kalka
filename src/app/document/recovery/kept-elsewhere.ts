import { toRaw } from 'vue'

/**
 * Documents whose content a Kalka server keeps, by their editor state: there is nothing to
 * recover from this device, and restoring an old copy would set the tab apart from what
 * everyone else at the same address sees.
 */
const keptByServer = new WeakSet<object>()

export function keepRecoveryElsewhere(state: object, kept: boolean): void {
  if (kept) keptByServer.add(toRaw(state))
  else keptByServer.delete(toRaw(state))
}

export function isRecoveryKeptElsewhere(state: object): boolean {
  return keptByServer.has(toRaw(state))
}
