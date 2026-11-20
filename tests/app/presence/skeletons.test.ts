import { describe, expect, test } from 'bun:test'

import { skeletonLive, skeletonOpacity, type AgentSkeleton } from '@/app/presence/skeletons'

const block: AgentSkeleton = { key: 'card', nodeId: 'card', from: 1000, until: 1400, fade: 300 }

describe("an agent's skeleton", () => {
  test('shows, holds while its content loads, and fades as the content appears', () => {
    expect(skeletonOpacity(block, 999)).toBe(0)
    expect(skeletonOpacity(block, 1300)).toBe(1)
    const fading = skeletonOpacity(block, 1550)
    expect(fading).toBeGreaterThan(0)
    expect(fading).toBeLessThan(1)
    expect(skeletonOpacity(block, 1700)).toBe(0)
  })

  test('is live until it has faded', () => {
    expect(skeletonLive(block, 500)).toBe(true)
    expect(skeletonLive(block, 1650)).toBe(true)
    expect(skeletonLive(block, 1700)).toBe(false)
  })
})
