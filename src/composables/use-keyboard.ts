import { onMounted, onUnmounted } from 'vue'

import { TOOL_SHORTCUTS } from '../stores/editor'

import type { EditorStore } from '../stores/editor'

export function useKeyboard(store: EditorStore) {
  function onKeyDown(e: KeyboardEvent) {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

    const tool = TOOL_SHORTCUTS[e.key.toLowerCase()]
    if (tool) {
      store.setTool(tool)
      return
    }

    if (e.metaKey || e.ctrlKey) {
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        store.undoAction()
      } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
        e.preventDefault()
        store.redoAction()
      } else if (e.key === '0') {
        e.preventDefault()
        store.zoomToFit()
      } else if (e.key === 'd') {
        e.preventDefault()
        store.duplicateSelected()
      } else if (e.key === 'a') {
        e.preventDefault()
        store.selectAll()
      }
    }

    if (e.key === 'Backspace' || e.key === 'Delete') {
      store.deleteSelected()
    }

    if (e.key === 'Escape') {
      store.clearSelection()
      store.setTool('SELECT')
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeyDown))
  onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
}
