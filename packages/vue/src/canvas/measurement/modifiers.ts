import type { Ref } from 'vue'

import type { Editor } from '@kalka/core/editor'

import { resolveAutoLayoutHover } from '#vue/shared/input/auto-layout-hover'
import { updateHoverCursor, type HitTestFns } from '#vue/shared/input/select'

/**
 * Measurement mode from the held modifiers, as Figma measures while Alt is held: Alt over a layer
 * shows its distances from the selection, and ⌘ or Ctrl with it measures to the deepest layer.
 */
export function createMeasurementModifiers(options: {
  editor: Editor
  hitFns: HitTestFns
  isEnabled: () => boolean
  isDragging: () => boolean
  pointerInside: Ref<boolean>
  lastPointer: Ref<{ cx: number; cy: number } | null>
  cursorOverride: Ref<string | null>
}) {
  const { editor, hitFns, isDragging, pointerInside, lastPointer, cursorOverride } = options
  let altHeld = false
  let metaHeld = false
  let controlHeld = false

  function canMeasure() {
    return (
      pointerInside.value &&
      !isDragging() &&
      editor.state.activeTool === 'SELECT' &&
      editor.state.selectedIds.size > 0 &&
      !editor.state.editingTextId &&
      !editor.state.nodeEditState &&
      !editor.state.penState
    )
  }

  /** ⌘ or Ctrl held: hover reaches the deepest layer, the one a click would select, as in Figma. */
  function hoverDeep(e?: MouseEvent) {
    return e ? e.metaKey || e.ctrlKey : metaHeld || controlHeld
  }

  function refreshMeasurement() {
    const mode = altHeld && canMeasure() ? (metaHeld || controlHeld ? 'deep' : 'shallow') : 'off'
    editor.setMeasurementMode(mode)
    const pointer = lastPointer.value
    if (!pointer || isDragging() || editor.state.activeTool !== 'SELECT' || !pointerInside.value)
      return
    cursorOverride.value = updateHoverCursor(
      pointer.cx,
      pointer.cy,
      editor,
      hitFns,
      mode === 'deep' || hoverDeep()
    )
    editor.setAutoLayoutHover(
      mode === 'off' ? resolveAutoLayoutHover(pointer.cx, pointer.cy, editor) : null
    )
  }

  function updateModifier(code: string, held: boolean) {
    if (!options.isEnabled()) return
    if (code === 'AltLeft' || code === 'AltRight') altHeld = held
    if (code === 'MetaLeft' || code === 'MetaRight') metaHeld = held
    if (code === 'ControlLeft' || code === 'ControlRight') controlHeld = held
    if (code.startsWith('Alt') || code.startsWith('Meta') || code.startsWith('Control')) {
      refreshMeasurement()
    }
  }

  function resetMeasurementModifiers() {
    altHeld = false
    metaHeld = false
    controlHeld = false
    editor.setMeasurementMode('off')
  }

  return { hoverDeep, refreshMeasurement, updateModifier, resetMeasurementModifiers }
}
