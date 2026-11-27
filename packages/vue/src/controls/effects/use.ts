import { ref, shallowRef } from 'vue'

import {
  EFFECT_OPTIONS,
  createDefaultEffect,
  createEffectControlActions,
  createEffectEditActions,
  isBlur,
  isShadow,
  type EffectEditSnapshot
} from '#vue/controls/effects/helpers'
import { useEditor } from '#vue/editor/context'

/**
 * Returns effect-editing helpers for property panels.
 *
 * This composable manages default effect creation, expanded-row state,
 * scrub-preview behavior, and effect type/color updates.
 */
export function useEffectsControls() {
  const editor = useEditor()

  const expandedIndex = ref<number | null>(null)
  const effectsBeforeScrub = shallowRef<EffectEditSnapshot | null>(null)
  const editActions = createEffectEditActions(editor, effectsBeforeScrub)
  const controlActions = createEffectControlActions(expandedIndex)

  return {
    expandedIndex,
    /** Read on render, so the names follow the language. */
    get effectOptions() {
      return EFFECT_OPTIONS.value
    },
    createDefaultEffect,
    isShadow,
    isBlur,
    ...editActions,
    ...controlActions
  }
}
