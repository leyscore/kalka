import type { Ref } from 'vue'

import type { Fill } from '@open-pencil/scene-graph'

import { useFill } from '#vue/primitives/Fill/useFill'

/** @deprecated Use `useFill()` and compose popover behavior in the consumer. */
export function useFillPicker(fill: Ref<Fill>, onUpdate: (fill: Fill) => void) {
  const model = useFill(fill, onUpdate)
  return {
    category: model.category,
    swatchBg: model.swatchBackground,
    toSolid: model.toSolid,
    toGradient: model.toGradient,
    toImage: model.toImage
  }
}
