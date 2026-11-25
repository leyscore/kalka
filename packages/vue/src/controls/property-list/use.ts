import { computed } from 'vue'

import { listBindingsAfterEdit, type Fill, type SceneNode } from '@kalka/scene-graph'

import { useNodeProps } from '#vue/controls/node-props/use'
import { useUndoBatch } from '#vue/controls/undo-batch/use'
import { useEditor } from '#vue/editor/context'
import type {
  PropertyListActions,
  PropertyListItemFor,
  PropertyListKey,
  PropertyListPatchFor
} from '#vue/primitives/PropertyList/types.ts'

function moveItem<T>(items: readonly T[], fromIndex: number, toIndex: number): readonly T[] {
  if (fromIndex === toIndex || fromIndex < 0 || fromIndex >= items.length) return items
  const next = [...items]
  const moved = next.splice(fromIndex, 1)[0]
  if (moved === undefined) return items
  next.splice(Math.max(0, Math.min(toIndex, next.length)), 0, moved)
  return next
}

export function useEditorPropertyList<K extends PropertyListKey>(propKey: K) {
  const editor = useEditor()
  const { isArrayMixed, nodes: selectedNodes, activeNode } = useNodeProps()
  const batch = useUndoBatch(editor.undo, editor.beginInteractiveEdit)
  const selectedNodeIds = computed(() => selectedNodes.value.map((node) => node.id))
  const isMulti = computed(() => selectedNodes.value.length > 1)
  const active = computed(() => selectedNodes.value.length > 0)
  const isMixed = computed(() => isArrayMixed(propKey))
  const items = computed<PropertyListItemFor<K>[]>(() => {
    if (isMixed.value) return []
    return (activeNode.value?.[propKey] ?? []) as PropertyListItemFor<K>[]
  })

  function targetNodes(): SceneNode[] {
    if (isMulti.value) return selectedNodes.value
    return activeNode.value ? [activeNode.value] : []
  }

  function propArray(node: SceneNode): PropertyListItemFor<K>[] {
    return node[propKey] as PropertyListItemFor<K>[]
  }

  /**
   * `sources` gives the position each item had, or null for a new one, when the edit adds, removes,
   * or moves items, so their bindings follow them in the same undo step.
   */
  function updateArray(
    node: SceneNode,
    value: PropertyListItemFor<K>[],
    label: string,
    sources?: readonly (number | null)[]
  ) {
    // Characters selected in the text being edited take a fill change, not the whole layer.
    if (
      propKey === 'fills' &&
      !sources &&
      editor.styleTextSelection(node.id, { fills: structuredClone(value) as Fill[] })
    )
      return
    const changes: Partial<SceneNode> = { [propKey]: value }
    if (sources)
      changes.boundVariables = listBindingsAfterEdit(node.boundVariables, propKey, sources)
    editor.updateNodeWithUndo(node.id, changes, label)
  }

  /** The positions of a list of `length` items, as `sources` for an edit that keeps them. */
  function positions(length: number): number[] {
    return Array.from({ length }, (_, index) => index)
  }

  function add(item: PropertyListItemFor<K>) {
    batch.flush()
    const nodes = targetNodes()
    const label = isMulti.value ? `Set ${propKey}` : `Add ${propKey}`
    const apply = () => {
      for (const node of nodes) {
        const nextItem = structuredClone(item)
        const current = propArray(node)
        updateArray(
          node,
          isMulti.value ? [nextItem] : [...current, nextItem],
          label,
          isMulti.value ? [null] : [...positions(current.length), null]
        )
      }
    }
    if (nodes.length > 1) editor.undo.runBatch(label, apply)
    else apply()
  }

  function remove(index: number) {
    batch.flush()
    const nodes = targetNodes()
    const label = `Remove ${propKey}`
    const apply = () => {
      for (const node of nodes) {
        const current = propArray(node)
        const kept = positions(current.length).filter((itemIndex) => itemIndex !== index)
        updateArray(
          node,
          kept.map((itemIndex) => current[itemIndex]),
          label,
          kept
        )
      }
    }
    if (nodes.length > 1) editor.undo.runBatch(label, apply)
    else apply()
  }

  function update(index: number, item: PropertyListItemFor<K>) {
    const nodes = targetNodes()
    if (nodes.length === 0) return
    batch.ensure(
      `update:${propKey}:${index}:${nodes.map((node) => node.id).join(',')}`,
      `Change ${propKey}`
    )
    for (const node of nodes) {
      const next = [...propArray(node)]
      next[index] = structuredClone(item)
      updateArray(node, next, `Change ${propKey}`)
    }
  }

  function patch(index: number, changes: PropertyListPatchFor<K>) {
    const nodes = targetNodes()
    if (nodes.length === 0) return
    batch.ensure(
      `patch:${propKey}:${index}:${nodes.map((node) => node.id).join(',')}`,
      `Change ${propKey}`
    )
    for (const node of nodes) {
      const current = propArray(node)[index]
      if (!current) continue
      const next = [...propArray(node)]
      next[index] = { ...current, ...structuredClone(changes) }
      updateArray(node, next, `Change ${propKey}`)
    }
  }

  function toggleVisibility(index: number) {
    batch.flush()
    const nodes = targetNodes()
    if (nodes.length === 0) return
    const apply = () => {
      for (const node of nodes) {
        const liveNode = editor.getNode(node.id)
        if (!liveNode) continue
        const current = propArray(liveNode)[index]
        if (!current) continue
        const next = [...propArray(liveNode)]
        next[index] = { ...current, visible: !current.visible }
        updateArray(liveNode, next, `Toggle ${propKey} visibility`)
      }
    }
    if (nodes.length > 1) editor.undo.runBatch(`Toggle ${propKey} visibility`, apply)
    else apply()
  }

  function reorder(fromIndex: number, toIndex: number) {
    batch.flush()
    const nodes = targetNodes()
    if (nodes.length === 0 || fromIndex === toIndex) return
    const apply = () => {
      for (const node of nodes) {
        const current = propArray(node)
        const order = moveItem(positions(current.length), fromIndex, toIndex)
        updateArray(
          node,
          order.map((itemIndex) => current[itemIndex]),
          `Reorder ${propKey}`,
          order
        )
      }
    }
    if (nodes.length > 1) editor.undo.runBatch(`Reorder ${propKey}`, apply)
    else apply()
  }

  const actions: PropertyListActions<K> = {
    add,
    remove,
    update,
    patch,
    toggleVisibility,
    reorder
  }

  return {
    items,
    isMixed,
    isMulti,
    active,
    activeNode,
    selectedNodeIds,
    flush: batch.flush,
    actions
  }
}
