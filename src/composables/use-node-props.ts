import { computed } from 'vue'

import { useEditorStore } from '@/stores/editor'

import type { SceneNode } from '@/engine/scene-graph'

export function useNodeProps() {
  const store = useEditorStore()
  const node = computed(() => store.selectedNode.value ?? null)
  const nodes = computed(() => store.selectedNodes.value)

  function updateProp(key: string, value: number | string) {
    if (store.selectedNodes.value.length > 1) {
      for (const n of store.selectedNodes.value) {
        store.updateNode(n.id, { [key]: value })
      }
    } else {
      const node = store.selectedNode.value
      if (node) store.updateNode(node.id, { [key]: value })
    }
  }

  function commitProp(key: string, _value: number | string, previous: number | string) {
    if (store.selectedNodes.value.length > 1) {
      for (const n of store.selectedNodes.value) {
        store.commitNodeUpdate(n.id, { [key]: previous } as Partial<SceneNode>, `Change ${key}`)
      }
    } else {
      const node = store.selectedNode.value
      if (node) {
        store.commitNodeUpdate(node.id, { [key]: previous } as Partial<SceneNode>, `Change ${key}`)
      }
    }
  }

  return { store, node, nodes, updateProp, commitProp }
}
