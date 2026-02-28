import { onUnmounted } from 'vue'

import { IS_TAURI } from '@/constants'

import type { EditorStore } from '@/stores/editor'

export async function openFileDialog(store: EditorStore) {
  if (IS_TAURI) {
    const { open } = await import('@tauri-apps/plugin-dialog')
    const { readFile } = await import('@tauri-apps/plugin-fs')
    const path = await open({
      filters: [{ name: 'Figma file', extensions: ['fig'] }],
      multiple: false
    })
    if (!path) return
    const bytes = await readFile(path as string)
    const file = new File([bytes], (path as string).split('/').pop() ?? 'file.fig')
    await store.openFigFile(file, undefined, path as string)
    return
  }

  if (window.showOpenFilePicker) {
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [
          {
            description: 'Figma file',
            accept: { 'application/octet-stream': ['.fig'] }
          }
        ]
      })
      const file = await handle.getFile()
      await store.openFigFile(file, handle)
      return
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
    }
  }

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
  save: (store) => store.saveFigFile(),
  'save-as': (store) => store.saveFigFileAs(),
  duplicate: (store) => store.duplicateSelected(),
  delete: (store) => store.deleteSelected(),
  group: (store) => store.groupSelected(),
  ungroup: (store) => store.ungroupSelected(),
  'create-component': (store) => store.createComponentFromSelection(),
  'create-component-set': (store) => store.createComponentSetFromComponents(),
  'detach-instance': (store) => store.detachInstance(),
  'zoom-fit': (store) => store.zoomToFit()
}

export function useMenu(store: EditorStore) {
  if (!IS_TAURI) return

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
