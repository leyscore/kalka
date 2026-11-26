import { ref } from 'vue'

import type { OffsetPathJoin } from '@kalka/core/canvas'

import type { EditorStore } from '@/app/editor/active-store'

import { createCommandPreview } from './preview'

/** Whether the Offset path dialog is open; it acts on the active editor's selection. */
export const offsetPathOpen = ref(false)

export function requestOffsetPath(store: EditorStore): void {
  if (store.state.nodeEditState) store.exitNodeEditMode(true)
  if (store.canOffsetPathSelected()) offsetPathOpen.value = true
}

/** The selection's offset paths, drawn while the dialog is open; CanvasKit outlines them. */
export const offsetPathPreview = createCommandPreview<{ offset: number; join: OffsetPathJoin }>(
  offsetPathOpen,
  async (store, { offset, join }) => {
    if (!Number.isFinite(offset) || offset === 0) return false
    await store.loadCanvasKit()
    return store.offsetPathSelected({ offset, join })
  }
)
