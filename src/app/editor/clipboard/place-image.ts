import { useFileDialog } from '@vueuse/core'

import { placeCanvasFiles } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'

const store = useEditorStore()

const imageDialog = useFileDialog({
  accept: 'image/*,video/mp4,video/quicktime,video/webm',
  multiple: true,
  reset: true
})

imageDialog.onChange((files) => {
  if (!files || files.length === 0) return
  const center = store.viewportCanvasCenter()
  void placeCanvasFiles(store, [...files], center.x, center.y)
})

/**
 * Figma's Place image/video…: pick images or videos from disk; they land in the middle of the
 * view, as pasted images do.
 */
export function placeImage(): void {
  imageDialog.open()
}
