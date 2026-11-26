import type { EditorStore } from '@/app/editor/active-store'
import { requestOffsetPath } from '@/app/editor/vector/offset-dialog'
import { requestSimplifyVector } from '@/app/editor/vector/simplify-dialog'

/**
 * Figma's Vector menu, keyed by menu item. In a path being edited the commands act on it and its
 * chosen points; otherwise Simplify, Reverse and Offset act on the selected layers, Simplify and
 * Offset through a dialog that previews them.
 */
export function createVectorMenuActions(store: EditorStore) {
  const editing = () => store.state.nodeEditState !== null
  return {
    'vector.join': () => void store.nodeEditJoinSelected(false),
    'vector.smooth-join': () => void store.nodeEditJoinSelected(true),
    'vector.delete-and-heal': () => void store.nodeEditHealSelected(),
    'vector.simplify': () =>
      editing() ? void store.nodeEditSimplify() : requestSimplifyVector(store),
    'vector.reverse': () =>
      void (editing() ? store.nodeEditReversePath() : store.reversePathSelected()),
    'vector.offset': () => requestOffsetPath(store)
  } satisfies Record<string, () => void>
}

export type VectorMenuActionId = keyof ReturnType<typeof createVectorMenuActions>
