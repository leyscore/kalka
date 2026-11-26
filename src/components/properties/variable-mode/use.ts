import { uniq } from 'es-toolkit'

import type { VariableCollection } from '@kalka/scene-graph'
import { useI18n, useSceneComputed } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'

/** The value a row shows when the selected layers use different modes. */
export const MIXED_MODE = '__mixed__'
/** The value that clears a layer's own mode, so it takes the one around it again. */
export const AUTO_MODE = '__auto__'

export interface LayerModeRow {
  collection: VariableCollection
  value: string
  options: { value: string; label: string; disabled?: boolean }[]
}

/**
 * Figma's "Apply variable mode": the collections whose mode the selected layers can set, and a row
 * for each collection one of them sets. A layer's mode reaches every layer inside it.
 */
export function useLayerVariableModes() {
  const store = useEditorStore()
  const { variables, panels } = useI18n()

  const selectedIds = useSceneComputed(() => [...store.state.selectedIds])
  /** Collections with a choice to make; a single mode never changes anything. */
  const collections = useSceneComputed(() =>
    store
      .getCollections()
      .filter((collection) => collection.modes.length > 1)
      .map((collection) => structuredClone(collection))
  )

  function modeName(collection: VariableCollection, modeId: string) {
    return collection.modes.find((mode) => mode.modeId === modeId)?.name ?? ''
  }

  /** What a layer gets without its own mode: its parent's, or the one the editor shows. */
  function inheritedModeId(nodeId: string, collectionId: string) {
    const parentId = store.graph.getNode(nodeId)?.parentId
    return parentId
      ? store.graph.getNodeVariableModeId(parentId, collectionId)
      : store.graph.getActiveModeId(collectionId)
  }

  const rows = useSceneComputed<LayerModeRow[]>(() => {
    void store.state.sceneVersion
    const nodes = selectedIds.value.flatMap((id) => {
      const node = store.graph.getNode(id)
      return node ? [node] : []
    })
    if (nodes.length === 0) return []
    return collections.value.flatMap((collection) => {
      const explicit = nodes.map((node) => node.variableModes[collection.id] ?? AUTO_MODE)
      if (explicit.every((value) => value === AUTO_MODE)) return []
      const value = explicit.every((item) => item === explicit[0]) ? explicit[0] : MIXED_MODE
      const inherited = uniq(nodes.map((node) => inheritedModeId(node.id, collection.id)))
      const autoLabel = variables.value.autoMode({
        mode: inherited.length === 1 ? modeName(collection, inherited[0]) : panels.value.mixed
      })
      return [
        {
          collection,
          value,
          options: [
            ...(value === MIXED_MODE
              ? [{ value: MIXED_MODE, label: panels.value.mixed, disabled: true }]
              : []),
            { value: AUTO_MODE, label: autoLabel },
            ...collection.modes.map((mode) => ({ value: mode.modeId, label: mode.name }))
          ]
        }
      ]
    })
  })

  function setMode(collectionId: string, value: string) {
    if (value === MIXED_MODE) return
    store.setNodeVariableMode(
      selectedIds.value,
      collectionId,
      value === AUTO_MODE ? undefined : value
    )
  }

  return { rows, collections, setMode }
}
