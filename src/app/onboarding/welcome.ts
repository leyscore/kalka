import { ref } from 'vue'

import { offerAISetupOnFirstRun, openAISetup } from '@/app/ai/models/settings/onboarding/dialog'
import { appPreferences, updateOnboarding } from '@/app/settings/preferences/store'

/** The welcome is one screen; connecting an agent over MCP is a second one reached from it or from Home. */
export type WelcomeStep = 'start' | 'claude'

export const welcomeOpen = ref(false)
export const welcomeStep = ref<WelcomeStep>('start')

export function openWelcome(step: WelcomeStep = 'start'): void {
  welcomeStep.value = step
  welcomeOpen.value = true
}

/**
 * Leaving the welcome in any way counts as done. It offers to connect an agent, so the separate
 * offer to set up the AI chat is not made on top of it.
 */
export function closeWelcome(): void {
  welcomeOpen.value = false
  updateOnboarding({ welcome: 'done', aiSetup: 'done' })
}

/** Leaves the welcome for the guided setup that connects the agent already on this computer. */
export function closeWelcomeForAIChat(): void {
  closeWelcome()
  openAISetup('guided')
}

/** A fresh install sees the welcome; someone who already went through it may still get the AI offer. */
export function offerWelcomeOnFirstRun(): void {
  if (appPreferences.value.onboarding.welcome === 'pending') {
    openWelcome()
    return
  }
  offerAISetupOnFirstRun()
}
