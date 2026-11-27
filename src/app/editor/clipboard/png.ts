import type { EditorStore } from '@/app/editor/active-store'
import { notificationMessages } from '@/app/i18n/notifications'
import { toast } from '@/app/shell/ui'

function toArrayBuffer(data: Uint8Array): ArrayBuffer {
  const bytes = new Uint8Array(data.length)
  bytes.set(data)
  return bytes.buffer
}

/** Copies layers as a PNG at 2x, as Figma's Copy as PNG does, and says so. */
export async function copyLayersAsPNG(store: EditorStore, ids: string[]): Promise<void> {
  if (ids.length === 0) return
  if (typeof ClipboardItem === 'undefined') {
    toast.error(notificationMessages.get().pngClipboardUnavailable)
    return
  }
  const data = await store.renderExportImage(ids, 2, 'PNG')
  if (!data) return
  const blob = new Blob([toArrayBuffer(data)], { type: 'image/png' })
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
  toast.info(notificationMessages.get().copiedAs({ format: 'PNG' }))
}
