import { computed, onScopeDispose, ref, watch, type Ref } from 'vue'

import type { EditorState } from '@kalka/core/editor'
import type { Fill } from '@kalka/scene-graph'
import { isGradientFill } from '@kalka/scene-graph/gradient'

import { useEditorStore } from '@/app/editor/active-store'

type GradientEdit = NonNullable<EditorState['gradientEdit']>

interface CanvasGradientOptions {
  /** Whether the picker is open. */
  open: Ref<boolean>
  fill: () => Fill
  /** Where the paint sits on the selected layer; null for a picker with no canvas paint. */
  target: () => { paint: GradientEdit['paint']; index: number } | null
  /** A gradient handle is pressed on the canvas. */
  onDragStart: () => void
}

/**
 * Shows the gradient of an open picker on the selected layer, as Figma does, with the picker's
 * selected stop and the canvas's sharing one value. The picker stays open while its handles are
 * dragged on the canvas.
 */
export function useCanvasGradientHandles({
  open,
  fill,
  target,
  onDragStart
}: CanvasGradientOptions) {
  const store = useEditorStore()
  const activeStop = ref(0)

  /** The layer and paint the handles belong to, or null when they do not show. */
  const shown = computed(() => {
    const where = target()
    if (!open.value || !where || !isGradientFill(fill().type)) return null
    if (store.state.selectedIds.size !== 1) return null
    const [nodeId] = store.state.selectedIds
    return { nodeId, ...where }
  })

  type Shown = NonNullable<typeof shown.value>
  const same = (edit: GradientEdit | null, mine: Shown | null): edit is GradientEdit =>
    !!edit &&
    !!mine &&
    edit.nodeId === mine.nodeId &&
    edit.paint === mine.paint &&
    edit.index === mine.index
  const owned = (edit: GradientEdit | null): edit is GradientEdit => same(edit, shown.value)

  /** Hides the handles this picker showed, unless another picker shows its own by now. */
  function release(mine: Shown) {
    if (same(store.state.gradientEdit, mine)) store.setGradientEdit(null)
  }

  watch(
    shown,
    (mine, previous) => {
      if (mine) {
        const edit = store.state.gradientEdit
        if (owned(edit)) return
        store.setGradientEdit({
          ...mine,
          activeStop: activeStop.value,
          handle: null,
          dragging: false
        })
      } else if (previous) {
        release(previous)
      }
    },
    { immediate: true }
  )

  // The picker's stop and the canvas's stay one: either one selecting a stop selects it in both.
  watch(activeStop, (stop) => {
    const edit = store.state.gradientEdit
    if (owned(edit) && edit.activeStop !== stop)
      store.setGradientEdit({ ...edit, activeStop: stop })
  })
  watch(
    () => store.state.gradientEdit,
    (edit, previous) => {
      if (!owned(edit)) return
      activeStop.value = edit.activeStop
      if (edit.dragging && !previous?.dragging) onDragStart()
    },
    { flush: 'sync' }
  )

  onScopeDispose(() => {
    if (shown.value) release(shown.value)
  })

  /** Keeps the picker open when the press outside it lands on one of its gradient handles. */
  function keepOpen(event: Event) {
    const edit = store.state.gradientEdit
    if (owned(edit) && (edit.handle !== null || edit.dragging)) event.preventDefault()
  }

  return { activeStop, keepOpen }
}
