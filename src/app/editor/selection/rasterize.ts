import { computeContentBounds } from '@kalka/core/io'

import type { EditorStore } from '@/app/editor/active-store'

/** The image's pixels per point, as sharp as the selection on a Retina display. */
const RASTER_SCALE = 2

/**
 * Figma's Rasterize selection (Cmd+E): the selected layers become one image of themselves, drawn
 * as the canvas draws them. Nothing happens when the selection changed while it was drawn.
 */
export async function rasterizeSelection(store: EditorStore): Promise<boolean> {
  const ids = [...store.state.selectedIds]
  if (ids.length === 0 || store.state.editingTextId) return false
  const bounds = computeContentBounds(store.graph, ids)
  if (!bounds) return false
  const bytes = await store.renderExportImage(ids, RASTER_SCALE, 'PNG')
  const same =
    store.state.selectedIds.size === ids.length &&
    ids.every((id) => store.state.selectedIds.has(id))
  if (!bytes || !same) return false
  return store.replaceSelectionWithImage(bytes, bounds) !== null
}
