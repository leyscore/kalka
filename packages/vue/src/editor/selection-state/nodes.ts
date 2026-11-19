import { tryOnScopeDispose, watchImmediate } from '@vueuse/core'
import { isEqual } from 'es-toolkit'
import { computed, shallowReactive, shallowRef, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'

import type { Editor } from '@kalka/core/editor'
import type { SceneNode } from '@kalka/scene-graph'

import { useEditor } from '#vue/editor/context'
import { useRetainedActivity } from '#vue/lifecycle/retention/context'

export interface SelectedNodeState {
  nodes: ComputedRef<SceneNode[]>
  node: ComputedRef<SceneNode | null>
  dispose: () => void
}

/** Selected-node copies with property-level preview tracking; never proxies the graph. */
export function createSelectedNodeState(
  editor: Editor,
  active?: Readonly<Ref<boolean>>
): SelectedNodeState {
  const revision = shallowRef(0)
  const refresh = () => {
    revision.value++
  }
  // Copies are made again only when the selection or the tree changes. An edit to a layer is
  // copied into its copy field by field, where the value differs, so a keystroke or an agent's
  // edit elsewhere re-renders only what reads the fields that changed, not every property field.
  const nodes = computed<SceneNode[]>((previous) => {
    if (active?.value === false && previous) return previous
    void revision.value
    void editor.state.currentPageId
    return editor.getSelectedNodes().map((node) => shallowReactive(structuredClone(node)))
  })
  const byId = computed(() => new Map(nodes.value.map((node) => [node.id, node])))
  const node = computed(() => (nodes.value.length === 1 ? nodes.value[0] : null))

  /** Brings each copy up to its layer; a selection whose layers changed is copied again. */
  function syncSelected() {
    const copies = nodes.value
    const ids = editor.state.selectedIds
    if (copies.length !== editor.getSelectedNodes().length) return refresh()
    for (const copy of copies) {
      const live = ids.has(copy.id) ? editor.graph.getNode(copy.id) : undefined
      if (!live) return refresh()
      for (const key of Object.keys(live) as (keyof SceneNode)[]) {
        if (!isEqual(copy[key], live[key]))
          Object.assign(copy, { [key]: structuredClone(live[key]) })
      }
      for (const key of Object.keys(copy))
        if (!Object.hasOwn(live, key)) Reflect.deleteProperty(copy, key)
    }
  }
  const refreshSelected = (id: string) => {
    if (editor.state.selectedIds.has(id)) syncSelected()
  }

  function updatePreview(id: string, changes: Partial<SceneNode>) {
    if (!editor.state.selectedIds.has(id)) return
    const selected = byId.value.get(id)
    if (selected) Object.assign(selected, structuredClone(changes))
  }

  const dispose = watchImmediate(
    () => active?.value ?? true,
    (enabled, _previous, onCleanup) => {
      if (!enabled) return
      refresh()
      onCleanup(editor.onEditorEvent('node:previewUpdated', updatePreview))
      onCleanup(editor.onEditorEvent('node:updated', refreshSelected))
      // Anything else that moves the scene, such as a variable's value, reaches the copies too.
      onCleanup(watch(() => editor.state.sceneVersion, syncSelected, { flush: 'sync' }))
      onCleanup(editor.onEditorEvent('selection:changed', refresh))
      onCleanup(editor.onEditorEvent('graph:replaced', refresh))
      onCleanup(editor.onEditorEvent('page:changed', refresh))
      onCleanup(editor.onEditorEvent('node:created', refresh))
      onCleanup(editor.onEditorEvent('node:deleted', refresh))
      onCleanup(editor.onEditorEvent('node:reparented', refresh))
      onCleanup(editor.onEditorEvent('node:reordered', refresh))
    },
    { flush: 'sync' }
  )
  return { nodes, node, dispose }
}

export function useSelectedNodeState(editor = useEditor()): SelectedNodeState {
  const state = createSelectedNodeState(editor, useRetainedActivity())
  tryOnScopeDispose(state.dispose)
  return state
}
