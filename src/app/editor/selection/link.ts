import { roomForStore } from '@/app/collab/rooms'
import { isServerRoom, serverDocumentLink } from '@/app/collab/server/documents'
import type { EditorStore } from '@/app/editor/active-store'
import { notificationMessages } from '@/app/i18n/notifications'
import { toast } from '@/app/shell/ui'
import { writeTauriClipboardText } from '@/app/tauri/clipboard'
import { isTauri } from '@/app/tauri/env'

/**
 * A link that opens the document and selects the layer: a server document's address with
 * `?node-id=`, as Figma writes it, or in the desktop app a `kalka://open` link to the saved file,
 * which finds the layer by name. Null when the document has neither.
 */
export function selectionLink(store: EditorStore): string | null {
  const [id] = store.state.selectedIds
  const node = id ? store.graph.getNode(id) : undefined
  if (!node) return null
  const room = roomForStore(store)
  if (room && isServerRoom(room.roomId)) {
    const link = serverDocumentLink(room.roomId, store.state.documentName)
    if (link) {
      const url = new URL(link)
      url.searchParams.set('node-id', node.id.replace(':', '-'))
      return url.toString()
    }
  }
  const path = store.getSourceIdentity().path
  if (isTauri() && path) {
    const file = path.split(/[/\\]/).at(-1) ?? path
    return `kalka://open?file=${encodeURIComponent(file)}&node=${encodeURIComponent(node.name)}`
  }
  return null
}

/** Figma's Copy link to selection (Cmd+L). */
export async function copySelectionLink(store: EditorStore): Promise<void> {
  if (store.state.selectedIds.size === 0) return
  const link = selectionLink(store)
  if (!link) {
    toast.info(notificationMessages.get().selectionLinkUnavailable)
    return
  }
  try {
    if (isTauri()) await writeTauriClipboardText(link)
    else await navigator.clipboard.writeText(link)
    toast.info(notificationMessages.get().selectionLinkCopied)
  } catch (error) {
    console.warn('Copy link to selection failed', error)
    toast.error(notificationMessages.get().clipboardAccessBlocked)
  }
}
