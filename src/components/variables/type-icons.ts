import type { Component } from 'vue'
import IconHash from '~icons/hugeicons/hash'
import IconPalette from '~icons/hugeicons/palette'
import IconToggleLeft from '~icons/hugeicons/toggle-left'
import IconType from '~icons/hugeicons/type'

import type { VariableType } from '@kalka/scene-graph'

/** One icon per variable type, shared by the add menu, the list rows, and the type filter. */
export const VARIABLE_TYPE_ICONS: Record<VariableType, Component> = {
  COLOR: IconPalette,
  FLOAT: IconHash,
  STRING: IconType,
  BOOLEAN: IconToggleLeft
}

export const VARIABLE_TYPES: readonly VariableType[] = ['COLOR', 'FLOAT', 'STRING', 'BOOLEAN']
