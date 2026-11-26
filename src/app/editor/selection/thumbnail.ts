import type { EditorStore } from '@/app/editor/active-store'
import { notificationMessages } from '@/app/i18n/notifications'
import { toast } from '@/app/shell/ui'

/**
 * Figma's Set as thumbnail: the selected top-level frame becomes what the file's thumbnail
 * shows. On the frame that already is, it is Restore default thumbnail.
 */
export function toggleSelectionThumbnail(store: EditorStore): void {
  const messages = notificationMessages.get()
  const [id, ...rest] = [...store.state.selectedIds]
  const node = id && rest.length === 0 ? store.graph.getNode(id) : undefined
  if (node?.id === store.graph.thumbnailNodeId) {
    store.setThumbnailNode(null)
    toast.info(messages.thumbnailRestored)
  } else if (node && store.setThumbnailNode(node.id)) {
    toast.info(messages.thumbnailSet({ name: node.name }))
  } else {
    toast.error(messages.thumbnailNeedsFrame)
  }
}
