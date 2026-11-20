import { isEqual } from 'es-toolkit'
import { computed } from 'vue'

import { DEFAULT_FONT_FAMILY } from '@kalka/core/constants'
import { fontManager } from '@kalka/core/text'
import type { SceneNode } from '@kalka/scene-graph'

/**
 * Returns missing-font information for a text node getter.
 *
 * This is useful for typography panels and warnings that need to surface fonts
 * that are referenced by a node but not yet loaded in the current runtime.
 */
export function useNodeFontStatus(node: () => SceneNode | null | undefined) {
  // Typing replaces the layer's style runs on every keystroke; the list keeps its identity while
  // its fonts stay the same, so a warning that shows it does not re-render the whole panel.
  const missingFonts = computed<string[]>((previous) => {
    const n = node()
    if (n?.type !== 'TEXT') return previous?.length === 0 ? previous : []

    const families = new Set<string>()
    families.add(n.fontFamily || DEFAULT_FONT_FAMILY)
    for (const run of n.styleRuns) {
      if (run.style.fontFamily) families.add(run.style.fontFamily)
    }

    const missing = [...families].filter((f) => !fontManager.isLoaded(f))
    return previous && isEqual(previous, missing) ? previous : missing
  })

  const hasMissingFonts = computed(() => missingFonts.value.length > 0)

  return { missingFonts, hasMissingFonts }
}
