import {
  findInstanceAncestor,
  sharedStyleConsumers,
  sharedStyleKindsForType,
  sharedStyleRefKey,
  sharedStyleValues,
  type SceneNode
} from '@kalka/scene-graph'
import { useEditor } from '@kalka/vue'

type Snapshot = Map<string, Partial<SceneNode>>

/**
 * Edits a style's values from its editor. A drag or a picker shows each step on the style and the
 * layers using it without recording it; the final value is recorded once, for the style and every
 * layer using it, from the values the edit started from.
 */
export function useStyleEdit(definition: () => SceneNode) {
  const editor = useEditor()
  let before: Snapshot | null = null
  let pending: Partial<SceneNode> = {}

  /** The layers an edit of the style reaches, with what the style gives each. */
  function targets(style: SceneNode): Array<{ node: SceneNode; values: Partial<SceneNode> }> {
    const styleId = style.source.id
    const type = style.sharedStyleType
    if (!styleId || !type) return []
    return sharedStyleKindsForType(type).flatMap((kind) =>
      sharedStyleConsumers(editor.graph, kind, styleId)
        .filter((node) => !findInstanceAncestor(editor.graph, node.id))
        .map((node) => ({
          node,
          values: { ...sharedStyleValues(kind, node, style), [sharedStyleRefKey(kind)]: styleId }
        }))
    )
  }

  function remember(node: SceneNode, keys: readonly (keyof SceneNode)[], snapshot: Snapshot) {
    if (snapshot.has(node.id)) return
    snapshot.set(
      node.id,
      Object.fromEntries(keys.map((key) => [key, structuredClone(node[key])])) as Partial<SceneNode>
    )
  }

  /** Shows `changes` on the style and its layers, without recording them. */
  function preview(changes: Partial<SceneNode>) {
    const style = definition()
    const snapshot = before ?? new Map()
    before = snapshot
    remember(style, Object.keys(changes) as (keyof SceneNode)[], snapshot)
    pending = { ...pending, ...changes }
    editor.updateNode(style.id, changes)
    const updated = editor.graph.getNode(style.id)
    if (!updated) return
    for (const { node, values } of targets(updated)) {
      remember(node, Object.keys(values) as (keyof SceneNode)[], snapshot)
      editor.updateNode(node.id, values)
    }
    editor.requestRender()
  }

  /** Puts back what a preview changed. */
  function cancel() {
    const snapshot = before
    before = null
    pending = {}
    if (!snapshot) return
    for (const [id, values] of snapshot) editor.updateNode(id, values)
    editor.requestRender()
  }

  /** Records `changes` on the style and every layer using it, as one undo step. */
  function commit(changes: Partial<SceneNode>) {
    cancel()
    editor.updateSharedStyle(definition().id, changes)
  }

  /** Records what the previews since the last record showed, as when a picker closes. */
  function settle() {
    const changes = pending
    if (Object.keys(changes).length > 0) commit(changes)
  }

  return { preview, cancel, commit, settle }
}
