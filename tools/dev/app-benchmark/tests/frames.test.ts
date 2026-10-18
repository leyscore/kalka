import { describe, expect, test } from 'bun:test'

import { summarizeFrames } from '#bench/frames'
import { percentile } from '#bench/stats'

describe('summarizeFrames', () => {
  test('counts the display frames a slow interval skipped', () => {
    // Five on-time frames, then one interval three display frames long.
    const frames = [0, 16, 32, 48, 64, 112]
    const summary = summarizeFrames(
      {
        frames,
        longTasks: [{ start: 70, duration: 60 }],
        inputToFrame: [4, 8, 40],
        inputs: { wheel: 3 }
      },
      16
    )
    expect(summary.droppedFrames).toBe(2)
    expect(summary.droppedRatio).toBe(round3(2 / 7))
    expect(summary.maxMs).toBe(48)
    expect(summary.longTasks).toBe(1)
    expect(summary.inputs).toEqual({ wheel: 3 })
  })

  test('reports nothing for a recording without intervals', () => {
    const summary = summarizeFrames(
      { frames: [5], longTasks: [], inputToFrame: [], inputs: {} },
      16
    )
    expect(summary.p50Ms).toBeNull()
    expect(summary.droppedRatio).toBeNull()
  })
})

describe('percentile', () => {
  test('ranks by nearest rank', () => {
    expect(percentile([5, 1, 4, 2, 3], 50)).toBe(3)
    expect(percentile([1, 2, 3, 4], 95)).toBe(4)
    expect(percentile([], 50)).toBeNull()
  })
})

function round3(value: number) {
  return Math.round(value * 1000) / 1000
}
