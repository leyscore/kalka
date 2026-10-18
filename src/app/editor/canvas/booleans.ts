import { onScopeDispose } from 'vue'

import type { EditorStore } from '@/app/editor/active-store'

function hasBooleanOperation(store: EditorStore): boolean {
  for (const node of store.graph.getAllNodes()) {
    if (node.type === 'BOOLEAN_OPERATION') return true
  }
  return false
}

/**
 * Loads CanvasKit once the document holds a boolean operation: the DOM scene draws one from the
 * outline Skia computes, and until it loads, from the geometry the file saved. A document
 * without booleans never loads it for drawing.
 */
export function useBooleanOperationsCanvasKit(store: EditorStore): void {
  const load = () => void store.loadCanvasKit()
  if (hasBooleanOperation(store)) load()
  const stops = [
    store.onEditorEvent('graph:replaced', () => {
      if (hasBooleanOperation(store)) load()
    }),
    store.onEditorEvent('node:created', (node) => {
      if (node.type === 'BOOLEAN_OPERATION') load()
    })
  ]
  onScopeDispose(() => {
    for (const stop of stops) stop()
  })
}
