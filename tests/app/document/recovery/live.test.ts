import { afterEach, describe, expect, test } from 'bun:test'

import { holdLiveRecovery, liveRecoveryIds } from '@/app/document/recovery/live'

/** Web Locks as the browser shares them between an origin's windows and tabs. */
function installLocks() {
  const held = new Map<string, number>()
  const locks = {
    async request(name: string, _options: unknown, callback: () => Promise<void>) {
      held.set(name, (held.get(name) ?? 0) + 1)
      try {
        await callback()
      } finally {
        const count = (held.get(name) ?? 1) - 1
        if (count > 0) held.set(name, count)
        else held.delete(name)
      }
    },
    async query() {
      return { held: [...held.keys()].map((name) => ({ name, mode: 'shared' })) }
    }
  }
  Object.defineProperty(globalThis.navigator, 'locks', { value: locks, configurable: true })
}

afterEach(() => {
  Reflect.deleteProperty(globalThis.navigator, 'locks')
})

describe('live recovery snapshots', () => {
  test('a snapshot is live while an open document holds it, in any window', async () => {
    installLocks()
    const releaseA = holdLiveRecovery('a')
    const releaseB = holdLiveRecovery('b')
    expect(await liveRecoveryIds()).toEqual(new Set(['a', 'b']))

    releaseA()
    await Promise.resolve()
    expect(await liveRecoveryIds()).toEqual(new Set(['b']))
    releaseB()
  })

  test('without Web Locks every snapshot counts as one to recover', async () => {
    expect(await liveRecoveryIds()).toEqual(new Set())
    expect(() => holdLiveRecovery('a')()).not.toThrow()
  })
})
