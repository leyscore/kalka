import type { EditorStore } from '@/app/editor/active-store'
import { notificationMessages } from '@/app/i18n/notifications'
import { toast } from '@/app/shell/ui'
import { IS_TAURI } from '@/constants'

/** Whether the document has a saved file to go back to. */
export function canRevertToSaved(store: EditorStore): boolean {
  const { handle, path } = store.getSourceIdentity()
  return handle !== null || path !== null
}

/**
 * Figma's File › Revert to saved: reads the document again from its file, after asking when that
 * drops unsaved edits.
 */
export async function revertToSaved(store: EditorStore): Promise<void> {
  const messages = notificationMessages.get()
  if (!canRevertToSaved(store)) {
    toast.info(messages.revertNothingSaved)
    return
  }
  if (store.hasUnsavedChanges()) {
    const question = messages.revertConfirm({ name: store.state.documentName || 'Untitled' })
    const confirmed = IS_TAURI
      ? await (await import('@tauri-apps/plugin-dialog')).ask(question, { kind: 'warning' })
      : window.confirm(question)
    if (!confirmed) return
  }
  await store.reloadFromDisk()
}
