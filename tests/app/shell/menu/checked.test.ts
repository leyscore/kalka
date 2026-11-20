import { describe, expect, test } from 'bun:test'

import { changedChecks, menuChecks, type MenuCheckSource } from '@/app/shell/menu/checked'

function source(overrides: Partial<MenuCheckSource['state']> = {}): MenuCheckSource {
  return {
    state: {
      autosaveEnabled: false,
      showRulers: true,
      showPixelGrid: false,
      showRemoteCursors: true,
      snappingPreferences: { geometry: true, objects: true, pixelGrid: false },
      ...overrides
    },
    theme: 'dark',
    designIssuesOnCanvas: false,
    profilerVisible: false
  }
}

describe('the native menu check items', () => {
  test('start as what they control, unchecked where it is off', () => {
    const checks = menuChecks(source())
    expect(checks.autosave).toBe(false)
    expect(checks['view-pixel-grid']).toBe(false)
    expect(checks['view-rulers']).toBe(true)
    expect([checks['theme-light'], checks['theme-dark'], checks['theme-auto']]).toEqual([
      false,
      true,
      false
    ])
    // Everything is told once, at start.
    expect(changedChecks(checks, undefined)).toHaveLength(Object.keys(checks).length)
  })

  test('follow a change, telling the native menu only what changed', () => {
    const before = menuChecks(source())
    const after = menuChecks(source({ autosaveEnabled: true }))
    expect(changedChecks(after, before)).toEqual([['autosave', true]])
  })
})
