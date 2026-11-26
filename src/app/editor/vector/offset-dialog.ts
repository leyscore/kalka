import { ref } from 'vue'

import type { OffsetPathJoin } from '@kalka/core/canvas'

import type { EditorStore } from '@/app/editor/active-store'

/** Whether the Offset path dialog is open; it acts on the active editor's selection. */
export const offsetPathOpen = ref(false)

export function requestOffsetPath(store: EditorStore): void {
  if (store.state.nodeEditState) store.exitNodeEditMode(true)
  if (store.canOffsetPathSelected()) offsetPathOpen.value = true
}

/** Draws the selection's offset paths; CanvasKit outlines them. */
export async function applyOffsetPath(
  store: EditorStore,
  offset: number,
  join: OffsetPathJoin
): Promise<boolean> {
  await store.loadCanvasKit()
  return store.offsetPathSelected({ offset, join })
}
