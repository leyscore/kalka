import { ref } from 'vue'

import { createAppearanceActions, createAppearanceState } from '#vue/controls/appearance/helpers'
import { createPolygonActions, createPolygonState } from '#vue/controls/appearance/polygon'
import { useNodeProps } from '#vue/controls/node-props/use'
import { useEditor } from '#vue/editor/context'

/**
 * Returns appearance-related state and actions for the current selection.
 *
 * Use this composable for visibility, opacity, corner-radius, and polygon or star
 * count and ratio controls in property panels.
 */
export function useAppearance() {
  const editor = useEditor()
  const { nodes, node, active, isMulti, merged, updateProp, commitProp } = useNodeProps()

  const expandedCornerNodeId = ref<string | null>(null)
  const options = { node, nodes, isMulti, merged, expandedCornerNodeId }
  const appearanceState = createAppearanceState(options)
  const appearanceActions = createAppearanceActions({ editor, ...options })
  const polygonState = createPolygonState({ nodes, merged })
  const polygonActions = createPolygonActions(editor, nodes)

  return {
    editor,
    nodes,
    node,
    active,
    isMulti,
    ...appearanceState,
    ...polygonState,
    updateProp,
    commitProp,
    ...appearanceActions,
    ...polygonActions
  }
}
