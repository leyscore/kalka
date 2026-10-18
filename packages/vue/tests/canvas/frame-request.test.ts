import { describe, expect, test } from 'bun:test'

import { createFrameRequest, type FrameScheduler } from '#vue/canvas/frame-request'

/** Frames that run only when the test advances them, like a page whose display ticks on demand. */
function manualFrames() {
  const queued = new Map<number, () => void>()
  let next = 1
  const frames: FrameScheduler = {
    request(callback) {
      const handle = next++
      queued.set(handle, callback)
      return handle
    },
    cancel(handle) {
      queued.delete(handle)
    }
  }
  return {
    scheduler: frames,
    get waiting() {
      return queued.size
    },
    advance() {
      const callbacks = [...queued.values()]
      queued.clear()
      for (const callback of callbacks) callback()
    }
  }
}

describe('frames on request', () => {
  test('an idle view draws nothing', () => {
    const display = manualFrames()
    let draws = 0
    createFrameRequest(() => {
      draws++
      return false
    }, display.scheduler)

    display.advance()
    display.advance()

    expect(draws).toBe(0)
    expect(display.waiting).toBe(0)
  })

  test('requests before a frame draw it once, then the view rests', () => {
    const display = manualFrames()
    let draws = 0
    const frames = createFrameRequest(() => {
      draws++
      return false
    }, display.scheduler)

    frames.request()
    frames.request()
    frames.request()
    display.advance()
    display.advance()

    expect(draws).toBe(1)
    expect(display.waiting).toBe(0)
  })

  test('a draw that still moves gets frames until it settles', () => {
    const display = manualFrames()
    let remaining = 3
    const frames = createFrameRequest(() => --remaining > 0, display.scheduler)

    frames.request()
    for (let frame = 0; frame < 5; frame++) display.advance()

    expect(remaining).toBe(0)
    expect(display.waiting).toBe(0)
  })

  test('a request made while drawing draws the next frame', () => {
    const display = manualFrames()
    let draws = 0
    const frames = createFrameRequest(() => {
      draws++
      if (draws === 1) frames.request()
      return false
    }, display.scheduler)

    frames.request()
    display.advance()
    display.advance()
    display.advance()

    expect(draws).toBe(2)
  })

  test('a cancelled frame does not draw', () => {
    const display = manualFrames()
    let draws = 0
    const frames = createFrameRequest(() => {
      draws++
      return true
    }, display.scheduler)

    frames.request()
    frames.cancel()
    display.advance()

    expect(draws).toBe(0)
    expect(display.waiting).toBe(0)
  })
})
