import { afterEach, beforeEach, expect, test } from 'bun:test'

import { toRaw } from 'vue'

import { allRules } from '@kalka/core/lint'
import { locale, setLocale } from '@kalka/vue'

import { chatThinkingLevel } from '@/app/ai/chat/thinking'
import {
  aiModelSettings,
  modelSettingsSnapshot,
  replaceAIModelSettings,
  type AIModelSettings
} from '@/app/ai/models'
import {
  listAutomationSettings,
  readAutomationSettings,
  updateAutomationSettings
} from '@/app/settings/automation'
import { appPreferences } from '@/app/settings/preferences/store'
import { getAppTheme, setAppTheme } from '@/app/shell/theme'

let previousPreferences: typeof appPreferences.value
let previousTheme: ReturnType<typeof getAppTheme>
let previousLocale: ReturnType<typeof locale.get>
let previousModels: AIModelSettings

function modelProfile(id: `model-${string}`, name: string, connectionId: string) {
  return {
    id,
    name,
    connectionId,
    modelID: 'model',
    customModelID: '',
    maxOutputTokens: 8192,
    thinkingLevel: 'default' as const,
    capabilities: ['tools' as const]
  }
}

function connection(id: string, providerID: AIModelSettings['connections'][number]['providerID']) {
  return {
    id,
    providerID,
    customBaseURL: 'https://models.example.test/v1',
    customAPIType: 'completions' as const,
    credentialProfileId: `${id}-credential`
  }
}

const modelsFixture: AIModelSettings = {
  version: 1,
  connections: [
    connection('connection-api', 'anthropic'),
    connection('connection-acp', 'acp:codex')
  ],
  models: [
    modelProfile('model-main', 'Main', 'connection-api'),
    modelProfile('model-second', 'Second', 'connection-api'),
    modelProfile('model-agent', 'Agent', 'connection-acp')
  ],
  assignments: { design: 'model-main', review: null, fast: null, vision: null }
}

beforeEach(() => {
  previousPreferences = structuredClone(toRaw(appPreferences.value))
  previousTheme = getAppTheme()
  previousLocale = locale.get()
  previousModels = modelSettingsSnapshot()
  replaceAIModelSettings(modelsFixture)
})

afterEach(() => {
  appPreferences.value = previousPreferences
  setAppTheme(previousTheme)
  setLocale(previousLocale)
  replaceAIModelSettings(previousModels)
})

test('reads appearance from the theme and locale stores alongside app preferences', () => {
  setAppTheme('light')
  setLocale('de')
  const settings = readAutomationSettings()
  expect(settings.appearance).toEqual({
    theme: 'light',
    language: 'de',
    animations: appPreferences.value.appearance.animations,
    reduceAgentAnimations: appPreferences.value.appearance.reduceAgentAnimations
  })
  expect(settings.editing).toEqual(appPreferences.value.editing)
  expect(settings).not.toHaveProperty('version')
})

test('applies a nested partial update and keeps sibling settings', () => {
  const before = readAutomationSettings()
  const after = updateAutomationSettings({
    appearance: { theme: 'auto' },
    editing: { snapping: { pixelGrid: !before.editing.snapping.pixelGrid } },
    chat: { maxAgentSteps: 120 }
  })

  expect(after.appearance).toEqual({ ...before.appearance, theme: 'auto' })
  expect(after.editing.snapping).toEqual({
    ...before.editing.snapping,
    pixelGrid: !before.editing.snapping.pixelGrid
  })
  expect(after.chat).toEqual({ ...before.chat, maxAgentSteps: 120 })
  expect(after.recovery).toEqual(before.recovery)
  expect(appPreferences.value.chat.maxAgentSteps).toBe(120)
  expect(getAppTheme()).toBe('auto')
})

test('changes design check settings and lists them', () => {
  const rule = Object.keys(allRules)[0]
  const after = updateAutomationSettings({
    designCheck: { preset: 'strict', disabledRules: [rule], showOnCanvas: false }
  })
  expect(after.designCheck).toEqual({
    preset: 'strict',
    disabledRules: [rule],
    showOnCanvas: false
  })
  expect(appPreferences.value.designCheck.disabledRules).toEqual([rule])
})

test.each([
  [{ appearance: { theme: 'sepia' } }, 'appearance.theme'],
  [{ chat: { maxAgentSteps: 0 } }, 'chat.maxAgentSteps'],
  [{ editing: { snapping: { grid: true } } }, 'editing.snapping.grid'],
  [{ credentials: {} }, 'credentials'],
  [{ ai: { apiKey: 'sk-test' } }, 'ai.apiKey'],
  [{ ai: { connections: [] } }, 'ai.connections'],
  [{ mcp: { enabled: true } }, 'mcp'],
  [{ toolAccess: { eval: true } }, 'toolAccess'],
  [{ onboarding: { aiSetup: 'done' } }, 'onboarding'],
  [{ ai: { thinkingLevel: 'maximum' } }, 'ai.thinkingLevel'],
  [{ ai: { designModel: 'Nonexistent' } }, 'ai.designModel'],
  [{ ai: { designModel: 'model-agent', thinkingLevel: 'high' } }, 'ai.thinkingLevel'],
  [{ chat: { followAgents: 'yes' } }, 'chat.followAgents'],
  [{ designCheck: { disabledRules: ['not-a-rule'] } }, 'designCheck.disabledRules.0']
])('rejects %p without changing anything', (patch, path) => {
  const before = readAutomationSettings()
  expect(() => updateAutomationSettings(patch)).toThrow(`Invalid settings at "${path}"`)
  expect(readAutomationSettings()).toEqual(before)
})

test('changes the chat, canvas, and Code panel preferences agents asked for', () => {
  const after = updateAutomationSettings({
    chat: { followAgents: false },
    rendering: { canvasBackground: 'document' },
    code: { defaultSource: 'tailwind-jsx' }
  })
  expect(after.chat.followAgents).toBe(false)
  expect(appPreferences.value.chat.followAgents).toBe(false)
  expect(appPreferences.value.rendering.canvasBackground).toBe('document')
  expect(appPreferences.value.code.defaultSource).toBe('tailwind-jsx')
})

test('picks the Design model among configured profiles by ID or name', () => {
  expect(readAutomationSettings().ai.designModel).toBe('model-main')
  expect(updateAutomationSettings({ ai: { designModel: 'second' } }).ai.designModel).toBe(
    'model-second'
  )
  expect(aiModelSettings.value.assignments.design).toBe('model-second')
  updateAutomationSettings({ ai: { designModel: 'model-main' } })
  expect(aiModelSettings.value.assignments.design).toBe('model-main')
})

test('sets the thinking level for the Design profile and the next chat message', () => {
  const after = updateAutomationSettings({
    ai: { designModel: 'model-second', thinkingLevel: 'high' }
  })
  expect(after.ai).toEqual({ designModel: 'model-second', thinkingLevel: 'high' })
  expect(chatThinkingLevel.value).toBe('high')
  expect(
    aiModelSettings.value.models.find((model) => model.id === 'model-second')?.thinkingLevel
  ).toBe('high')
})

test('lists every settable key with its value, and none that hold secrets', () => {
  const entries = listAutomationSettings()
  const byKey = new Map(entries.map((entry) => [entry.key, entry]))

  for (const entry of entries) {
    let value: unknown = readAutomationSettings()
    for (const part of entry.key.split('.')) {
      value = typeof value === 'object' && value !== null ? Reflect.get(value, part) : undefined
    }
    expect(entry.value).toEqual(value)
    expect(entry.key).not.toMatch(/key|token|secret|credential|password|url|connection/i)
  }
  expect(byKey.get('chat.followAgents')).toMatchObject({ type: 'boolean' })
  expect(byKey.get('chat.maxAgentSteps')).toMatchObject({ type: 'integer' })
  expect(byKey.get('ai.designModel')).toEqual({
    key: 'ai.designModel',
    value: 'model-main',
    type: 'choice',
    values: ['model-main', 'model-second', 'model-agent'],
    labels: { 'model-main': 'Main', 'model-second': 'Second', 'model-agent': 'Agent' }
  })
  expect(JSON.stringify(entries)).not.toContain('example.test')
  expect(JSON.stringify(entries)).not.toContain('-credential')

  // Every listed value is accepted back unchanged.
  for (const entry of entries) {
    const patch = entry.key
      .split('.')
      .reduceRight<unknown>((inner, part) => ({ [part]: inner }), entry.value)
    expect(() => updateAutomationSettings(patch)).not.toThrow()
  }
})
