import { ref } from 'vue'

import type { EditorStore } from '@/app/editor/active-store'

import { createCommandPreview } from './preview'

/** Whether the Simplify vector dialog is open; it acts on the active editor's selection. */
export const simplifyVectorOpen = ref(false)

/** How far, in pixels, a simplified path may stray from the one it replaces, at first. */
export const DEFAULT_SIMPLIFY_TOLERANCE = 1

export function requestSimplifyVector(store: EditorStore): void {
  if (store.canEditPathsSelected()) simplifyVectorOpen.value = true
}

/** The selection's simplified paths, drawn while the dialog is open. */
export const simplifyVectorPreview = createCommandPreview<{ tolerance: number }>(
  simplifyVectorOpen,
  (store, { tolerance }) =>
    Number.isFinite(tolerance) && tolerance > 0 && store.simplifyVectorSelected(tolerance)
)
