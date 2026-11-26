import { getAxisAlignedWorldBounds } from '@kalka/scene-graph/coordinate'
import { computeBounds } from '@kalka/scene-graph/geometry'
import type { Vector } from '@kalka/scene-graph/primitives'

import type { EditorStore } from '@/app/editor/active-store'
import { pasteClipboardHTML } from '@/app/editor/clipboard/paste'
import { readClipboardHTML } from '@/app/editor/clipboard/read'
import { executeClipboardCommand } from '@/app/editor/clipboard/system'
import { notificationMessages } from '@/app/i18n/notifications'
import { toast } from '@/app/shell/ui'

/** The middle of the selection on the canvas, where Paste over selection centres what it pastes. */
export function selectionCenter(store: EditorStore): Vector | undefined {
  const nodes = store.selectedNodes.value
  if (nodes.length === 0) return undefined
  const bounds = computeBounds(nodes.map((node) => getAxisAlignedWorldBounds(node, store.graph)))
  return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 }
}

/**
 * Figma's Paste over selection (Cmd+Shift+V): the copied layers land on top of the selected ones,
 * centred on them, rather than where they were copied from. Without a selection it is a paste.
 */
export async function pasteOverSelection(store: EditorStore): Promise<void> {
  const center = selectionCenter(store)
  if (!center) {
    await executeClipboardCommand(store, 'paste')
    return
  }
  try {
    const html = await readClipboardHTML()
    if (!html) {
      toast.error(notificationMessages.get().clipboardMissingDesignData)
      return
    }
    await pasteClipboardHTML(store, html, center)
  } catch (error) {
    console.warn('Paste over selection failed', error)
    toast.error(notificationMessages.get().clipboardAccessBlocked)
  }
}
