import { describe, expect, test } from 'bun:test'

import {
  clearInstanceOverrides,
  cloneInstanceOverrideState,
  createInstanceOverrideState,
  deleteInstanceOverride,
  getInstanceOverride,
  hasInstanceOverride,
  setInstanceOverride
} from './instance-overrides'

describe('instance override state', () => {
  test('stores self and descendant values structurally', () => {
    const state = createInstanceOverrideState()
    setInstanceOverride(state, 'instance', 'instance', 'visible', false)
    setInstanceOverride(state, 'instance', 'child', 'text', 'Custom')
    expect(getInstanceOverride(state, 'instance', 'instance', 'visible')).toBe(false)
    expect(getInstanceOverride(state, 'instance', 'child', 'text')).toBe('Custom')
    expect(hasInstanceOverride(state, 'instance', 'child', 'text')).toBe(true)
  })

  test('deletes empty descendant buckets', () => {
    const state = createInstanceOverrideState()
    setInstanceOverride(state, 'instance', 'child', 'text')
    expect(deleteInstanceOverride(state, 'instance', 'child', 'text')).toBe(true)
    expect(state.descendants.has('child')).toBe(false)
  })

  test('clones independently and clears', () => {
    const state = createInstanceOverrideState()
    setInstanceOverride(state, 'instance', 'child', 'text', 'Custom')
    const clone = cloneInstanceOverrideState(state)
    setInstanceOverride(clone, 'instance', 'child', 'text', 'Other')
    expect(getInstanceOverride(state, 'instance', 'child', 'text')).toBe('Custom')
    clearInstanceOverrides(state)
    expect(state.descendants.size).toBe(0)
  })
})
