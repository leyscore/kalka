import { computed, shallowRef } from 'vue'

import {
  getSharedStyles,
  sharedStyleRefKey,
  sharedStyleTypeForKind,
  type SceneNode,
  type SharedStyleKind
} from '@kalka/scene-graph'

import { useNodeProps } from '#vue/controls/node-props/use'
import {
  groupSharedStyles,
  sharedStyleDetachPatch,
  sharedStylePatch
} from '#vue/controls/shared-style/model'
import { useEditor } from '#vue/editor/context'
import { useEditorEvent } from '#vue/editor/events/use'

function supportsStyle(node: SceneNode, kind: SharedStyleKind): boolean {
  if (kind === 'text') return node.type === 'TEXT'
  if (kind === 'grid') {
    return (
      node.type === 'FRAME' ||
      node.type === 'COMPONENT' ||
      node.type === 'COMPONENT_SET' ||
      node.type === 'INSTANCE'
    )
  }
  return node.type !== 'CANVAS'
}

/**
 * The document's styles of one kind, kept current as their definitions change, with the actions
 * that manage them. It does not depend on the selection, so the Local styles list uses it too.
 */
export function useSharedStyles(kind: SharedStyleKind) {
  const store = useEditor()
  // The document's styles are a walk of every layer: it runs again only after an edit to a style
  // layer, not after every edit, such as each keystroke in a text.
  const stylesRevision = shallowRef(0)
  const styles = computed(() => {
    void stylesRevision.value
    return getSharedStyles(store.graph, kind)
  })
  const isStyle = (id: string) => styles.value.some((style) => style.nodeId === id)
  const refresh = () => stylesRevision.value++
  useEditorEvent('graph:replaced', refresh)
  useEditorEvent('node:created', (node) => {
    if (node.sharedStyleType) refresh()
  })
  useEditorEvent('node:deleted', (id) => {
    if (isStyle(id)) refresh()
  })
  useEditorEvent('node:reordered', (id) => {
    if (isStyle(id)) refresh()
  })
  useEditorEvent('node:updated', (id, changes) => {
    if ('sharedStyleType' in changes || 'source' in changes || isStyle(id)) refresh()
  })

  /** The layer that defines a style, which holds its values. */
  function definition(styleNodeId: string): SceneNode | null {
    void stylesRevision.value
    const node = store.graph.getNode(styleNodeId)
    // A copy, so a component given it sees a new value after each change.
    return node ? { ...node } : null
  }

  return {
    styles,
    groups: computed(() => groupSharedStyles(styles.value)),
    definition,
    rename: (styleNodeId: string, name: string) => store.renameSharedStyle(styleNodeId, name),
    remove: (styleNodeId: string) => store.deleteSharedStyle(styleNodeId),
    move: (styleNodeId: string, targetNodeId: string, placement: 'before' | 'after') =>
      store.moveSharedStyle(styleNodeId, targetNodeId, placement)
  }
}

export function useSharedStyleBinding(kind: SharedStyleKind) {
  const { store, nodes, merged } = useNodeProps()
  const refKey = sharedStyleRefKey(kind)
  const active = computed(
    () => nodes.value.length > 0 && nodes.value.every((node) => supportsStyle(node, kind))
  )
  const styleId = computed(() => merged(refKey))
  const { styles, definition } = useSharedStyles(kind)

  function update(label: string, apply: (node: SceneNode) => Partial<SceneNode>) {
    if (!active.value) return
    const targets = nodes.value
    const run = () => {
      for (const node of targets) store.updateNodeWithUndo(node.id, apply(node), label)
    }
    if (targets.length > 1) store.undo.runBatch(label, run)
    else run()
  }

  function bind(nextStyleId: string) {
    const styleInfo = styles.value.find((style) => style.id === nextStyleId)
    const styleNode = styleInfo ? (store.graph.getNode(styleInfo.nodeId) ?? null) : null
    if (styleNode?.sharedStyleType !== sharedStyleTypeForKind(kind)) return
    update(`Apply ${kind} style`, (node) => sharedStylePatch(kind, node, nextStyleId, styleNode))
  }

  function unbind() {
    update(`Detach ${kind} style`, () => sharedStyleDetachPatch(kind))
  }

  /** Makes a text style from the selected text layers' properties and applies it to them. */
  function createTextStyle(name: string) {
    if (kind !== 'text' || !active.value) return null
    return store.createTextStyle(
      name,
      nodes.value.map((node) => node.id)
    )
  }

  return { kind, active, styleId, styles, definition, bind, unbind, createTextStyle }
}
