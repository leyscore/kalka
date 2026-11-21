import { describe, expect, test } from 'bun:test'

import { settingsPath, settingsSectionFromPath } from '@/app/settings/route'

describe('settings addresses', () => {
  test('a section has its own address', () => {
    expect(settingsPath('ai')).toBe('/settings/ai')
    expect(settingsSectionFromPath('/settings/ai')).toBe('ai')
    expect(settingsSectionFromPath('/settings/server/')).toBe('server')
  })

  test('Settings without a section, or with an unknown one, opens General', () => {
    expect(settingsSectionFromPath('/settings')).toBe('general')
    expect(settingsSectionFromPath('/settings/nope')).toBe('general')
  })

  test('paths outside Settings name no section', () => {
    expect(settingsSectionFromPath('/')).toBeNull()
    expect(settingsSectionFromPath('/share/abc')).toBeNull()
    expect(settingsSectionFromPath('/settings-extra')).toBeNull()
  })
})
