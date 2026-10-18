import { watch } from 'vue'

import { resolvedAppTheme } from '@/app/shell/theme'
import { IS_TAURI } from '@/constants'

/**
 * Keeps the desktop window's own controls in the app's theme: on Windows and Linux the caption
 * buttons drawn over the tab bar take its light or dark colors (`electron/src/handlers/title-bar.ts`).
 * The theme is resolved here, System included, so the buttons always match the page.
 */
export function useWindowTheme(): void {
  if (!IS_TAURI) return
  watch(
    resolvedAppTheme,
    async (theme) => {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window')
        await getCurrentWindow().setTheme(theme)
      } catch (error) {
        console.error('[Window theme]', error)
      }
    },
    { immediate: true }
  )
}
