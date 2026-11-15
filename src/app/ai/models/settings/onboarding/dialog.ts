import { ref } from 'vue'

import { aiModelSettings } from '@/app/ai/models/store'
import { appPreferences, updateAISetupState } from '@/app/settings/preferences/store'

import { isUnconfiguredModelSettings } from './apply'

/**
 * `connect` is the short way: an agent on this computer or a provider's key, then start.
 * `welcome` introduces Kalka first and `guided` starts at the setup questions, for several models.
 */
export type AISetupEntry = 'connect' | 'welcome' | 'guided'

export const aiSetupDialogOpen = ref(false)
export const aiSetupEntry = ref<AISetupEntry>('guided')

export function openAISetup(entry: AISetupEntry = 'guided'): void {
  aiSetupEntry.value = entry
  aiSetupDialogOpen.value = true
}

/** Closing guided setup in any way counts as done, so the welcome is offered only once. */
export function closeAISetup(): void {
  aiSetupDialogOpen.value = false
  updateAISetupState('done')
}

/** Offers the welcome to a fresh install; anyone who already configured AI never sees it. */
export function offerAISetupOnFirstRun(): void {
  if (appPreferences.value.onboarding.aiSetup === 'done') return
  if (!isUnconfiguredModelSettings(aiModelSettings.value)) {
    updateAISetupState('done')
    return
  }
  openAISetup('welcome')
}
