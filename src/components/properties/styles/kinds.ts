import { computed } from 'vue'

import {
  sharedStyleTypeForKind,
  type SharedStyleKind,
  type SharedStyleType
} from '@kalka/scene-graph'
import { useI18n } from '@kalka/vue'

/** The style types Local styles lists, in Figma's order. */
export const LOCAL_STYLE_TYPES: readonly SharedStyleType[] = ['TEXT', 'FILL', 'EFFECT', 'GRID']

/** The kind a definition of this type is listed and edited as: a colour style is a fill style. */
export function styleKindForType(type: SharedStyleType): SharedStyleKind {
  switch (type) {
    case 'FILL':
      return 'fill'
    case 'TEXT':
      return 'text'
    case 'EFFECT':
      return 'effect'
    case 'GRID':
      return 'grid'
  }
}

/** The words the style lists and editors use for each type: its list, its empty list, its editor. */
export function useStyleTypeLabels() {
  const { panels } = useI18n()
  return computed(() => {
    const p = panels.value
    const labels: Record<SharedStyleType, { list: string; empty: string; edit: string }> = {
      TEXT: { list: p.textStyles, empty: p.noTextStyles, edit: p.editTextStyle },
      FILL: { list: p.colorStyles, empty: p.noColorStyles, edit: p.editColorStyle },
      EFFECT: { list: p.effectStyles, empty: p.noEffectStyles, edit: p.editEffectStyle },
      GRID: { list: p.gridStyles, empty: p.noGridStyles, edit: p.editGridStyle }
    }
    return (kind: SharedStyleKind) => labels[sharedStyleTypeForKind(kind)]
  })
}
