import { isEqual } from 'es-toolkit'
import { computed, type ComputedRef } from 'vue'

import { useEditor } from '#vue/editor/context'

/**
 * Convenience wrapper for scene-derived computed state.
 *
 * Use this for values that should clearly read as editor/scene-backed derived
 * state in higher-level composables.
 */
export function useSceneComputed<T>(fn: () => T): ComputedRef<T> {
  const editor = useEditor()
  return computed(() => {
    void editor.state.sceneVersion
    void editor.state.selectedIds
    void editor.state.currentPageId
    return fn()
  })
}

/**
 * Scene-derived state that keeps its previous value while it reads the same, so an edit
 * elsewhere in the scene, such as a keystroke, does not re-render what shows it. The value must
 * be a plain snapshot, never the graph's own objects, which change in place.
 */
export function useStableSceneComputed<T>(fn: () => T): ComputedRef<T> {
  const editor = useEditor()
  return computed<T>((previous) => {
    void editor.state.sceneVersion
    void editor.state.selectedIds
    void editor.state.currentPageId
    const next = fn()
    return previous !== undefined && isEqual(previous, next) ? previous : next
  })
}
