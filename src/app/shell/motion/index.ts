import { usePreferredReducedMotion } from '@vueuse/core'
import { computed } from 'vue'

import { appPreferences, updateAnimationPreference } from '@/app/settings/preferences/store'

const preferredMotion = usePreferredReducedMotion()
export const animationPreference = computed({
  get: () => appPreferences.value.appearance.animations,
  set: updateAnimationPreference
})
export const animationsEnabled = computed(
  () => animationPreference.value === 'system' && preferredMotion.value !== 'reduce'
)

/**
 * Whether agents' edits animate on the canvas: new layers appearing in turn, text typing out,
 * the cursor touring what changed. Off with animations, with the system's reduced motion, and
 * with Reduce agent animations, which leaves the rest of the app's motion alone.
 */
export const agentAnimationsEnabled = computed(
  () => animationsEnabled.value && !appPreferences.value.appearance.reduceAgentAnimations
)
