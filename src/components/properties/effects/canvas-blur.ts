import { computed, onScopeDispose, watch } from 'vue'

import type { EditorState } from '@kalka/core/editor'

import { useEditorStore } from '@/app/editor/active-store'

type BlurEdit = NonNullable<EditorState['blurEdit']>

/**
 * Shows a progressive blur's start and end on its layer while its settings are open, as Figma
 * does; dragging them on the canvas moves where the blur starts and where it is strongest.
 */
export function useCanvasBlurHandles(target: () => { nodeId: string; index: number } | null) {
  const store = useEditorStore()

  const shown = computed(() => {
    const where = target()
    if (!where || store.state.selectedIds.size !== 1 || !store.state.selectedIds.has(where.nodeId))
      return null
    return where
  })

  type Shown = NonNullable<typeof shown.value>
  const same = (edit: BlurEdit | null, mine: Shown | null): edit is BlurEdit =>
    !!edit && !!mine && edit.nodeId === mine.nodeId && edit.index === mine.index

  /** Hides the ends this panel showed, unless another one shows its own by now. */
  function release(mine: Shown) {
    if (same(store.state.blurEdit, mine)) store.setBlurEdit(null)
  }

  watch(
    shown,
    (mine, previous) => {
      if (previous && !same(store.state.blurEdit, mine)) release(previous)
      if (mine && !same(store.state.blurEdit, mine))
        store.setBlurEdit({ ...mine, handle: null, dragging: false })
    },
    { immediate: true }
  )

  onScopeDispose(() => {
    if (shown.value) release(shown.value)
  })
}
