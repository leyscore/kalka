import { HANDLE_HIT_RADIUS } from '@kalka/core/constants'
import type { Editor } from '@kalka/core/editor'
import { createSceneGeometry, selectionHandleRect } from '@kalka/core/geometry'
import type { Vector } from '@kalka/scene-graph/primitives'

import type { DragScale, HandlePosition } from '#vue/shared/input/types'

const OPPOSITE: Record<HandlePosition, HandlePosition> = {
  nw: 'se',
  n: 's',
  ne: 'sw',
  e: 'w',
  se: 'nw',
  s: 'n',
  sw: 'ne',
  w: 'e'
}

/**
 * A press on a handle of a selected layer with the Scale tool (K): the drag scales the selection
 * about the opposite handle. Null when the press misses every handle.
 */
export function tryStartScale(cx: number, cy: number, editor: Editor): DragScale | null {
  const geometry = createSceneGeometry(editor.graph, editor.state.rotationPreview)
  const radius = HANDLE_HIT_RADIUS / editor.state.zoom
  for (const id of editor.state.selectedIds) {
    const node = editor.graph.getNode(id)
    if (!node || node.locked) continue
    const handles = geometry.handles(node, selectionHandleRect(node))
    for (const [key, point] of Object.entries(handles) as [HandlePosition, Vector][]) {
      if (Math.hypot(cx - point.x, cy - point.y) > radius) continue
      const anchor = handles[OPPOSITE[key]]
      const session = editor.beginScale(editor.state.selectedIds, anchor)
      return session ? { type: 'scale', session, anchor, handle: { ...point } } : null
    }
  }
  return null
}

/**
 * The factor the pointer asks for: how far along the line from the anchor to the grabbed handle
 * it has gone, so a corner and an edge handle both scale the layer as a whole.
 */
export function scaleFactor(drag: Pick<DragScale, 'anchor' | 'handle'>, cx: number, cy: number) {
  const reach = { x: drag.handle.x - drag.anchor.x, y: drag.handle.y - drag.anchor.y }
  const lengthSquared = reach.x * reach.x + reach.y * reach.y
  if (lengthSquared < 1e-9) return 1
  return ((cx - drag.anchor.x) * reach.x + (cy - drag.anchor.y) * reach.y) / lengthSquared
}
