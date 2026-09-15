import { computed, onScopeDispose, shallowReactive } from 'vue'
import type { ComputedRef } from 'vue'

import type { Editor } from '@open-pencil/core/editor'
import type { SceneNode } from '@open-pencil/scene-graph'

import { useEditor } from '#vue/editor/context'

export interface SelectedNodeState {
  nodes: ComputedRef<SceneNode[]>
  node: ComputedRef<SceneNode | null>
  dispose: () => void
}

/** Selected-node copies with property-level preview tracking; never proxies the graph. */
export function createSelectedNodeState(editor: Editor): SelectedNodeState {
  const nodes = computed(() => {
    void editor.state.sceneVersion
    void editor.state.currentPageId
    return editor.getSelectedNodes().map((node) => shallowReactive(node))
  })
  const byId = computed(() => new Map(nodes.value.map((node) => [node.id, node])))
  const node = computed(() => (nodes.value.length === 1 ? nodes.value[0] : null))
  const dispose = editor.onEditorEvent('node:previewUpdated', (id, changes) => {
    if (!editor.state.selectedIds.has(id)) return
    const selected = byId.value.get(id)
    if (selected) Object.assign(selected, changes)
  })
  return { nodes, node, dispose }
}

export function useSelectedNodeState(editor = useEditor()): SelectedNodeState {
  const state = createSelectedNodeState(editor)
  onScopeDispose(state.dispose)
  return state
}
