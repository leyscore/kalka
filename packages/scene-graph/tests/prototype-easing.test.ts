import { describe, expect, test } from 'bun:test'

import { customEasing, easingCurve, easingSpring, springSamples } from '@kalka/scene-graph'

describe('prototype easing', () => {
  test('custom bezier and custom spring start from the easing chosen before', () => {
    const easeIn = { type: 'EASE_IN' as const, bezier: null, spring: null }
    expect(customEasing(easeIn, 'CUSTOM_CUBIC_BEZIER').bezier).toEqual({
      x1: 0.42,
      y1: 0,
      x2: 1,
      y2: 1
    })
    const bouncy = { type: 'BOUNCY' as const, bezier: null, spring: null }
    expect(customEasing(bouncy, 'CUSTOM_SPRING').spring).toEqual({
      mass: 1,
      stiffness: 600,
      damping: 15
    })
    // A curve has no spring to start from: the custom spring starts as Gentle.
    expect(customEasing(easeIn, 'CUSTOM_SPRING').spring).toEqual({
      mass: 1,
      stiffness: 100,
      damping: 15
    })
  })

  test('a spring plays until it settles, and a curve is not a spring', () => {
    const bouncy = easingSpring({ type: 'BOUNCY', bezier: null, spring: null })
    if (!bouncy) throw new Error('Bouncy is a spring')
    const { values, duration } = springSamples(bouncy)
    expect(Math.max(...values)).toBeGreaterThan(1.2)
    expect(values.at(-1)).toBe(1)
    expect(duration).toBeGreaterThan(300)
    expect(easingSpring({ type: 'LINEAR', bezier: null, spring: null })).toBeNull()
    expect(easingCurve({ type: 'QUICK', bezier: null, spring: null })).toBeNull()
  })

  test("a spring's initial velocity starts it moving", () => {
    const resting = springSamples({ mass: 1, stiffness: 100, damping: 15 })
    const thrown = springSamples({ mass: 1, stiffness: 100, damping: 15, initialVelocity: 20 })
    expect(thrown.values[0]).toBeGreaterThan(resting.values[0])
    expect(Math.max(...thrown.values)).toBeGreaterThan(Math.max(...resting.values))
  })
})
