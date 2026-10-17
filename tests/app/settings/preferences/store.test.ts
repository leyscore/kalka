import { afterEach, beforeEach, describe, expect, test } from 'bun:test'

import { toRaw } from 'vue'

import {
  appPreferences,
  DEFAULT_APP_PREFERENCES,
  parseAppPreferences,
  updateAnimationPreference,
  updateCanvasBackground,
  updateDesignCheckPreferences,
  updateRecoveryEnabled,
  updateSnappingPreferences
} from '@/app/settings/preferences/store'

describe('parseAppPreferences', () => {
  test('starts from the defaults when nothing usable is stored', () => {
    for (const stored of [undefined, null, 'preferences', [], {}]) {
      expect(parseAppPreferences(stored)).toEqual(DEFAULT_APP_PREFERENCES)
    }
  })

  test('keeps valid choices and defaults only the fields that are not', () => {
    const preferences = parseAppPreferences({
      appearance: { animations: 'off' },
      chat: { reasoningDisplay: 'sometimes', changePreviewSize: 'large', maxAgentSteps: 'many' },
      editing: { snapping: { geometry: false, objects: 'yes' } },
      rendering: 'tiled'
    })
    expect(preferences.appearance.animations).toBe('off')
    expect(preferences.chat).toEqual({
      ...DEFAULT_APP_PREFERENCES.chat,
      changePreviewSize: 'large'
    })
    expect(preferences.editing.snapping).toEqual({
      ...DEFAULT_APP_PREFERENCES.editing.snapping,
      geometry: false
    })
    expect(preferences.rendering).toEqual(DEFAULT_APP_PREFERENCES.rendering)
  })

  test('keeps each disabled design check rule once and drops what is not a rule name', () => {
    const { designCheck } = parseAppPreferences({
      designCheck: { preset: 'strict', disabledRules: ['contrast', 7, 'contrast', 'spacing'] }
    })
    expect(designCheck).toEqual({
      showOnCanvas: true,
      preset: 'strict',
      disabledRules: ['contrast', 'spacing']
    })
  })

  test('remembers that guided AI setup was finished or skipped', () => {
    expect(parseAppPreferences({ onboarding: { aiSetup: 'done' } }).onboarding.aiSetup).toBe('done')
    expect(parseAppPreferences({ onboarding: { aiSetup: 'later' } }).onboarding.aiSetup).toBe(
      'pending'
    )
  })

  test('keeps the welcome, tour, role and default code, each on its own', () => {
    const stored = parseAppPreferences({
      onboarding: { welcome: 'done', tour: 'soon', role: 'build' },
      code: { defaultSource: 'tailwind-jsx' }
    })
    expect(stored.onboarding).toMatchObject({ welcome: 'done', tour: 'pending', role: 'build' })
    expect(stored.code.defaultSource).toBe('tailwind-jsx')
    const invalid = parseAppPreferences({
      onboarding: { role: 'pilot' },
      code: { defaultSource: 'php' }
    })
    expect(invalid.onboarding.role).toBeNull()
    expect(invalid.code.defaultSource).toBe(DEFAULT_APP_PREFERENCES.code.defaultSource)
  })
})

describe('changing preferences', () => {
  let saved: typeof appPreferences.value
  beforeEach(() => {
    saved = parseAppPreferences(toRaw(appPreferences.value))
  })
  afterEach(() => {
    appPreferences.value = saved
  })

  test('each change keeps the stored value plain, so the next one can copy it', () => {
    updateAnimationPreference('off')
    updateRecoveryEnabled(false)
    updateSnappingPreferences({ pixelGrid: false })
    updateDesignCheckPreferences({ disabledRules: ['contrast'] })
    updateCanvasBackground('document')
    const stored = toRaw(appPreferences.value)
    expect(() => structuredClone(stored)).not.toThrow()
    expect(stored).toMatchObject({
      appearance: { animations: 'off' },
      recovery: { enabled: false },
      editing: { snapping: { pixelGrid: false } },
      designCheck: { disabledRules: ['contrast'] },
      rendering: { canvasBackground: 'document' }
    })
  })
})
