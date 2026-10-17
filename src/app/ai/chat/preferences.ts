import { computed } from 'vue'

import {
  appPreferences,
  editPreferences,
  type ChangePreviewSize,
  type ReasoningDisplay
} from '@/app/settings/preferences/store'

import { resolveAgentStepLimit } from './step-limit'

export const maxAgentSteps = computed({
  get: () => resolveAgentStepLimit(appPreferences.value.chat.maxAgentSteps),
  set: (value: number) =>
    editPreferences((draft) => {
      draft.chat.maxAgentSteps = resolveAgentStepLimit(value)
    })
})

export const reasoningDisplay = computed({
  get: () => appPreferences.value.chat.reasoningDisplay,
  set: (reasoningDisplay: ReasoningDisplay) =>
    editPreferences((draft) => {
      draft.chat.reasoningDisplay = reasoningDisplay
    })
})

export const changePreviewSize = computed({
  get: () => appPreferences.value.chat.changePreviewSize,
  set: (changePreviewSize: ChangePreviewSize) =>
    editPreferences((draft) => {
      draft.chat.changePreviewSize = changePreviewSize
    })
})
