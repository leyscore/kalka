import { useFileDialog } from '@vueuse/core'
import { ref, shallowRef } from 'vue'

import type { DesignTokenBundle } from '@kalka/core/io/formats/design-tokens'

import type { EditorStore } from '@/app/editor/active-store'
import { createTokenCopy } from '@/app/editor/tokens/copy'
import {
  DESIGN_TOKEN_FILE_ACCEPT,
  exportDesignTokenArchive,
  readDesignTokenFiles
} from '@/app/editor/tokens/design-tokens'
import { notificationMessages } from '@/app/i18n/notifications'
import { toast } from '@/app/shell/ui'

function reportFailure(error: unknown) {
  toast.error(
    notificationMessages
      .get()
      .operationFailed({ error: error instanceof Error ? error.message : String(error) })
  )
}

/**
 * What the variables page and dialog do with files: copy tokens as a stylesheet, export them, and
 * read token files, a folder's worth or a zip of them, into a bundle the import dialog shows.
 */
export function useTokenFiles(store: EditorStore) {
  const copyTokens = createTokenCopy(store)
  const importBundle = shallowRef<DesignTokenBundle | null>(null)
  const importOpen = ref(false)

  const tokenFiles = useFileDialog({
    accept: DESIGN_TOKEN_FILE_ACCEPT,
    multiple: true,
    reset: true
  })
  tokenFiles.onChange((files) => {
    if (!files?.length) return
    const picked = [...files]
    void (async () => {
      const sources = await readDesignTokenFiles(picked)
      const { readDesignTokens } = await import('@kalka/core/io/formats/design-tokens')
      importBundle.value = readDesignTokens(sources)
      importOpen.value = true
    })().catch(reportFailure)
  })

  function exportTokens() {
    exportDesignTokenArchive(store).catch(reportFailure)
  }

  return { copyTokens, exportTokens, importBundle, importOpen, openTokenFiles: tokenFiles.open }
}
