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

const BEAM = 'M9 3h6M12 3v13M9 16h6'
const CURVE = 'M4 21c3-3 5 1 8-1s5-3 8 0'
const ON_PATH_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'>" +
  "<g fill='none' stroke-linecap='round'>" +
  [BEAM, CURVE]
    .map(
      (d) =>
        `<path d='${d}' stroke='white' stroke-width='3'/><path d='${d}' stroke='black' stroke-width='1.25'/>`
    )
    .join('') +
  '</g></svg>'

/** Figma Draw's text-on-a-path cursor: the text beam over a curve. */
export const TEXT_ON_PATH_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(ON_PATH_SVG)}") 12 10, text`

/**
 * The canvas cursor after a move: Text tool over a path it would write along shows the text on a
 * path cursor; any other move drops it and keeps `current` otherwise.
 */
export function textOnPathCursor(
  cx: number,
  cy: number,
  editor: Editor,
  hitFns: Pick<HitTestFns, 'hitTestInScope'>,
  current: string | null
): string | null {
  if (editor.state.activeTool !== 'TEXT') return current === TEXT_ON_PATH_CURSOR ? null : current
  const hit = hitFns.hitTestInScope(cx, cy, true)
  return hit && writesAlong(hit) ? TEXT_ON_PATH_CURSOR : null
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
