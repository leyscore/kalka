import * as v from 'valibot'

import { allRules } from '@kalka/core/lint'
import { AVAILABLE_LOCALES, locale, setLocale, type Locale } from '@kalka/vue'

import { agentStepLimitSchema } from '@/app/ai/chat/step-limit'
import { chatThinkingLevel } from '@/app/ai/chat/thinking'
import {
  designModelProfile,
  designModelProfiles,
  isACPModelProfile,
  setModelRoleAssignment
} from '@/app/ai/models/store'
import { THINKING_LEVELS, type AIModelProfile, type ThinkingLevel } from '@/app/ai/models/types'
import { applySnappingPreferences, setDesignIssuesOnCanvas } from '@/app/settings/preferences/apply'
import {
  ANIMATION_PREFERENCES,
  appPreferences,
  CANVAS_BACKGROUNDS,
  CANVAS_RENDERING_MODES,
  CHANGE_PREVIEW_SIZES,
  CODE_SOURCES,
  DESIGN_CHECK_PRESETS,
  editPreferences,
  REASONING_DISPLAYS,
  updateDesignCheckPreferences,
  type AppPreferences
} from '@/app/settings/preferences/store'
import { APP_THEMES, getAppTheme, setAppTheme, type AppTheme } from '@/app/shell/theme'

/**
 * The preferences that automation clients (CLI, MCP) may read and change while the app runs.
 * The AI group picks among model profiles the person already configured; their connections,
 * credentials, base URLs, MCP connections, storage, and tool access stay out, so an agent
 * can neither read secrets nor grant itself access.
 */
export interface AutomationSettings {
  appearance: {
    theme: AppTheme
    language: Locale
    animations: AppPreferences['appearance']['animations']
    reduceAgentAnimations: boolean
  }
  editing: AppPreferences['editing']
  rendering: AppPreferences['rendering']
  recovery: AppPreferences['recovery']
  chat: AppPreferences['chat']
  ai: {
    /** The model profile the AI chat designs with, by ID. */
    designModel: string | null
    /** The reasoning effort the chat's next message uses. */
    thinkingLevel: ThinkingLevel
  }
  code: AppPreferences['code']
  designCheck: AppPreferences['designCheck']
}

const optionalBoolean = v.optional(v.boolean())

export const automationSettingsPatchSchema = v.strictObject({
  appearance: v.optional(
    v.strictObject({
      theme: v.optional(v.picklist(APP_THEMES)),
      language: v.optional(v.picklist(AVAILABLE_LOCALES)),
      animations: v.optional(v.picklist(ANIMATION_PREFERENCES)),
      reduceAgentAnimations: optionalBoolean
    })
  ),
  editing: v.optional(
    v.strictObject({
      snapping: v.optional(
        v.strictObject({
          geometry: optionalBoolean,
          objects: optionalBoolean,
          pixelGrid: optionalBoolean
        })
      )
    })
  ),
  rendering: v.optional(
    v.strictObject({
      canvasMode: v.optional(v.picklist(CANVAS_RENDERING_MODES)),
      canvasBackground: v.optional(v.picklist(CANVAS_BACKGROUNDS))
    })
  ),
  recovery: v.optional(v.strictObject({ enabled: optionalBoolean })),
  chat: v.optional(
    v.strictObject({
      reasoningDisplay: v.optional(v.picklist(REASONING_DISPLAYS)),
      maxAgentSteps: v.optional(agentStepLimitSchema),
      changePreviewSize: v.optional(v.picklist(CHANGE_PREVIEW_SIZES)),
      followAgents: optionalBoolean
    })
  ),
  ai: v.optional(
    v.strictObject({
      designModel: v.optional(v.pipe(v.string(), v.nonEmpty())),
      thinkingLevel: v.optional(v.picklist(THINKING_LEVELS))
    })
  ),
  code: v.optional(v.strictObject({ defaultSource: v.optional(v.picklist(CODE_SOURCES)) })),
  designCheck: v.optional(
    v.strictObject({
      showOnCanvas: optionalBoolean,
      preset: v.optional(v.picklist(DESIGN_CHECK_PRESETS)),
      disabledRules: v.optional(v.array(v.picklist(Object.keys(allRules))))
    })
  )
})

export type AutomationSettingsPatch = v.InferOutput<typeof automationSettingsPatchSchema>

export function readAutomationSettings(): AutomationSettings {
  // Copy leaf groups: stored preferences can hold reactive proxies that cannot be cloned.
  const preferences = appPreferences.value
  return {
    appearance: {
      theme: getAppTheme(),
      language: locale.get(),
      animations: preferences.appearance.animations,
      reduceAgentAnimations: preferences.appearance.reduceAgentAnimations
    },
    editing: {
      ...preferences.editing,
      snapping: { ...preferences.editing.snapping },
      nudge: { ...preferences.editing.nudge }
    },
    rendering: { ...preferences.rendering },
    recovery: { ...preferences.recovery },
    chat: { ...preferences.chat },
    ai: {
      designModel: designModelProfile.value?.id ?? null,
      thinkingLevel: chatThinkingLevel.value
    },
    code: { ...preferences.code },
    designCheck: {
      ...preferences.designCheck,
      disabledRules: [...preferences.designCheck.disabledRules]
    }
  }
}

function invalidSetting(path: string, message: string): Error {
  return new Error(`Invalid settings at "${path}": ${message}`)
}

/** A Design-capable profile by ID, or by name when exactly one profile has it. */
function findDesignProfile(reference: string): AIModelProfile {
  const profiles = designModelProfiles()
  const byId = profiles.find((profile) => profile.id === reference)
  if (byId) return byId
  const name = reference.trim().toLowerCase()
  const byName = profiles.filter((profile) => profile.name.trim().toLowerCase() === name)
  if (byName.length === 1) return byName[0]
  throw invalidSetting(
    'ai.designModel',
    byName.length > 1
      ? `Several model profiles are named "${reference}"; use the profile ID`
      : `No model profile that can design is named "${reference}"; list them with "kalka settings list"`
  )
}

/** Checks what the schema cannot see (the configured profiles) before anything changes. */
function resolveAIPatch(patch: AutomationSettingsPatch['ai']): {
  profile: AIModelProfile | null
  thinkingLevel: ThinkingLevel | undefined
} {
  const profile = patch?.designModel ? findDesignProfile(patch.designModel) : null
  const thinkingLevel = patch?.thinkingLevel
  if (thinkingLevel !== undefined) {
    const target = profile ?? designModelProfile.value
    if (!target) throw invalidSetting('ai.thinkingLevel', 'No Design model is set up')
    if (isACPModelProfile(target)) {
      throw invalidSetting(
        'ai.thinkingLevel',
        `"${target.name}" is an agent that chooses its own reasoning`
      )
    }
  }
  return { profile, thinkingLevel }
}

function applyAIPatch({ profile, thinkingLevel }: ReturnType<typeof resolveAIPatch>): void {
  if (profile) setModelRoleAssignment('design', profile.id)
  if (thinkingLevel === undefined) return
  const target = designModelProfile.value
  // The profile keeps it for later chats; the composer shows it for the next message.
  if (target) target.thinkingLevel = thinkingLevel
  chatThinkingLevel.value = thinkingLevel
}

/** Validates a partial settings object, applies it through the owning stores, and returns the result. */
export function updateAutomationSettings(input: unknown): AutomationSettings {
  const result = v.safeParse(automationSettingsPatchSchema, input)
  if (!result.success) {
    const issue = result.issues[0]
    const path = v.getDotPath(issue)
    throw new Error(`Invalid settings${path ? ` at "${path}"` : ''}: ${issue.message}`)
  }
  const patch = result.output
  const ai = resolveAIPatch(patch.ai)

  const { theme, language, ...appearance } = patch.appearance ?? {}
  if (theme) setAppTheme(theme)
  if (language) setLocale(language)

  editPreferences((draft) => {
    Object.assign(draft.appearance, appearance)
    Object.assign(draft.rendering, patch.rendering)
    Object.assign(draft.recovery, patch.recovery)
    Object.assign(draft.chat, patch.chat)
    Object.assign(draft.code, patch.code)
  })
  if (patch.editing?.snapping) applySnappingPreferences(patch.editing.snapping)
  const { showOnCanvas, ...designCheck } = patch.designCheck ?? {}
  if (Object.keys(designCheck).length > 0) updateDesignCheckPreferences(designCheck)
  // Through the menu's setter, so the native View menu checkmark follows.
  if (showOnCanvas !== undefined) setDesignIssuesOnCanvas(showOnCanvas)
  applyAIPatch(ai)

  return readAutomationSettings()
}

/** One settable key with its current value and what it accepts. */
export interface AutomationSettingEntry {
  key: string
  value: unknown
  type: 'boolean' | 'choice' | 'choices' | 'integer'
  /** Accepted values for `choice`, or the values a `choices` list may hold. */
  values?: readonly (string | boolean)[]
  /** Names for values that are IDs, such as model profiles. */
  labels?: Record<string, string>
  min?: number
  max?: number
}

type SettingShape = Omit<AutomationSettingEntry, 'key' | 'value'>

function isSchema(value: unknown): value is v.GenericSchema {
  return typeof value === 'object' && value !== null && 'kind' in value && value.kind === 'schema'
}

function stringValues(values: unknown): string[] {
  return Array.isArray(values) ? values.filter((value) => typeof value === 'string') : []
}

function numberRequirement(schema: v.GenericSchema, type: string): number | undefined {
  const pipe: unknown = 'pipe' in schema ? schema.pipe : undefined
  if (!Array.isArray(pipe)) return undefined
  for (const action of pipe as unknown[]) {
    if (typeof action !== 'object' || action === null) continue
    const requirement: unknown = Reflect.get(action, 'requirement')
    if (Reflect.get(action, 'type') === type && typeof requirement === 'number') return requirement
  }
  return undefined
}

function shapeOf(schema: v.GenericSchema): SettingShape | null {
  if ('wrapped' in schema && isSchema(schema.wrapped)) return shapeOf(schema.wrapped)
  if (schema.type === 'boolean') return { type: 'boolean', values: [true, false] }
  // The one free-text key, `ai.designModel`, lists the configured profiles instead.
  if (schema.type === 'string') return { type: 'choice', values: [] }
  if (schema.type === 'picklist' && 'options' in schema) {
    return { type: 'choice', values: stringValues(schema.options) }
  }
  if (schema.type === 'array' && 'item' in schema && isSchema(schema.item)) {
    const item = shapeOf(schema.item)
    return item?.type === 'choice' ? { type: 'choices', values: item.values } : null
  }
  if (schema.type === 'number') {
    return {
      type: 'integer',
      min: numberRequirement(schema, 'min_value'),
      max: numberRequirement(schema, 'max_value')
    }
  }
  return null
}

function collectShapes(schema: v.GenericSchema, prefix: string, into: Map<string, SettingShape>) {
  const inner = 'wrapped' in schema && isSchema(schema.wrapped) ? schema.wrapped : schema
  if (!('entries' in inner) || typeof inner.entries !== 'object' || inner.entries === null) {
    const shape = shapeOf(inner)
    if (shape) into.set(prefix, shape)
    return
  }
  for (const [name, entry] of Object.entries(inner.entries)) {
    if (isSchema(entry)) collectShapes(entry, prefix ? `${prefix}.${name}` : name, into)
  }
}

const SETTING_SHAPES = new Map<string, SettingShape>()
collectShapes(automationSettingsPatchSchema, '', SETTING_SHAPES)

function designModelShape(): SettingShape {
  const profiles = designModelProfiles()
  return {
    type: 'choice',
    values: profiles.map((profile) => profile.id),
    labels: Object.fromEntries(profiles.map((profile) => [profile.id, profile.name]))
  }
}

function readPath(settings: AutomationSettings, key: string): unknown {
  let value: unknown = settings
  for (const part of key.split('.')) {
    value = typeof value === 'object' && value !== null ? Reflect.get(value, part) : undefined
  }
  return value
}

/** Every key `updateAutomationSettings` accepts, with its current value and accepted values. */
export function listAutomationSettings(): AutomationSettingEntry[] {
  const settings = readAutomationSettings()
  return [...SETTING_SHAPES].map(([key, shape]) => ({
    key,
    value: readPath(settings, key),
    ...(key === 'ai.designModel' ? designModelShape() : shape)
  }))
}
