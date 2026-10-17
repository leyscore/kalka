import { useLocalStorage } from '@vueuse/core'
import { uniq } from 'es-toolkit'
import * as v from 'valibot'
import { toRaw } from 'vue'

import { DEFAULT_SNAPPING_PREFERENCES, type SnappingPreferences } from '@kalka/core/editor'

import { DEFAULT_AGENT_STEPS, resolveAgentStepLimit } from '@/app/ai/chat/step-limit'

export const ANIMATION_PREFERENCES = ['system', 'off'] as const
export type AnimationPreference = (typeof ANIMATION_PREFERENCES)[number]

export const REASONING_DISPLAYS = ['collapsed', 'while-thinking', 'expanded'] as const
export type ReasoningDisplay = (typeof REASONING_DISPLAYS)[number]

export const CHANGE_PREVIEW_SIZES = ['off', 'small', 'medium', 'large'] as const
/** How large the before/after images kept for each AI edit are; `off` keeps only the JSX diff. */
export type ChangePreviewSize = (typeof CHANGE_PREVIEW_SIZES)[number]

export const CANVAS_RENDERING_MODES = ['retained', 'tiled'] as const
/** What shows behind the artboards: Kalka's canvas color, or the page color the document saved. */
export const CANVAS_BACKGROUNDS = ['kalka', 'document'] as const
export type CanvasBackground = (typeof CANVAS_BACKGROUNDS)[number]
export type CanvasRenderingMode = (typeof CANVAS_RENDERING_MODES)[number]

export const DESIGN_CHECK_PRESETS = ['recommended', 'strict', 'accessibility'] as const
export type DesignCheckPreset = (typeof DESIGN_CHECK_PRESETS)[number]

export interface DesignCheckPreferences {
  /** Marks layers with errors and warnings on the canvas. */
  showOnCanvas: boolean
  preset: DesignCheckPreset
  /** Rules turned off on top of the preset. */
  disabledRules: string[]
}

/** Whether guided AI setup was offered and finished or skipped. */
export const AI_SETUP_STATES = ['pending', 'done'] as const
export type AISetupState = (typeof AI_SETUP_STATES)[number]

/** Whether a first-run step (the welcome, the editor tour) is still to show. */
export const ONBOARDING_STEP_STATES = ['pending', 'done'] as const
export type OnboardingStepState = (typeof ONBOARDING_STEP_STATES)[number]

/** What the person told the welcome they came for. */
export const ONBOARDING_ROLES = ['design', 'build', 'both', 'ai'] as const
export type OnboardingRole = (typeof ONBOARDING_ROLES)[number]

/** The code the Code panel shows first. */
export const CODE_SOURCES = ['design-jsx', 'tailwind-jsx', 'html-css'] as const
export type DefaultCodeSource = (typeof CODE_SOURCES)[number]

export interface AppPreferences {
  appearance: {
    animations: AnimationPreference
    /** Agents' edits show at once instead of animating in, whatever the rest of the app does. */
    reduceAgentAnimations: boolean
  }
  chat: {
    reasoningDisplay: ReasoningDisplay
    maxAgentSteps: number
    changePreviewSize: ChangePreviewSize
    /** Whether the view follows our AI agents while they work. */
    followAgents: boolean
  }
  version: 1
  recovery: {
    enabled: boolean
  }
  editing: {
    snapping: SnappingPreferences
  }
  rendering: {
    canvasMode: CanvasRenderingMode
    canvasBackground: CanvasBackground
  }
  designCheck: DesignCheckPreferences
  onboarding: {
    aiSetup: AISetupState
    welcome: OnboardingStepState
    tour: OnboardingStepState
    role: OnboardingRole | null
  }
  code: {
    defaultSource: DefaultCodeSource
  }
}

export const DEFAULT_APP_PREFERENCES: Readonly<AppPreferences> = {
  appearance: { animations: 'system', reduceAgentAnimations: false },
  chat: {
    reasoningDisplay: 'collapsed',
    maxAgentSteps: DEFAULT_AGENT_STEPS,
    changePreviewSize: 'medium',
    followAgents: true
  },
  version: 1,
  recovery: { enabled: true },
  editing: {
    snapping: { ...DEFAULT_SNAPPING_PREFERENCES }
  },
  rendering: { canvasMode: 'retained', canvasBackground: 'kalka' },
  designCheck: { showOnCanvas: true, preset: 'recommended', disabledRules: [] },
  onboarding: { aiSetup: 'pending', welcome: 'pending', tour: 'pending', role: null },
  code: { defaultSource: 'html-css' }
}

const STORAGE_KEY = 'kalka:preferences:v1'

/** An object whose fields each fall back to their default, and that is all defaults when absent. */
function section<TEntries extends v.ObjectEntries>(entries: TEntries) {
  const schema = v.object(entries)
  return v.fallback(schema, () => v.parse(schema, {}))
}

const defaults = DEFAULT_APP_PREFERENCES
const snapping = defaults.editing.snapping

/** Stored preferences, read field by field so one bad value keeps the rest. */
const appPreferencesSchema = section({
  appearance: section({
    animations: v.fallback(v.picklist(ANIMATION_PREFERENCES), defaults.appearance.animations),
    reduceAgentAnimations: v.fallback(v.boolean(), defaults.appearance.reduceAgentAnimations)
  }),
  chat: section({
    reasoningDisplay: v.fallback(v.picklist(REASONING_DISPLAYS), defaults.chat.reasoningDisplay),
    maxAgentSteps: v.fallback(
      v.pipe(v.unknown(), v.transform(resolveAgentStepLimit)),
      defaults.chat.maxAgentSteps
    ),
    changePreviewSize: v.fallback(
      v.picklist(CHANGE_PREVIEW_SIZES),
      defaults.chat.changePreviewSize
    ),
    followAgents: v.fallback(v.boolean(), defaults.chat.followAgents)
  }),
  version: v.fallback(v.literal(1), 1),
  recovery: section({ enabled: v.fallback(v.boolean(), defaults.recovery.enabled) }),
  editing: section({
    snapping: section({
      geometry: v.fallback(v.boolean(), snapping.geometry),
      objects: v.fallback(v.boolean(), snapping.objects),
      pixelGrid: v.fallback(v.boolean(), snapping.pixelGrid)
    })
  }),
  rendering: section({
    canvasMode: v.fallback(v.picklist(CANVAS_RENDERING_MODES), defaults.rendering.canvasMode),
    canvasBackground: v.fallback(
      v.picklist(CANVAS_BACKGROUNDS),
      defaults.rendering.canvasBackground
    )
  }),
  designCheck: section({
    showOnCanvas: v.fallback(v.boolean(), defaults.designCheck.showOnCanvas),
    preset: v.fallback(v.picklist(DESIGN_CHECK_PRESETS), defaults.designCheck.preset),
    disabledRules: v.fallback(
      v.pipe(
        v.array(v.unknown()),
        v.transform((rules) => uniq(rules.filter((rule) => typeof rule === 'string')))
      ),
      () => []
    )
  }),
  onboarding: section({
    aiSetup: v.fallback(v.picklist(AI_SETUP_STATES), defaults.onboarding.aiSetup),
    welcome: v.fallback(v.picklist(ONBOARDING_STEP_STATES), defaults.onboarding.welcome),
    tour: v.fallback(v.picklist(ONBOARDING_STEP_STATES), defaults.onboarding.tour),
    role: v.fallback(v.nullable(v.picklist(ONBOARDING_ROLES)), defaults.onboarding.role)
  }),
  code: section({
    defaultSource: v.fallback(v.picklist(CODE_SOURCES), defaults.code.defaultSource)
  })
})

/** Reads stored preferences, keeping every valid field and defaulting the rest. */
export function parseAppPreferences(value: unknown): AppPreferences {
  return v.parse(appPreferencesSchema, value)
}

const StoredJSON = v.pipe(v.string(), v.parseJson())

/**
 * Every read goes through the schema, including values another window writes: VueUse applies
 * `mergeDefaults` only on its first read, not on storage events, so a partial value from
 * elsewhere would otherwise reach the app as is.
 */
export const appPreferences = useLocalStorage<AppPreferences>(
  STORAGE_KEY,
  structuredClone(DEFAULT_APP_PREFERENCES),
  {
    serializer: {
      read: (raw) => {
        const parsed = v.safeParse(StoredJSON, raw)
        return parseAppPreferences(parsed.success ? parsed.output : undefined)
      },
      write: (value) => JSON.stringify(value)
    }
  }
)

/**
 * Changes stored preferences on a plain copy. The stored value is reactive: spreading it would
 * put its reactive proxies into what is stored, which `structuredClone` then cannot copy.
 */
export function editPreferences(edit: (draft: AppPreferences) => void): void {
  const draft = parseAppPreferences(toRaw(appPreferences.value))
  edit(draft)
  appPreferences.value = draft
}

export function updateAnimationPreference(animations: AnimationPreference): void {
  editPreferences((draft) => {
    draft.appearance.animations = animations
  })
}

export function updateReduceAgentAnimations(reduce: boolean): void {
  editPreferences((draft) => {
    draft.appearance.reduceAgentAnimations = reduce
  })
}

export function updateRecoveryEnabled(enabled: boolean): void {
  editPreferences((draft) => {
    draft.recovery.enabled = enabled
  })
}

export function updateAISetupState(aiSetup: AISetupState): void {
  updateOnboarding({ aiSetup })
}

export function updateOnboarding(changes: Partial<AppPreferences['onboarding']>): void {
  editPreferences((draft) => {
    Object.assign(draft.onboarding, changes)
  })
}

export function updateDefaultCodeSource(defaultSource: DefaultCodeSource): void {
  editPreferences((draft) => {
    draft.code.defaultSource = defaultSource
  })
}

export function updateCanvasRenderingMode(canvasMode: CanvasRenderingMode): void {
  editPreferences((draft) => {
    draft.rendering.canvasMode = canvasMode
  })
}

export function updateCanvasBackground(canvasBackground: CanvasBackground): void {
  editPreferences((draft) => {
    draft.rendering.canvasBackground = canvasBackground
  })
}

export function updateSnappingPreferences(changes: Partial<SnappingPreferences>): void {
  editPreferences((draft) => {
    Object.assign(draft.editing.snapping, changes)
  })
}

export function updateDesignCheckPreferences(changes: Partial<DesignCheckPreferences>): void {
  editPreferences((draft) => {
    const { disabledRules, ...rest } = changes
    Object.assign(draft.designCheck, rest)
    if (disabledRules) draft.designCheck.disabledRules = [...disabledRules]
  })
}
