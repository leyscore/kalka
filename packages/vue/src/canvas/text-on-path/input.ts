import type { Editor } from '@kalka/core/editor'
import type { SceneNode } from '@kalka/scene-graph'

import type { HitTestFns } from '#vue/shared/input/select'

/** A path the Text tool writes along: a line, or a vector drawn only by its stroke. */
function writesAlong(node: SceneNode): boolean {
  if (node.locked) return false
  if (node.type === 'LINE') return true
  return (
    node.type === 'VECTOR' &&
    node.vectorNetwork !== null &&
    !node.fills.some((fill) => fill.visible) &&
    node.strokes.some((stroke) => stroke.visible)
  )
}

/**
 * A Text tool press on a path, as in Figma Draw: the path becomes a text running along it, and
 * typing starts. Whether the press was on such a path.
 */
export function tryStartTextOnPath(
  cx: number,
  cy: number,
  editor: Editor,
  hitFns: HitTestFns
): boolean {
  const hit = hitFns.hitTestInScope(cx, cy, true)
  if (!hit || !writesAlong(hit)) return false
  editor.select([hit.id])
  void (async () => {
    const id = await editor.placeTextOnPathSelected()
    if (id) editor.startTextEditing(id)
  })()
  return true
}
