import { watchEffect } from 'vue'

import { settingsOpen } from '@/app/settings/open'
import { activeTab } from '@/app/tabs'

/**
 * Tells the styles which place is on screen: a page of the shell (Home, Settings), drawn on the
 * sky, or a document. What floats over the page takes its surface from it (`app.css`).
 */
export function watchShellPlace(root: HTMLElement = document.documentElement): () => void {
  return watchEffect(() => {
    const onShell = settingsOpen.value || activeTab.value?.kind !== 'document'
    root.dataset.place = onShell ? 'shell' : 'document'
  })
}
