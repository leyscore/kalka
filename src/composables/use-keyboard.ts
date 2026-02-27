import { useEventListener } from '@vueuse/core'

import { TOOL_SHORTCUTS } from '../stores/editor'

import type { EditorStore } from '../stores/editor'

function openFileDialog(store: EditorStore) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.fig'
  input.addEventListener('change', () => {
    const file = input.files?.[0]
    if (file) store.openFigFile(file)
  })
  input.click()
}

function isEditing(e: Event) {
  return e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement
}

export function useKeyboard(store: EditorStore) {
  useEventListener(window, 'copy', (e: ClipboardEvent) => {
    if (isEditing(e)) return
    e.preventDefault()
    store.writeCopyData(e.clipboardData!)
  })

  useEventListener(window, 'cut', (e: ClipboardEvent) => {
    if (isEditing(e)) return
    e.preventDefault()
    store.writeCopyData(e.clipboardData!)
    store.deleteSelected()
  })

  useEventListener(window, 'paste', (e: ClipboardEvent) => {
    if (isEditing(e)) return
    e.preventDefault()
    const html = e.clipboardData?.getData('text/html') ?? ''
    if (html) store.pasteFromHTML(html)
  })

  useEventListener(window, 'keydown', (e: KeyboardEvent) => {
    if (isEditing(e)) return

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
      } else if (e.key === 'o') {
        e.preventDefault()
        openFileDialog(store)
      }
    }

    if (e.key === 'Backspace' || e.key === 'Delete') {
      store.deleteSelected()
    }

    if (e.key === 'Escape') {
      store.clearSelection()
      store.setTool('SELECT')
    }
  })
}
