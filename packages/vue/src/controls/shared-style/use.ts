import { computed, shallowRef } from 'vue'

import {
  getSharedStyles,
  sharedStyleRefKey,
  sharedStyleTypeForKind,
  type SceneNode,
  type SharedStyleKind
} from '@kalka/scene-graph'

import { useNodeProps } from '#vue/controls/node-props/use'
import { sharedStyleDetachPatch, sharedStylePatch } from '#vue/controls/shared-style/model'
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

export function useSharedStyleBinding(kind: SharedStyleKind) {
  const { store, nodes, merged } = useNodeProps()
  const refKey = sharedStyleRefKey(kind)
  const active = computed(
    () => nodes.value.length > 0 && nodes.value.every((node) => supportsStyle(node, kind))
  )
  const styleId = computed(() => merged(refKey))
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
  useEditorEvent('node:updated', (id, changes) => {
    if ('sharedStyleType' in changes || 'source' in changes || isStyle(id)) refresh()
  })

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

  return { kind, active, styleId, styles, bind, unbind }
}
