import { onUnmounted } from 'vue'

import type { EditorStore } from '../stores/editor'

export function openFileDialog(store: EditorStore) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.fig'
  input.addEventListener('change', () => {
    const file = input.files?.[0]
    if (file) store.openFigFile(file)
  })
  input.click()
}

const MENU_ACTIONS: Record<string, (store: EditorStore) => void> = {
  open: (store) => openFileDialog(store),
  duplicate: (store) => store.duplicateSelected(),
  delete: (store) => store.deleteSelected(),
  'zoom-fit': (store) => store.zoomToFit(),
}

export function useMenu(store: EditorStore) {
  if (!('__TAURI_INTERNALS__' in window)) return

  let unlisten: (() => void) | undefined

  import('@tauri-apps/api/event').then(({ listen }) => {
    listen<string>('menu-event', (event) => {
      const action = MENU_ACTIONS[event.payload]
      if (action) action(store)
    }).then((fn) => {
      unlisten = fn
    })
  })

  onUnmounted(() => unlisten?.())
}
