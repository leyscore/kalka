import { ref } from 'vue'

import { offerAISetupOnFirstRun, openAISetup } from '@/app/ai/models/settings/onboarding/dialog'
import { appPreferences, updateOnboarding } from '@/app/settings/preferences/store'

export const WELCOME_STEPS = ['role', 'preferences', 'claude'] as const
export type WelcomeStep = (typeof WELCOME_STEPS)[number]

export const welcomeOpen = ref(false)
export const welcomeStep = ref<WelcomeStep>('role')

export function openWelcome(step: WelcomeStep = 'role'): void {
  welcomeStep.value = step
  welcomeOpen.value = true
}

/**
 * Leaving the welcome in any way counts as done. It covers connecting Claude, so the separate
 * offer to set up the AI chat is not made on top of it.
 */
export function closeWelcome(): void {
  welcomeOpen.value = false
  updateOnboarding({ welcome: 'done', aiSetup: 'done' })
}

/** Leaves the welcome for the guided setup of the AI chat inside Kalka. */
export function closeWelcomeForAIChat(): void {
  closeWelcome()
  openAISetup('guided')
}

/** A fresh install sees the welcome; someone who already went through it may still get the AI offer. */
export function offerWelcomeOnFirstRun(): void {
  // The native test binary starts every run with an empty data store.
  if (import.meta.env.MODE === 'native-test') return
  if (appPreferences.value.onboarding.welcome === 'pending') {
    openWelcome()
    return
  }
  offerAISetupOnFirstRun()
}
