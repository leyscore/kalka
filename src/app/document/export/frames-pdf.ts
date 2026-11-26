import { documentFrames } from '@kalka/core/io'

import type { EditorStore } from '@/app/editor/active-store'
import { notificationMessages } from '@/app/i18n/notifications'
import { toast } from '@/app/shell/ui'

/** Figma's File › Export frames to PDF, with a notice when the document has no frame. */
export async function exportFramesToPDF(store: EditorStore): Promise<void> {
  if (documentFrames(store.graph).length === 0) {
    toast.info(notificationMessages.get().noFramesToExport)
    return
  }
  try {
    await store.exportFramesToPDF()
  } catch (error) {
    console.error('[Export] Frames to PDF failed:', error)
    toast.error(notificationMessages.get().framesPDFExportFailed)
  }
}
