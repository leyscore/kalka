import { describe, expect, test } from 'bun:test'

import { createPageCloseAsks, type PageCloseRequest } from '../src/handlers/close-ask'

function manualClock() {
  const timers = new Set<() => void>()
  return {
    schedule: (run: () => void) => {
      timers.add(run)
      return () => timers.delete(run)
    },
    fire: () => {
      const due = [...timers]
      timers.clear()
      for (const run of due) run()
    },
    get pending() {
      return timers.size
    }
  }
}

function request(options: { sent?: boolean; fallback?: boolean } = {}) {
  const calls = { sent: 0, fallback: 0, proceeded: 0 }
  const value: PageCloseRequest = {
    send: () => {
      calls.sent++
      return options.sent ?? true
    },
    fallback: async () => {
      calls.fallback++
      return options.fallback ?? true
    },
    proceed: () => {
      calls.proceeded++
    }
  }
  return { calls, value }
}

const flush = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 0)
  })

describe('page close requests', () => {
  test('a page that acknowledges keeps the decision and no native box appears', async () => {
    const clock = manualClock()
    const asks = createPageCloseAsks<object>({ schedule: clock.schedule })
    const window = {}
    const { calls, value } = request()
    asks.ask(window, value)
    expect(calls.sent).toBe(1)
    asks.acknowledge(window)
    clock.fire()
    await flush()
    expect(calls).toEqual({ sent: 1, fallback: 0, proceeded: 0 })
  })

  test('a page that does not answer in time gets the native box, which can close', async () => {
    const clock = manualClock()
    const asks = createPageCloseAsks<object>({ schedule: clock.schedule })
    const window = {}
    const { calls, value } = request({ fallback: true })
    asks.ask(window, value)
    expect(asks.isWaiting(window)).toBe(true)
    clock.fire()
    await flush()
    expect(calls).toEqual({ sent: 1, fallback: 1, proceeded: 1 })
    expect(asks.isWaiting(window)).toBe(false)
  })

  test('cancelling the native box leaves the window open', async () => {
    const clock = manualClock()
    const asks = createPageCloseAsks<object>({ schedule: clock.schedule })
    const { calls, value } = request({ fallback: false })
    asks.ask({}, value)
    clock.fire()
    await flush()
    expect(calls.proceeded).toBe(0)
  })

  test('a crashed page goes straight to the native box', async () => {
    const clock = manualClock()
    const asks = createPageCloseAsks<object>({ schedule: clock.schedule })
    const { calls, value } = request({ sent: false })
    asks.ask({}, value)
    await flush()
    expect(clock.pending).toBe(0)
    expect(calls).toEqual({ sent: 1, fallback: 1, proceeded: 1 })
  })

  test('asking again while the native box is open does not stack another', async () => {
    const clock = manualClock()
    const asks = createPageCloseAsks<object>({ schedule: clock.schedule })
    const window = {}
    let answer: ((close: boolean) => void) | undefined
    const calls = { sent: 0, fallback: 0 }
    const value: PageCloseRequest = {
      send: () => {
        calls.sent++
        return false
      },
      fallback: () => {
        calls.fallback++
        return new Promise((resolve) => {
          answer = resolve
        })
      },
      proceed: () => {
        throw new Error('The native box was cancelled')
      }
    }
    asks.ask(window, value)
    asks.ask(window, value)
    expect(calls).toEqual({ sent: 1, fallback: 1 })
    answer?.(false)
    await flush()
    asks.ask(window, value)
    expect(calls.fallback).toBe(2)
  })

  test('a repeated request restarts the wait instead of adding a second timer', () => {
    const clock = manualClock()
    const asks = createPageCloseAsks<object>({ schedule: clock.schedule })
    const window = {}
    asks.ask(window, request().value)
    asks.ask(window, request().value)
    expect(clock.pending).toBe(1)
  })
})
