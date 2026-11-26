import { useFileDialog } from '@vueuse/core'

import { useEditorStore } from '@/app/editor/active-store'

const store = useEditorStore()

const imageDialog = useFileDialog({ accept: 'image/*', multiple: true, reset: true })

imageDialog.onChange((files) => {
  if (!files || files.length === 0) return
  const center = store.viewportCanvasCenter()
  void store.placeImageFiles([...files], center.x, center.y)
})

/**
 * Figma's Place image…: pick images from disk; they land in the middle of the view, as pasted
 * images do.
 */
export function placeImage(): void {
  imageDialog.open()
}
