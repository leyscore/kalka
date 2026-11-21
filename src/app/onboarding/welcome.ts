import { ref } from 'vue'

import { offerAISetupOnFirstRun, openAISetup } from '@/app/ai/models/settings/onboarding/dialog'
import { appPreferences, updateOnboarding } from '@/app/settings/preferences/store'

/**
 * The welcome, at `/welcome`: the name, a few optional questions about the person, then their AI.
 * Connecting an agent over MCP is a wider screen reached from the AI step or from Home.
 */
export const WELCOME_STEPS = ['start', 'about', 'design', 'ai'] as const
export type WelcomeStep = (typeof WELCOME_STEPS)[number] | 'claude'

export const welcomeOpen = ref(false)
export const welcomeStep = ref<WelcomeStep>('start')

export function openWelcome(step: WelcomeStep = 'start'): void {
  welcomeStep.value = step
  welcomeOpen.value = true
}

const ORDER: readonly WelcomeStep[] = WELCOME_STEPS

/** Where `step` sits in the welcome's order; -1 for the MCP screen, which is outside it. */
export function welcomeStepIndex(step: WelcomeStep): number {
  return ORDER.indexOf(step)
}

/** The step after `step` in the welcome's order, or null after the last one. */
export function nextWelcomeStep(step: WelcomeStep): WelcomeStep | null {
  const index = welcomeStepIndex(step)
  return index === -1 ? null : (ORDER[index + 1] ?? null)
}

export function previousWelcomeStep(step: WelcomeStep): WelcomeStep | null {
  if (step === 'claude') return 'ai'
  const index = welcomeStepIndex(step)
  return index > 0 ? (ORDER[index - 1] ?? null) : null
}

/**
 * Leaving the welcome in any way counts as done. It offers to connect an agent, so the separate
 * offer to set up the AI chat is not made on top of it.
 */
export function closeWelcome(): void {
  welcomeOpen.value = false
  updateOnboarding({ welcome: 'done', aiSetup: 'done' })
}

/**
 * Hides the welcome without counting it as done, as when a link opens Settings over it: it comes
 * back on the next launch.
 */
export function setWelcomeAside(): void {
  welcomeOpen.value = false
}

/** Leaves the welcome for the guided setup that connects the agent already on this computer. */
export function closeWelcomeForAIChat(): void {
  closeWelcome()
  openAISetup('connect')
}

/** A fresh install sees the welcome; someone who already went through it may still get the AI offer. */
export function offerWelcomeOnFirstRun(): void {
  if (appPreferences.value.onboarding.welcome === 'pending') {
    openWelcome()
    return
  }
  offerAISetupOnFirstRun()
}
